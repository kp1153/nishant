"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Printer, FileText, Inbox, Search, Calendar } from "lucide-react";

const chip = {
  "नकद":    "bg-green-50 text-green-700 border-green-200",
  "यूपीआई": "bg-blue-50 text-blue-700 border-blue-200",
  "उधार":   "bg-amber-50 text-amber-700 border-amber-200",
  "आंशिक":  "bg-purple-50 text-purple-700 border-purple-200",
};

const input = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

function relativeDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "आज";
  if (diffDays === 1) return "कल";
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  return iso.slice(0, 10);
}

export default function BillListPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("सभी");

  useEffect(() => {
    fetch("/api/bill").then(r => r.json()).then(data => { setBills(data); setLoading(false); });
  }, []);

  const filters = ["सभी", "नकद", "यूपीआई", "उधार", "आंशिक"];

  const filtered = bills.filter(row => {
    const matchSearch = !search ||
      row.bill?.billNumber?.toLowerCase().includes(search.toLowerCase()) ||
      row.grahak?.naam?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "सभी" || row.bill?.sthiti === filter;
    return matchSearch && matchFilter;
  });

  const todayTotal = bills
    .filter(row => row.bill?.banaya?.slice(0, 10) === new Date().toISOString().slice(0, 10))
    .reduce((s, r) => s + Number(r.bill?.kulRakam || 0), 0);

  if (loading) return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
      <div className="text-slate-500 mt-3 text-sm">लोड हो रहा है...</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">बिल ब्यौरा</h1>
          <p className="text-sm text-slate-500 mt-1">कुल {bills.length} बिल · आज ₹{todayTotal.toLocaleString("hi-IN")}</p>
        </div>
        <Link href="/dashboard/bill/new"
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition">
          <Plus className="w-4 h-4" strokeWidth={3} />
          नया बिल
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className={input + " pl-10"} placeholder="बिल नंबर या ग्राहक से खोजें..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition ${
                active
                  ? "bg-blue-700 text-white border-blue-700 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
              }`}>
              {f}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-slate-400" strokeWidth={1.8} />
            </div>
            <div className="text-slate-500 font-semibold">{search || filter !== "सभी" ? "कोई बिल नहीं मिला" : "कोई बिल नहीं बना"}</div>
          </div>
        ) : filtered.map((row) => (
          <motion.div key={row.bill.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-xs font-bold text-blue-700">{row.bill.billNumber}</span>
                </div>
                <div className="font-bold mt-1 text-slate-900 truncate">{row.grahak?.naam ?? "—"}</div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{relativeDate(row.bill.banaya)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-extrabold text-green-700 text-lg">₹{row.bill.kulRakam}</div>
                <div className="text-[11px] text-orange-600 mt-0.5">GST: ₹{row.bill.gstRakam ?? 0}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block border ${chip[row.bill.sthiti] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  {row.bill.sthiti}
                </span>
              </div>
            </div>
            <Link href={`/dashboard/bill/${row.bill.id}`}
              className="mt-3 w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold active:scale-95 transition">
              <Printer className="w-4 h-4" />
              प्रिंट करें
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-bold">बिल नं.</th>
              <th className="px-5 py-3 text-left font-bold">ग्राहक</th>
              <th className="px-5 py-3 text-right font-bold">GST से पहले</th>
              <th className="px-5 py-3 text-right font-bold">GST</th>
              <th className="px-5 py-3 text-right font-bold">कुल</th>
              <th className="px-5 py-3 text-left font-bold">भुगतान</th>
              <th className="px-5 py-3 text-left font-bold">तारीख</th>
              <th className="px-5 py-3 text-center font-bold">प्रिंट</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">{search || filter !== "सभी" ? "कोई मिला नहीं" : "कोई बिल नहीं"}</td></tr>
            ) : filtered.map((row) => (
              <tr key={row.bill.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="px-5 py-3 font-bold text-blue-700">{row.bill.billNumber}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">{row.grahak?.naam ?? "—"}</td>
                <td className="px-5 py-3 text-right text-slate-700">₹{row.bill.mulyaBeforeGst ?? 0}</td>
                <td className="px-5 py-3 text-right text-orange-600 font-semibold">₹{row.bill.gstRakam ?? 0}</td>
                <td className="px-5 py-3 text-right font-extrabold text-green-700">₹{row.bill.kulRakam}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${chip[row.bill.sthiti] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {row.bill.sthiti}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{relativeDate(row.bill.banaya)}</td>
                <td className="px-5 py-3 text-center">
                  <Link href={`/dashboard/bill/${row.bill.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                    <Printer className="w-3.5 h-3.5" />
                    प्रिंट
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}