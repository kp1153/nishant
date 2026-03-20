import { NextResponse } from "next/server"
import { db } from "@/db"
import { nishantUsers } from "@/db/schema"
import { eq, and, lte, gt } from "drizzle-orm"
import { Resend } from "resend"

export const dynamic = "force-dynamic"

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const now = new Date()
    const in15Days = new Date()
    in15Days.setDate(in15Days.getDate() + 15)

    const result = await db.select().from(nishantUsers).where(
      and(
        eq(nishantUsers.status, "active"),
        eq(nishantUsers.reminderSent, 0),
        lte(nishantUsers.expiryDate, in15Days.toISOString()),
        gt(nishantUsers.expiryDate, now.toISOString())
      )
    )

    let sent = 0

    for (const user of result) {
      if (!user.email) continue

      await resend.emails.send({
        from: "Nishant Software <onboarding@resend.dev>",
        to: [user.email],
        subject: "निशांत सॉफ्टवेयर — Renewal reminder",
        html: `<p>नमस्ते ${user.name || ""},</p><p>आपका subscription <strong>${new Date(user.expiryDate).toDateString()}</strong> को expire होगा।</p><p><a href="https://www.web-developer-kp.com/payment?software=hardware&email=${encodeURIComponent(user.email)}">Renew करें</a></p>`,
      })

      await db.update(nishantUsers).set({ reminderSent: 1 }).where(eq(nishantUsers.email, user.email))

      sent++
    }

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}