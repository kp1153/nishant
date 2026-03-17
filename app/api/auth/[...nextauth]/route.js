import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/db"
import { sql } from "drizzle-orm"
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

      await db.run(sql`CREATE TABLE IF NOT EXISTS nishant_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        phone TEXT,
        trial_start TEXT DEFAULT CURRENT_TIMESTAMP,
        expiry_date TEXT,
        status TEXT NOT NULL DEFAULT 'trial'
      )`)

      const existing = await db.run(sql`SELECT * FROM nishant_users WHERE email = ${email}`)

      if (existing.rows.length === 0) {
        await db.run(sql`INSERT INTO nishant_users (email, name, status) VALUES (${email}, ${user.name}, 'trial')`)

        await resend.emails.send({
          from: "Nishant Software <onboarding@resend.dev>",
          to: ["hamaramorcha1153@gmail.com"],
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
        if (daysPassed >= 7) {
          await db.run(sql`UPDATE nishant_users SET status = 'expired' WHERE email = ${email}`)
          return "/payment"
        }
      }

      return true
    },

    async session({ session }) {
      const email = session.user.email
      const result = await db.run(sql`SELECT * FROM nishant_users WHERE email = ${email}`)
      if (result.rows.length > 0) {
        session.user.dbUser = result.rows[0]
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }