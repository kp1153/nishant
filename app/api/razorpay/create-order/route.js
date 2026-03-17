import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const { amount, plan } = await req.json()

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { plan },
    })

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }
}