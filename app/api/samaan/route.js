import { db } from "@/db"
import { samaan } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  const all = await db.select().from(samaan).orderBy(samaan.naam)
  return NextResponse.json(all)
}

export async function POST(req) {
  const { naam, shreni, ikaai, kharidMulya, bikriMulya, matra, hsnCode, gstDar } = await req.json()
  if (!naam || !kharidMulya || !bikriMulya) return NextResponse.json({ error: "जरूरी फील्ड खाली है" }, { status: 400 })
  const [newSamaan] = await db.insert(samaan).values({
    naam, shreni, ikaai,
    kharidMulya: parseFloat(kharidMulya),
    bikriMulya: parseFloat(bikriMulya),
    matra: parseInt(matra) || 0,
    hsnCode: hsnCode || null,
    gstDar: parseFloat(gstDar) || 18,
  }).returning()
  return NextResponse.json(newSamaan)
}

export async function PATCH(req) {
  const { id, naam, shreni, ikaai, kharidMulya, bikriMulya, matra, hsnCode, gstDar } = await req.json()
  if (!id) return NextResponse.json({ error: "ID जरूरी है" }, { status: 400 })
  const [updated] = await db.update(samaan).set({
    naam, shreni, ikaai,
    kharidMulya: parseFloat(kharidMulya),
    bikriMulya: parseFloat(bikriMulya),
    matra: parseInt(matra) || 0,
    hsnCode: hsnCode || null,
    gstDar: parseFloat(gstDar) || 18,
  }).where(eq(samaan.id, id)).returning()
  return NextResponse.json(updated)
}

export async function DELETE(req) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "ID जरूरी है" }, { status: 400 })
    await db.delete(samaan).where(eq(samaan.id, id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}