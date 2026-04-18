import { db } from "@/db";
import { bill, billItem, udhaari, samaan } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  const {
    grahakId,
    items,
    bhugtan,
    kul,
    gstRakam,
    mulyaBeforeGst,
    aansikRakam,
  } = await req.json();

  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const billNo = `INV-${yy}${mm}${dd}-${rand}`;

  const [newBill] = await db
    .insert(bill)
    .values({
      billNumber: billNo,
      grahakId: grahakId ?? null,
      grahakNaam: grahakNaam ?? null,
      kulRakam: kul,
      gstRakam: gstRakam ?? 0,
      mulyaBeforeGst: mulyaBeforeGst ?? 0,
      bhugtanVidhi: bhugtan,
      sthiti: bhugtan,
    })
    .returning();

  for (const item of items) {
    await db.insert(billItem).values({
      billId: newBill.id,
      samaanId: item.id ?? null,
      matra: item.matra,
      mulya: item.mulya,
      gstDar: item.gstDar ?? 18,
      cgst: item.cgst ?? 0,
      sgst: item.sgst ?? 0,
      kul: item.kul,
    });

    if (
      item.id &&
      !String(item.id).startsWith("catalog-") &&
      !String(item.id).startsWith("manual-")
    ) {
      await db
        .update(samaan)
        .set({ matra: sql`${samaan.matra} - ${item.matra}` })
        .where(eq(samaan.id, item.id));
    }
  }

  if (bhugtan === "उधार") {
    await db.insert(udhaari).values({
      grahakId: grahakId,
      billId: newBill.id,
      rakam: kul,
      chukaya: 0,
    });
  }

  if (bhugtan === "आंशिक") {
    await db.insert(udhaari).values({
      grahakId: grahakId,
      billId: newBill.id,
      rakam: kul,
      chukaya: parseFloat(aansikRakam) || 0,
    });
  }

  return NextResponse.json({ success: true, billNo, billId: newBill.id });
}
