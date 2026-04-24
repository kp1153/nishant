import { db } from "@/db";
import { bill, grahak } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const chip = {
  "नकद":    "bg-green-50 text-green-700 border-green-200",
  "UPI":    "bg-blue-50 text-blue-700 border-blue-200",
  "उधार":   "bg-amber-50 text-amber-700 border-amber-200",
  "आंशिक": "bg-purple-50 text-purple-700 border-purple-200",
};

export default async function BillTable() {
  const aajKeBill = await db
    .select()
    .from(bill)
    .leftJoin(grahak, eq(bill.grahakId, grahak.id))
    .orderBy(desc(bill.banaya))
    .limit(10);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-semibold">हाल के 10 बिल</span>
        <Link href="/dashboard/bill" className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
          सभी देखें <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {aajKeBill.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">कोई बिल नहीं</div>
        ) : aajKeBill.map((row) => (
          <div key={row.bill.id} className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-blue-700">{row.bill.billNumber}</div>
              <div className="text-sm font-semibold text-slate-900 truncate mt-0.5">{row.grahak?.naam ?? "—"}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-extrabold text-green-700">₹{row.bill.kulRakam}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block border ${chip[row.bill.sthiti] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                {row.bill.sthiti}
              </span>
            </div>
          </div>
        ))}
      </div>

      <table className="w-full hidden lg:table">
        <thead>
          <tr className="text-xs text-slate-500 uppercase tracking-wide">
            <th className="pb-2 text-left font-bold">बिल</th>
            <th className="pb-2 text-left font-bold">ग्राहक</th>
            <th className="pb-2 text-right font-bold">रकम</th>
            <th className="pb-2 text-left font-bold">स्थिति</th>
          </tr>
        </thead>
        <tbody>
          {aajKeBill.length === 0 ? (
            <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">कोई बिल नहीं</td></tr>
          ) : aajKeBill.map((row) => (
            <tr key={row.bill.id} className="border-t border-slate-100">
              <td className="py-2.5 text-xs font-bold text-blue-700">{row.bill.billNumber}</td>
              <td className="py-2.5 text-sm font-semibold text-slate-900">{row.grahak?.naam ?? "—"}</td>
              <td className="py-2.5 text-sm font-extrabold text-green-700 text-right">₹{row.bill.kulRakam}</td>
              <td className="py-2.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${chip[row.bill.sthiti] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  {row.bill.sthiti}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}