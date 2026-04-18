import { NextResponse } from "next/server"
import { db } from "@/db"
import { nishantUsers } from "@/db/schema"
import { eq, and, lte, gt } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const in15Days = new Date()
    in15Days.setDate(in15Days.getDate() + 15)

    const result = await db.select().from(nishantUsers).where(
      and(
        eq(nishantUsers.active, 1),
        eq(nishantUsers.reminderSent, 0),
        lte(nishantUsers.trialStart, in15Days.toISOString()),
        gt(nishantUsers.trialStart, now.toISOString())
      )
    )

    return NextResponse.json({ success: true, found: result.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}