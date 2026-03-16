import { db } from "@/db"
import { dukaan } from "@/db/schema"
import { NextResponse } from "next/server"

export async function GET() {
  const [info] = await db.select().from(dukaan).limit(1)
  return NextResponse.json(info ?? {})
}

export async function POST(req) {
  const { naam, pata, shahar, mobile, gstin, tagline } = await req.json()
  const existing = await db.select().from(dukaan).limit(1)
  if (existing.length > 0) {
    const [updated] = await db.update(dukaan)
      .set({ naam, pata, shahar, mobile, gstin, tagline })
      .returning()
    return NextResponse.json(updated)
  }
  const [created] = await db.insert(dukaan)
    .values({ naam, pata, shahar, mobile, gstin, tagline })
    .returning()
  return NextResponse.json(created)
}