import { client } from "@/db"

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return Response.json({ success: false, message: "Email required" }, { status: 400 })
    }

    const result = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE email = ?",
      args: [email],
    })

    if (result.rows.length === 0) {
      return Response.json({ success: false, status: "not_found" })
    }

    const user = result.rows[0]

    if (user.status === "active") {
      const expiry = new Date(user.expiry_date)
      const now = new Date()

      if (expiry < now) {
        await client.execute({
          sql: "UPDATE nishant_users SET status = 'expired' WHERE email = ?",
          args: [email],
        })
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
        await client.execute({
          sql: "UPDATE nishant_users SET status = 'expired' WHERE email = ?",
          args: [email],
        })
        return Response.json({ success: false, status: "expired" })
      }

      return Response.json({ success: true, status: "trial", daysLeft: 7 - daysPassed })
    }

    return Response.json({ success: false, status: "expired" })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}