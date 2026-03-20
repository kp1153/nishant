import { NextResponse } from "next/server"
import { db } from "@/db"
import { nishantUsers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req) {
  const cookie = req.cookies.get("nishant_session")

  if (!cookie) return NextResponse.json({ ok: false })

  try {
    const session = JSON.parse(decodeURIComponent(escape(atob(cookie.value))))
    const result = await db.select().from(nishantUsers).where(eq(nishantUsers.email, session.email))

    if (result.length === 0) return NextResponse.json({ ok: false })

    return NextResponse.json({ ok: true, user: result[0] })
  } catch (e) {
    return NextResponse.json({ ok: false })
  }
}