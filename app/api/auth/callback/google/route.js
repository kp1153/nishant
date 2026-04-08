import { NextResponse } from "next/server"
import { db } from "@/db"
import { nishantUsers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Resend } from "resend"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) return NextResponse.redirect(new URL("/login?error=1", req.url))

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://nishant-ten.vercel.app/api/auth/callback/google",
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json()
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser = await userRes.json()
    const email = googleUser.email
    const name = googleUser.name

    if (email === "prasad.kamta@gmail.com") {
      const session = JSON.stringify({ email, name, status: "active" })
      const encoded = btoa(unescape(encodeURIComponent(session)))
      const response = NextResponse.redirect(new URL("/dashboard", req.url))
      response.cookies.set("nishant_session", encoded, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
      return response
    }

    const existing = await db.select().from(nishantUsers).where(eq(nishantUsers.email, email))

    let dbUser

    if (existing.length === 0) {
      await db.insert(nishantUsers).values({ email, name, status: "trial", reminderSent: 0 })
      const inserted = await db.select().from(nishantUsers).where(eq(nishantUsers.email, email))
      dbUser = inserted[0]

      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: "Nishant Software <onboarding@resend.dev>",
          to: ["prasad.kamta@gmail.com"],
          subject: `नया user — ${email}`,
          html: `<p>Email: ${email}</p><p>Name: ${name}</p>`,
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      dbUser = existing[0]
    }

    if (dbUser.status === "trial") {
      const trialStart = new Date(dbUser.trialStart)
      const daysPassed = Math.floor((Date.now() - trialStart) / (1000 * 60 * 60 * 24))
      if (daysPassed >= 7) {
        await db.update(nishantUsers).set({ status: "expired" }).where(eq(nishantUsers.email, email))
        dbUser.status = "expired"
      }
    }

    if (dbUser.status === "expired") {
      return NextResponse.redirect(
        `https://www.web-developer-kp.com/payment?software=hardware&email=${encodeURIComponent(email)}`
      )
    }

    const session = JSON.stringify({ email, name, status: dbUser.status })
    const encoded = btoa(unescape(encodeURIComponent(session)))
    const response = NextResponse.redirect(new URL("/dashboard", req.url))
    response.cookies.set("nishant_session", encoded, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (e) {
    console.error(e)
    return NextResponse.redirect(new URL("/login?error=1", req.url))
  }
}