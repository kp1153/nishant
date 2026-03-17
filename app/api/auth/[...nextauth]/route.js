import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/db"
import { sql } from "drizzle-orm"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email

      await db.run(sql`CREATE TABLE IF NOT EXISTS nishant_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        trial_start TEXT DEFAULT CURRENT_TIMESTAMP,
        expiry_date TEXT,
        status TEXT NOT NULL DEFAULT 'trial'
      )`)

      const existing = await db.run(sql`SELECT * FROM nishant_users WHERE email = ${email}`)

      if (existing.rows.length === 0) {
        await db.run(sql`INSERT INTO nishant_users (email, name, status) VALUES (${email}, ${user.name}, 'trial')`)
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
})

export { handler as GET, handler as POST }