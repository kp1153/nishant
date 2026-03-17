import { db } from "@/db"
import { sql } from "drizzle-orm"

export async function POST(req) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return Response.json({ success: false, message: "Phone required" }, { status: 400 })
    }

    const result = await db.run(sql`SELECT * FROM nishant_users WHERE phone = ${phone}`)

    if (result.rows.length === 0) {
      return Response.json({ success: false, status: "not_found" })
    }

    const user = result.rows[0]

    if (user.status === "active") {
      const expiry = new Date(user.expiry_date)
      const now = new Date()

      if (expiry < now) {
        await db.run(sql`UPDATE nishant_users SET status = 'expired' WHERE phone = ${phone}`)
        return Response.json({ success: false, status: "expired" })
      }

      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
      return Response.json({ success: true, status: "active", daysLeft })
    }

    if (user.status === "trial") {
      const trialStart = new Date(user.trial_start)
      const now = new Date()
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))

      if (daysPassed >= 7) {
        await db.run(sql`UPDATE nishant_users SET status = 'expired' WHERE phone = ${phone}`)
        return Response.json({ success: false, status: "expired" })
      }

      return Response.json({ success: true, status: "trial", daysLeft: 7 - daysPassed })
    }

    if (user.status === "expired") {
      return Response.json({ success: false, status: "expired" })
    }

    return Response.json({ success: false, status: "unknown" })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}