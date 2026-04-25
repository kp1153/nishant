import { db } from "@/db";
import { grahak } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(grahak).orderBy(grahak.naam);
  return NextResponse.json(all);
}

export async function POST(req) {
  const { naam, mobile, pata } = await req.json();
  if (!naam) return NextResponse.json({ error: "नाम जरूरी है" }, { status: 400 });
  const [newGrahak] = await db
    .insert(grahak)
    .values({ naam, mobile: mobile || null, pata: pata || null })
    .returning();
  return NextResponse.json(newGrahak);
}

export async function PATCH(req) {
  const { id, naam, mobile, pata } = await req.json();
  if (!id) return NextResponse.json({ error: "ID जरूरी है" }, { status: 400 });
  if (!naam) return NextResponse.json({ error: "नाम जरूरी है" }, { status: 400 });
  const [updated] = await db
    .update(grahak)
    .set({ naam, mobile: mobile || null, pata: pata || null })
    .where(eq(grahak.id, id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID जरूरी है" }, { status: 400 });
    await db.delete(grahak).where(eq(grahak.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed — पहले इस ग्राहक के पुराने बिल/उधार हटाएं" }, { status: 500 });
  }
}