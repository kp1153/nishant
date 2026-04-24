import { NextResponse } from "next/server";
import { getSession } from "@/lib/session.js";
import { db } from "@/db";
import { nishantUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEVELOPER_EMAIL = "prasad.kamta@gmail.com";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    if (session.email === DEVELOPER_EMAIL) {
      return NextResponse.json({
        user: session,
        active: 1,
        status: "active",
        daysLeft: 999,
      });
    }

    const rows = await db
      .select()
      .from(nishantUsers)
      .where(eq(nishantUsers.email, session.email));

    if (rows.length === 0) {
      return NextResponse.json({
        user: session,
        active: 0,
        status: "expired",
        daysLeft: 0,
      });
    }

    const dbUser = rows[0];
    const now = new Date();
    const expiry = dbUser.expiryDate ? new Date(dbUser.expiryDate) : null;

    let daysLeft = 0;
    if (expiry) {
      const diffMs = expiry - now;
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      user: session,
      active: dbUser.active,
      status: dbUser.status,
      daysLeft,
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}