import { db } from "@/db";
import { bill, grahak, billItem, samaan } from "@/db/schema";
import { eq, desc, sql, lt } from "drizzle-orm";
import {
  TrendingUp,
  Receipt,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  BarChart3,
  Package,
} from "lucide-react";

const MONTH_NAMES = {
  "01": "जनवरी", "02": "फरवरी", "03": "मार्च", "04": "अप्रैल",
  "05": "मई", "06": "जून", "07": "जुलाई", "08": "अगस्त",
  "09": "सितंबर", "10": "अक्टूबर", "11": "नवंबर", "12": "दिसंबर",
};

function formatMahina(ym) {
  if (!ym) return "—";
  const [y, m] = ym.split("-");
  return `${MONTH_NAMES[m] ?? m} ${y}`;
}

function formatRakam(n) {
  return Number(n ?? 0).toLocaleString("hi-IN", { maximumFractionDigits: 2 });
}

const PAYMENT_ICONS = {
  nakad: Banknote,
  upi: Smartphone,
  card: CreditCard,
};

const PAYMENT_LABELS = {
  nakad: "नकद",
  upi: "UPI",
  card: "कार्ड",
};

const PAYMENT_COLORS = {
  nakad: "bg-green-500",
  upi: "bg-blue-500",
  card: "bg-purple-500",
};

export default async function ReportPage() {
  const [mahwari, top, bhugtan, isMonth, isYear, lowStock, topSamaan] =
    await Promise.all([
      // Monthly sales
      db
        .select({
          mahina: sql`strftime('%Y-%m', ${bill.banaya})`,
          bikri: sql`SUM(${bill.kulRakam})`,
          gst: sql`SUM(${bill.gstRakam})`,
          count: sql`COUNT(*)`,
        })
        .from(bill)
        .groupBy(sql`strftime('%Y-%m', ${bill.banaya})`)
        .orderBy(sql`strftime('%Y-%m', ${bill.banaya}) DESC`)
        .limit(12),

      // Top 5 customers
      db
        .select({
          naam: grahak.naam,
          kul: sql`SUM(${bill.kulRakam})`,
          count: sql`COUNT(${bill.id})`,
        })
        .from(bill)
        .leftJoin(grahak, eq(bill.grahakId, grahak.id))
        .groupBy(bill.grahakId)
        .orderBy(sql`SUM(${bill.kulRakam}) DESC`)
        .limit(5),

      // Payment method breakdown
      db
        .select({
          vidhi: bill.bhugtanVidhi,
          kul: sql`SUM(${bill.kulRakam})`,
          count: sql`COUNT(*)`,
        })
        .from(bill)
        .groupBy(bill.bhugtanVidhi),

      // This month stats
      db
        .select({
          bikri: sql`SUM(${bill.kulRakam})`,
          count: sql`COUNT(*)`,
          gst: sql`SUM(${bill.gstRakam})`,
        })
        .from(bill)
        .where(
          sql`strftime('%Y-%m', ${bill.banaya}) = strftime('%Y-%m', 'now')`
        ),

      // This year stats
      db
        .select({ bikri: sql`SUM(${bill.kulRakam})`, count: sql`COUNT(*)` })
        .from(bill)
        .where(sql`strftime('%Y', ${bill.banaya}) = strftime('%Y', 'now')`),

      // Low stock count
      db
        .select({ count: sql`COUNT(*)` })
        .from(samaan)
        .where(lt(samaan.matra, 5)),

      // Top selling items
      db
        .select({
          naam: samaan.naam,
          totalMatra: sql`SUM(${billItem.matra})`,
          totalKul: sql`SUM(${billItem.kul})`,
        })
        .from(billItem)
        .leftJoin(samaan, eq(billItem.samaanId, samaan.id))
        .groupBy(billItem.samaanId)
        .orderBy(sql`SUM(${billItem.kul}) DESC`)
        .limit(5),
    ]);

  const thisMahina = isMonth[0] ?? {};
  const thisYear = isYear[0] ?? {};
  const maxBikri = mahwari.length
    ? Math.max(...mahwari.map((r) => Number(r.bikri ?? 0)))
    : 1;
  const totalSale = bhugtan.reduce((s, r) => s + Number(r.kul ?? 0), 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 flex items-center justify-center shadow-md">
          <BarChart3 className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">रिपोर्ट</h1>
          <p className="text-xs text-slate-500 mt-0.5">बिक्री का पूरा हिसाब</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              इस महीने
            </span>
          </div>
          <div className="text-2xl font-extrabold leading-tight">
            ₹{formatRakam(thisMahina.bikri)}
          </div>
          <div className="text-[11px] opacity-70 mt-1">
            {thisMahina.count ?? 0} बिल · GST ₹
            {formatRakam(thisMahina.gst)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              इस साल
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 leading-tight">
            ₹{formatRakam(thisYear.bikri)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {thisYear.count ?? 0} बिल कुल
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <Receipt className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              कुल बिल
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 leading-tight">
            {mahwari.reduce((s, r) => s + Number(r.count ?? 0), 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            सभी समय
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-red-500">
            <Package className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              कम स्टॉक
            </span>
          </div>
          <div className="text-2xl font-extrabold text-red-600 leading-tight">
            {Number(lowStock[0]?.count ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">सामान 5 से कम</div>
        </div>
      </div>

      {/* Payment Breakdown */}
      {bhugtan.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-4">
            भुगतान विधि
          </h2>
          <div className="space-y-3">
            {bhugtan.map((row) => {
              const Icon =
                PAYMENT_ICONS[row.vidhi] ?? CreditCard;
              const pct =
                totalSale > 0
                  ? Math.round((Number(row.kul ?? 0) / totalSale) * 100)
                  : 0;
              const barColor =
                PAYMENT_COLORS[row.vidhi] ?? "bg-slate-400";
              return (
                <div key={row.vidhi}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-bold text-slate-700">
                        {PAYMENT_LABELS[row.vidhi] ?? row.vidhi}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({row.count} बिल)
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{formatRakam(row.kul)}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Sales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-700" />
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
            माहवारी बिक्री
          </h2>
          <span className="ml-auto text-xs text-slate-400">पिछले 12 महीने</span>
        </div>

        {/* Mobile: Cards */}
        <div className="lg:hidden divide-y divide-slate-50">
          {mahwari.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">
              कोई डेटा नहीं
            </div>
          ) : (
            mahwari.map((row) => {
              const pct =
                maxBikri > 0
                  ? Math.round((Number(row.bikri ?? 0) / maxBikri) * 100)
                  : 0;
              return (
                <div key={row.mahina} className="px-5 py-3.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-800 text-sm">
                      {formatMahina(row.mahina)}
                    </span>
                    <span className="font-extrabold text-green-700 text-sm">
                      ₹{formatRakam(row.bikri)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">
                      {row.count} बिल
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop: Table */}
        <table className="hidden lg:table w-full text-sm">
          <thead className="bg-slate-900 text-white text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-bold">महीना</th>
              <th className="px-5 py-3 text-right font-bold">बिल</th>
              <th className="px-5 py-3 text-right font-bold">GST</th>
              <th className="px-5 py-3 text-right font-bold">कुल बिक्री</th>
              <th className="px-5 py-3 text-left font-bold w-48">ग्राफ</th>
            </tr>
          </thead>
          <tbody>
            {mahwari.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  कोई डेटा नहीं
                </td>
              </tr>
            ) : (
              mahwari.map((row) => {
                const pct =
                  maxBikri > 0
                    ? Math.round((Number(row.bikri ?? 0) / maxBikri) * 100)
                    : 0;
                return (
                  <tr
                    key={row.mahina}
                    className="border-t border-slate-50 hover:bg-slate-50 transition"
                  >
                    <td className="px-5 py-3 font-bold text-slate-800">
                      {formatMahina(row.mahina)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">
                      {row.count}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">
                      ₹{formatRakam(row.gst)}
                    </td>
                    <td className="px-5 py-3 text-right font-extrabold text-green-700">
                      ₹{formatRakam(row.bikri)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Two column — Top Customers + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              शीर्ष 5 ग्राहक
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {top.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                कोई डेटा नहीं
              </div>
            ) : (
              top.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">
                      {row.naam ?? "अज्ञात"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {row.count} बिल
                    </div>
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm shrink-0">
                    ₹{formatRakam(row.kul)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-700" />
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              सबसे ज्यादा बिका
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {topSamaan.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                कोई डेटा नहीं
              </div>
            ) : (
              topSamaan.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">
                      {row.naam ?? "—"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {row.totalMatra} नग बिका
                    </div>
                  </div>
                  <div className="font-extrabold text-green-700 text-sm shrink-0">
                    ₹{formatRakam(row.totalKul)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}