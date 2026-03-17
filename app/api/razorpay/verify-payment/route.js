import crypto from "crypto"
import { NextResponse } from "next/server"
import { client } from "@/db"
import { Resend } from "resend"

export async function POST(req) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
      plan,
    } = await req.json()

    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex")

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
    }

    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    const existing = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE email = ?",
      args: [email],
    })

    if (existing.rows.length > 0) {
      await client.execute({
        sql: "UPDATE nishant_users SET status = 'active', expiry_date = ? WHERE email = ?",
        args: [expiryDate.toISOString(), email],
      })
    } else {
      await client.execute({
        sql: "INSERT INTO nishant_users (email, name, phone, status, expiry_date) VALUES (?, ?, ?, 'active', ?)",
        args: [email, name, phone, expiryDate.toISOString()],
      })
    }

    await resend.emails.send({
      from: "Nishant Software <onboarding@resend.dev>",
      to: ["hamaramorcha1153@gmail.com"],
      subject: `नया payment — ${name}`,
      html: `<p>नाम: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p><p>Plan: ${plan}</p><p>Payment ID: ${razorpay_payment_id}</p><p>Expiry: ${expiryDate.toDateString()}</p>`,
    })

    if (email) {
      await resend.emails.send({
        from: "Nishant Software <onboarding@resend.dev>",
        to: [email],
        subject: "निशांत सॉफ्टवेयर — Payment सफल",
        html: `<p>धन्यवाद ${name}!</p><p>आपका payment सफल रहा।</p><p>Expiry: ${expiryDate.toDateString()}</p>`,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}