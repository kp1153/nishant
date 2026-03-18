import { NextResponse } from "next/server"
import { client } from "@/db"
import { Resend } from "resend"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=1", req.url))
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback/google`,
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

    await client.execute(`CREATE TABLE IF NOT EXISTS nishant_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      name TEXT,
      phone TEXT,
      trial_start TEXT DEFAULT CURRENT_TIMESTAMP,
      expiry_date TEXT,
      status TEXT NOT NULL DEFAULT 'trial',
      reminder_sent INTEGER DEFAULT 0
    )`)

    const existing = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE email = ?",
      args: [email],
    })

    let dbUser

    if (existing.rows.length === 0) {
      await client.execute({
        sql: "INSERT INTO nishant_users (email, name, status, reminder_sent) VALUES (?, ?, 'trial', 0)",
        args: [email, name],
      })

      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "Nishant Software <onboarding@resend.dev>",
        to: ["prasad.kamta@gmail.com"],
        subject: `नया user — ${email}`,
        html: `<p>नया user register हुआ।</p><p>Email: ${email}</p><p>Name: ${name}</p>`,
      })

      const newUser = await client.execute({
        sql: "SELECT * FROM nishant_users WHERE email = ?",
        args: [email],
      })
      dbUser = newUser.rows[0]
    } else {
      dbUser = existing.rows[0]
    }

    if (dbUser.status === "expired") {
      return NextResponse.redirect(new URL("/payment", req.url))
    }

    if (dbUser.status === "trial") {
      const trialStart = new Date(dbUser.trial_start)
      const now = new Date()
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))

      if (daysPassed >= 7) {
        await client.execute({
          sql: "UPDATE nishant_users SET status = 'expired' WHERE email = ?",
          args: [email],
        })
        return NextResponse.redirect(new URL("/payment", req.url))
      }
    }

    const session = JSON.stringify({ email, name, status: dbUser.status })
    const encoded = Buffer.from(session).toString("base64")

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
    console.error("Google callback error:", e)
    return NextResponse.redirect(new URL("/login?error=1", req.url))
  }
}