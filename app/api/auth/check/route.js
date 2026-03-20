import { db } from "@/db"
import { nishantUsers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return Response.json({ success: false, message: "Email required" }, { status: 400 })
    }

    const result = await db.select().from(nishantUsers).where(eq(nishantUsers.email, email))

    if (result.length === 0) {
      return Response.json({ success: false, status: "not_found" })
    }

    const user = result[0]

    if (user.status === "active") {
      const expiry = new Date(user.expiryDate)
      const now = new Date()

      if (expiry < now) {
        await db.update(nishantUsers).set({ status: "expired" }).where(eq(nishantUsers.email, email))
        return Response.json({ success: false, status: "expired" })
      }

      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
      return Response.json({ success: true, status: "active", daysLeft })
    }

    if (user.status === "trial") {
      const trialStart = new Date(user.trialStart)
      const now = new Date()
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))

      if (daysPassed >= 7) {
        await db.update(nishantUsers).set({ status: "expired" }).where(eq(nishantUsers.email, email))
        return Response.json({ success: false, status: "expired" })
      }

      return Response.json({ success: true, status: "trial", daysLeft: 7 - daysPassed })
    }

    return Response.json({ success: false, status: "expired" })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}