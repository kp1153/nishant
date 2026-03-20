import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dukaan = sqliteTable("dukaan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  naam: text("naam").notNull().default("मेरी दुकान"),
  pata: text("pata").default(""),
  shahar: text("shahar").default(""),
  mobile: text("mobile").default(""),
  gstin: text("gstin").default(""),
  tagline: text("tagline").default(""),
});

export const grahak = sqliteTable("grahak", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  naam: text("naam").notNull(),
  mobile: text("mobile").notNull(),
  pata: text("pata"),
  gstin: text("gstin"),
  banaya: text("banaya").default(sql`CURRENT_TIMESTAMP`),
});

export const samaan = sqliteTable("samaan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  naam: text("naam").notNull(),
  shreni: text("shreni").notNull(),
  matra: integer("matra").notNull().default(0),
  kharidMulya: real("kharid_mulya").notNull(),
  bikriMulya: real("bikri_mulya").notNull(),
  ikaai: text("ikaai").notNull(),
  hsnCode: text("hsn_code"),
  gstDar: real("gst_dar").notNull().default(18),
});

export const bill = sqliteTable("bill", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  billNumber: text("bill_number").notNull().unique(),
  grahakId: integer("grahak_id").references(() => grahak.id),
  kulRakam: real("kul_rakam").notNull(),
  gstRakam: real("gst_rakam").notNull().default(0),
  mulyaBeforeGst: real("mulya_before_gst").notNull().default(0),
  bhugtanVidhi: text("bhugtan_vidhi").notNull(),
  sthiti: text("sthiti").notNull().default("nakad"),
  banaya: text("banaya").default(sql`CURRENT_TIMESTAMP`),
});

export const billItem = sqliteTable("bill_item", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  billId: integer("bill_id").references(() => bill.id),
  samaanId: integer("samaan_id").references(() => samaan.id),
  matra: integer("matra").notNull(),
  mulya: real("mulya").notNull(),
  gstDar: real("gst_dar").notNull().default(18),
  cgst: real("cgst").notNull().default(0),
  sgst: real("sgst").notNull().default(0),
  kul: real("kul").notNull(),
});

export const udhaari = sqliteTable("udhaari", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  grahakId: integer("grahak_id").references(() => grahak.id),
  billId: integer("bill_id").references(() => bill.id),
  rakam: real("rakam").notNull(),
  chukaya: real("chukaya").notNull().default(0),
  banaya: text("banaya").default(sql`CURRENT_TIMESTAMP`),
});

export const nishantUsers = sqliteTable("nishant_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email"),
  name: text("name"),
  phone: text("phone"),
  trialStart: text("trial_start").default(sql`CURRENT_TIMESTAMP`),
  expiryDate: text("expiry_date"),
  status: text("status").notNull().default("trial"),
  reminderSent: integer("reminder_sent").default(0),
});
export const views = sqliteTable("views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  count: integer("count"),
});

export const softwarePlans = sqliteTable("software_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  softwareKey: text("software_key"),
  planKey: text("plan_key"),
  label: text("label"),
  amount: real("amount"),
});
