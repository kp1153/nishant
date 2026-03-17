import { NextResponse } from "next/server"
import { client } from "@/db"
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

    const result = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE status = 'active' AND reminder_sent = 0 AND expiry_date <= ? AND expiry_date > ?",
      args: [in15Days.toISOString(), now.toISOString()],
    })

    let sent = 0

    for (const user of result.rows) {
      if (!user.email) continue

      await resend.emails.send({
        from: "Nishant Software <onboarding@resend.dev>",
        to: [user.email],
        subject: "निशांत सॉफ्टवेयर — Renewal reminder",
        html: `<p>नमस्ते ${user.name || ""},</p><p>आपका निशांत सॉफ्टवेयर subscription <strong>${new Date(user.expiry_date).toDateString()}</strong> को expire होगा।</p><p>Renew करने के लिए यहाँ जाएं: <a href="https://nishant-ten.vercel.app/payment">Renew करें</a></p><p>धन्यवाद।</p>`,
      })

      await client.execute({
        sql: "UPDATE nishant_users SET reminder_sent = 1 WHERE email = ?",
        args: [user.email],
      })

      sent++
    }

    return NextResponse.json({ success: true, sent })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}