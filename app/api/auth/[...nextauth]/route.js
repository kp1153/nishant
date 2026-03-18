import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { client } from "@/db"
import { Resend } from "resend"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const email = user.email

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

      if (existing.rows.length === 0) {
        await client.execute({
          sql: "INSERT INTO nishant_users (email, name, status, reminder_sent) VALUES (?, ?, 'trial', 0)",
          args: [email, user.name],
        })

        await resend.emails.send({
          from: "Nishant Software <onboarding@resend.dev>",
          to: ["prasad.kamta@gmail.com"],
          subject: `नया user — ${email}`,
          html: `<p>नया user register हुआ।</p><p>Email: ${email}</p><p>Name: ${user.name}</p>`,
        })

        return true
      }

      const dbUser = existing.rows[0]

      if (dbUser.status === "expired") {
        return "/payment"
      }

      if (dbUser.status === "trial") {
        const trialStart = new Date(dbUser.trial_start)
        const now = new Date()
        const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))

        if (daysPassed === 6 && !dbUser.reminder_sent) {
          await resend.emails.send({
            from: "Nishant Software <onboarding@resend.dev>",
            to: [email],
            subject: "निशांत सॉफ्टवेयर — Trial कल expire होगा",
            html: `<p>नमस्ते ${user.name},</p><p>आपका 7 दिन का trial कल expire होगा।</p><p>अभी renew करें: <a href="https://nishant-ten.vercel.app/payment">यहाँ क्लिक करें</a></p>`,
          })
          await client.execute({
            sql: "UPDATE nishant_users SET reminder_sent = 1 WHERE email = ?",
            args: [email],
          })
        }

        if (daysPassed >= 7) {
          await client.execute({
            sql: "UPDATE nishant_users SET status = 'expired' WHERE email = ?",
            args: [email],
          })
          return "/payment"
        }
      }

      return true
    },

    async session({ session }) {
      const email = session.user.email
      const result = await client.execute({
        sql: "SELECT * FROM nishant_users WHERE email = ?",
        args: [email],
      })
      if (result.rows.length > 0) {
        session.user.dbUser = result.rows[0]
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  useSecureCookies: true,
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

