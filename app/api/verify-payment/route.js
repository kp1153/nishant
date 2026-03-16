import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bill, billItem, udhaari, samaan } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { sendOrderEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items
    } = await req.json();

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [newBill] = await db.insert(bill).values({
      billNumber: `INV-${Date.now()}`,
      grahakId: null,
      kulRakam: totalAmount,
      gstRakam: 0,
      mulyaBeforeGst: 0,
      bhugtanVidhi: 'Razorpay',
      sthiti: 'completed',
    }).returning();

    for (const item of items) {
      await db.insert(billItem).values({
        billId: newBill.id,
        samaanId: item.id,
        matra: item.quantity,
        mulya: item.price,
        gstDar: 18,
        cgst: 0,
        sgst: 0,
        kul: item.price * item.quantity,
      });

      await db.update(samaan)
        .set({ matra: sql`${samaan.matra} - ${item.quantity}` })
        .where(sql`${samaan.id} = ${item.id}`);
    }

    await sendOrderEmail({
      customerDetails,
      items,
      totalAmount,
      orderId: newBill.id
    });

    return NextResponse.json({
      success: true,
      orderId: newBill.id,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}