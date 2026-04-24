import { db } from "@/db";
import { bill } from "@/db/schema";
import { sql } from "drizzle-orm";
import { FileText, Calendar, TrendingUp } from "lucide-react";

export default async function GSTPage() {
  const mahwari = await db
    .select({
      mahina: sql`strftime('%Y-%m', ${bill.banaya})`,
      bilSankhya: sql`COUNT(*)`,
      kulBikri: sql`SUM(${bill.kulRakam})`,
      kulGst: sql`SUM(${bill.gstRakam})`,
      mulyaBeforeGst: sql`SUM(${bill.mulyaBeforeGst})`,
    })
    .from(bill)
    .groupBy(sql`strftime('%Y-%m', ${bill.banaya})`)
    .orderBy(sql`strftime('%Y-%m', ${bill.banaya}) DESC`);

  const totalGst = mahwari.reduce((s, r) => s + Number(r.kulGst ?? 0), 0);
  const totalSales = mahwari.reduce((s, r) => s + Number(r.kulBikri ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">GST रिपोर्ट</h1>
        <p className="text-sm text-slate-500 mt-1">महीने-वार बिक्री और GST</p>
      </div>

      {mahwari.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-bold mb-1 uppercase tracking-wide">
                <TrendingUp className="w-3 h-3" />
                कुल बिक्री
              </div>
              <div className="text-xl sm:text-2xl font-extrabold">₹{totalSales.toLocaleString("hi-IN")}</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 text-orange-100 text-[10px] font-bold mb-1 uppercase tracking-wide">
                <FileText className="w-3 h-3" />
                कुल GST
              </div>
              <div className="text-xl sm:text-2xl font-extrabold">₹{totalGst.toLocaleString("hi-IN", { maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 lg:hidden">
        {mahwari.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" strokeWidth={1.8} />
            </div>
            <div className="text-slate-500 font-semibold">कोई डेटा नहीं</div>
          </div>
        ) : mahwari.map((row) => {
          const gst = Number(row.kulGst ?? 0);
          const cgst = (gst / 2).toFixed(2);
          const sgst = (gst / 2).toFixed(2);
          return (
            <div key={row.mahina} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-extrabold text-slate-900">{row.mahina}</span>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-bold">{row.bilSankhya} बिल</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-green-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-green-700 font-bold uppercase tracking-wide">कुल बिक्री</div>
                  <div className="font-extrabold text-green-700 text-sm">₹{Number(row.kulBikri).toLocaleString("hi-IN")}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">GST पहले</div>
                  <div className="font-bold text-slate-900 text-sm">₹{Number(row.mulyaBeforeGst).toLocaleString("hi-IN")}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">CGST</div>
                  <div className="text-sm font-bold text-orange-600">₹{cgst}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">SGST</div>
                  <div className="text-sm font-bold text-orange-600">₹{sgst}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">कुल GST</div>
                  <div className="text-sm font-extrabold text-blue-700">₹{gst.toFixed(2)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-bold">महीना</th>
              <th className="px-5 py-3 text-right font-bold">बिल</th>
              <th className="px-5 py-3 text-right font-bold">GST से पहले</th>
              <th className="px-5 py-3 text-right font-bold">CGST</th>
              <th className="px-5 py-3 text-right font-bold">SGST</th>
              <th className="px-5 py-3 text-right font-bold">कुल GST</th>
              <th className="px-5 py-3 text-right font-bold">कुल बिक्री</th>
            </tr>
          </thead>
          <tbody>
            {mahwari.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">कोई डेटा नहीं</td></tr>
            ) : mahwari.map((row) => {
              const gst = Number(row.kulGst ?? 0);
              return (
                <tr key={row.mahina} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-bold text-slate-900">{row.mahina}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{row.bilSankhya}</td>
                  <td className="px-5 py-3 text-right text-slate-700">₹{Number(row.mulyaBeforeGst).toLocaleString("hi-IN")}</td>
                  <td className="px-5 py-3 text-right text-orange-600 font-semibold">₹{(gst / 2).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-orange-600 font-semibold">₹{(gst / 2).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-extrabold text-blue-700">₹{gst.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-extrabold text-green-700">₹{Number(row.kulBikri).toLocaleString("hi-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}