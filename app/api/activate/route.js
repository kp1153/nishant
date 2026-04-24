import { db, client } from "@/db";
import { nishantUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();
    const { email, secret } = body;

    const secretValid =
      authHeader === `Bearer ${process.env.HUB_SECRET}` ||
      secret === process.env.HUB_SECRET;

    if (!secretValid) {
      return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
    }
    if (!email) {
      return Response.json({ success: false, error: "email required" }, { status: 400 });
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryISO = expiry.toISOString();

    const existing = await db
      .select()
      .from(nishantUsers)
      .where(eq(nishantUsers.email, email));

    if (existing.length === 0) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO pre_activations (email) VALUES (?)",
        args: [email],
      });
      return Response.json({ success: true, message: "pre-activated" });
    }

    await db
      .update(nishantUsers)
      .set({
        status: "active",
        active: 1,
        expiryDate: expiryISO,
        reminderSent: 0,
      })
      .where(eq(nishantUsers.email, email));

    return Response.json({ success: true, message: "activated" });
  } catch (err) {
    console.error("[activate]", err);
    return Response.json({ success: false, error: "server error" }, { status: 500 });
  }
}