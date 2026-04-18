import { db } from "@/db";
import { nishantUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  const { email, secret } = await request.json();

  if (secret !== process.env.HUB_SECRET) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!email) return Response.json({ error: "email required" }, { status: 400 });

  const existing = await db
    .select()
    .from(nishantUsers)
    .where(eq(nishantUsers.email, email));

  if (existing.length === 0) {
    return Response.json({ error: "user not found" }, { status: 404 });
  }

  await db
    .update(nishantUsers)
    .set({ active: 1 })
    .where(eq(nishantUsers.email, email));

  return Response.json({ ok: true, email });
}