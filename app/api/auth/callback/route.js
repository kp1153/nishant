import { google } from "@/lib/google.js";
import { db } from "@/db";
import { nishantUsers } from "@/db/schema";
import { createSession } from "@/lib/session.js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function redirectWithCookie(request, path, token) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set("nishant_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_state")?.value;
  const codeVerifier = cookieStore.get("google_code_verifier")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url));
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const accessToken = tokens.accessToken();

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userRes.json();

    let existing = await db
      .select()
      .from(nishantUsers)
      .where(eq(nishantUsers.email, user.email));

    if (existing.length === 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7);

      await db.insert(nishantUsers).values({
        email: user.email,
        name: user.name,
        active: 0,
        status: "trial",
        expiryDate: expiry.toISOString(),
        reminderSent: 0,
      });

      const preAct = await turso.execute({
        sql: "SELECT email FROM pre_activations WHERE email = ?",
        args: [user.email],
      });

      if (preAct.rows.length > 0) {
        const newExpiry = new Date();
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);

        await db
          .update(nishantUsers)
          .set({
            status: "active",
            active: 1,
            expiryDate: newExpiry.toISOString(),
            reminderSent: 0,
          })
          .where(eq(nishantUsers.email, user.email));

        await turso.execute({
          sql: "DELETE FROM pre_activations WHERE email = ?",
          args: [user.email],
        });
      }

      existing = await db
        .select()
        .from(nishantUsers)
        .where(eq(nishantUsers.email, user.email));
    }

    const dbUser = existing[0];

    const token = await createSession({
      user_id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      active: dbUser.active,
      status: dbUser.status,
    });

    if (dbUser.email === "prasad.kamta@gmail.com") {
      return redirectWithCookie(request, "/dashboard", token);
    }

    if (dbUser.active === 1 && dbUser.status === "active") {
      return redirectWithCookie(request, "/dashboard", token);
    }

    const now = new Date();
    const expiryDate = dbUser.expiryDate ? new Date(dbUser.expiryDate) : null;

    if (dbUser.status === "trial" && expiryDate && now < expiryDate) {
      return redirectWithCookie(request, "/dashboard", token);
    }

    return redirectWithCookie(request, "/expired", token);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}