import { db } from "@/db"
import { udhaari, grahak, bill } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const all = await db
    .select()
    .from(udhaari)
    .leftJoin(grahak, eq(udhaari.grahakId, grahak.id))
    .leftJoin(bill, eq(udhaari.billId, bill.id))
    .orderBy(desc(udhaari.banaya))
  return NextResponse.json(all)
}

export async function PATCH(req) {
  const { id, chukaya } = await req.json()
  if (!id) return NextResponse.json({ error: "ID जरूरी है" }, { status: 400 })
  const [updated] = await db
    .update(udhaari)
    .set({ chukaya: parseFloat(chukaya) })
    .where(eq(udhaari.id, id))
    .returning()
  return NextResponse.json(updated)
}