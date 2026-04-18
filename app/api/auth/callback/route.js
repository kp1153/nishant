import { google } from "@/lib/google.js";
import { db } from "@/db";
import { nishantUsers } from "@/db/schema";
import { createSession, setSessionCookie } from "@/lib/session.js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
      await db.insert(nishantUsers).values({
        email: user.email,
        name: user.name,
        active: 0,
      });
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
    });

    await setSessionCookie(token);

    if (dbUser.email === "prasad.kamta@gmail.com") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (dbUser.active) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const createdAt = new Date(dbUser.trialStart);
    const diffDays = (new Date() - createdAt) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/expired", request.url));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=failed", request.url));
  }
}