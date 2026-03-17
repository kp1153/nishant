import { db } from "@/db"
import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const users = sqliteTable("nishant_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull().unique(),
  trialStart: text("trial_start").default(sql`CURRENT_TIMESTAMP`),
  expiryDate: text("expiry_date"),
  status: text("status").notNull().default("trial"),
})

export async function POST(req) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return Response.json({ success: false, message: "Phone required" }, { status: 400 })
    }

    await db.run(sql`CREATE TABLE IF NOT EXISTS nishant_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL UNIQUE,
      trial_start TEXT DEFAULT CURRENT_TIMESTAMP,
      expiry_date TEXT,
      status TEXT NOT NULL DEFAULT 'trial'
    )`)

    const existing = await db.run(sql`SELECT * FROM nishant_users WHERE phone = ${phone}`)

    if (existing.rows.length > 0) {
      return Response.json({ success: true, user: existing.rows[0] })
    }

    await db.run(sql`INSERT INTO nishant_users (phone, status) VALUES (${phone}, 'trial')`)

    await resend.emails.send({
      from: "Nishant Software <onboarding@resend.dev>",
      to: ["hamaramorcha1153@gmail.com"],
      subject: `नया user — ${phone}`,
      html: `<p>नया user register हुआ।</p><p>Phone: ${phone}</p><p>Trial शुरू हो गया।</p>`,
    })

    const newUser = await db.run(sql`SELECT * FROM nishant_users WHERE phone = ${phone}`)

    return Response.json({ success: true, user: newUser.rows[0] })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}