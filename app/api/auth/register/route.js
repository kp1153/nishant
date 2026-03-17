import { client } from "@/db"
import { Resend } from "resend"

export async function POST(req) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { phone } = await req.json()

    if (!phone) {
      return Response.json({ success: false, message: "Phone required" }, { status: 400 })
    }

    await client.execute(`CREATE TABLE IF NOT EXISTS nishant_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      phone TEXT,
      trial_start TEXT DEFAULT CURRENT_TIMESTAMP,
      expiry_date TEXT,
      status TEXT NOT NULL DEFAULT 'trial'
    )`)

    const existing = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE phone = ?",
      args: [phone],
    })

    if (existing.rows.length > 0) {
      return Response.json({ success: true, user: existing.rows[0] })
    }

    await client.execute({
      sql: "INSERT INTO nishant_users (phone, status) VALUES (?, 'trial')",
      args: [phone],
    })

    await resend.emails.send({
      from: "Nishant Software <onboarding@resend.dev>",
      to: ["hamaramorcha1153@gmail.com"],
      subject: `नया user — ${phone}`,
      html: `<p>नया user register हुआ।</p><p>Phone: ${phone}</p>`,
    })

    const newUser = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE phone = ?",
      args: [phone],
    })

    return Response.json({ success: true, user: newUser.rows[0] })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}