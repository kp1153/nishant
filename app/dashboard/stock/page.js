"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { masterCatalog } from "@/lib/catalog";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Pencil, Trash2, AlertTriangle, PackageX, Search, Upload } from "lucide-react";

const gstList = [0, 5, 12, 18, 28];
const ikaaiList = ["नग", "मीटर", "किलो", "लीटर", "पैकेट", "बॉक्स", "रोल", "सेट", "जोड़ी", "बैग", "वर्ग फीट", "kg"];

const input = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

export default function StockPage() {
  const router = useRouter();
  const [suchi, setSuchi] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  const shreniList = ["सभी", ...masterCatalog.map(c => c.shreni)];

  useEffect(() => {
    fetch("/api/samaan").then(r => r.json()).then(data => setSuchi([...data].sort((a, b) => a.matra - b.matra)));
  }, []);

  const filtered = suchi.filter(s => {
    const matchFilter = filter === "" || filter === "सभी" || s.shreni === filter;
    const matchSearch = !search || s.naam?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });
  const lowStockCount = suchi.filter(s => s.matra < 5).length;

  async function handleEdit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/samaan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editItem),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("सामान अपडेट हुआ");
      setEditItem(null);
      const updated = await fetch("/api/samaan").then(r => r.json());
      setSuchi([...updated].sort((a, b) => a.matra - b.matra));
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("कुछ गड़बड़ हुई");
    }
  }

  async function handleDelete(id, naam) {
    if (!confirm(`${naam} को हटाना चाहते हैं?`)) return;
    const res = await fetch("/api/samaan", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setSuchi(suchi.filter(s => s.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">स्टॉक</h1>
          <p className="text-sm text-slate-500 mt-1">
            {suchi.length} सामान
            {lowStockCount > 0 && (
              <span className="inline-flex items-center gap-1 ml-2 text-red-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {lowStockCount} कम स्टॉक
              </span>
            )}
          </p>
        </div>
        <button onClick={() => router.push("/dashboard/stock/add")}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition">
          <Plus className="w-4 h-4" strokeWidth={3} />
          नया सामान
        </button>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm px-4 py-3 rounded-xl font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-2">
            <Check className="w-4 h-4" strokeWidth={3} />
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className={input + " pl-10"} placeholder="सामान का नाम खोजें..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 flex-wrap">
        {shreniList.map(s => {
          const active = filter === s || (s === "सभी" && filter === "");
          return (
            <button key={s} onClick={() => setFilter(s === "सभी" ? "" : s)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition ${
                active ? "bg-blue-700 text-white border-blue-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
              }`}>
              {s}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 text-lg">
                  <Pencil className="w-5 h-5 text-blue-700" />
                  सामान बदलें
                </div>
                <button onClick={() => setEditItem(null)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">नाम</label>
                  <input className={input} value={editItem.naam} onChange={e => setEditItem({ ...editItem, naam: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">खरीद ₹</label>
                    <input type="number" className={input} value={editItem.kharidMulya} onChange={e => setEditItem({ ...editItem, kharidMulya: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">बिक्री ₹</label>
                    <input type="number" className={input} value={editItem.bikriMulya} onChange={e => setEditItem({ ...editItem, bikriMulya: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">मात्रा</label>
                    <input type="number" className={input} value={editItem.matra} onChange={e => setEditItem({ ...editItem, matra: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">इकाई</label>
                    <select className={input + " bg-white"} defaultValue={editItem.ikaai}
                      onChange={e => setEditItem({ ...editItem, ikaai: e.target.value })}>
                      {ikaaiList.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">HSN कोड</label>
                    <input className={input} value={editItem.hsnCode ?? ""} onChange={e => setEditItem({ ...editItem, hsnCode: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600 font-bold mb-2 block uppercase tracking-wide">GST दर</label>
                  <div className="flex gap-2 flex-wrap">
                    {gstList.map(g => (
                      <button type="button" key={g} onClick={() => setEditItem({ ...editItem, gstDar: g })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition ${editItem.gstDar === g ? "bg-blue-700 text-white border-blue-700 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"}`}>
                        {g}%
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3.5 rounded-xl text-base font-bold shadow-md disabled:opacity-50 active:scale-[0.98] transition">
                  {loading ? "सेव हो रहा है..." : (<><Check className="w-5 h-5" strokeWidth={3} /> सेव करें</>)}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
              <PackageX className="w-8 h-8 text-slate-400" strokeWidth={1.8} />
            </div>
            <div className="text-slate-500 font-semibold">{search || filter ? "कोई सामान नहीं मिला" : "कोई सामान नहीं"}</div>
          </div>
        ) : filtered.map((s) => {
          const low = s.matra < 5;
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border p-4 shadow-sm ${low ? "border-red-200 ring-1 ring-red-100" : "border-slate-200"}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-slate-900 text-base truncate">{s.naam}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.shreni} · {s.ikaai}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">HSN: {s.hsnCode ?? "—"} · GST: {s.gstDar ?? 18}%</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-3xl font-extrabold ${low ? "text-red-600" : "text-green-700"}`}>{s.matra}</div>
                  <div className="text-[10px] text-slate-400">{s.ikaai}</div>
                  {low && (
                    <div className="inline-flex items-center gap-0.5 text-[10px] text-red-600 font-bold mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      कम
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 text-sm">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase tracking-wide font-semibold">खरीद</span>
                  <span className="font-bold text-slate-900">₹{s.kharidMulya}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block uppercase tracking-wide font-semibold">बिक्री</span>
                  <span className="font-bold text-green-700">₹{s.bikriMulya}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditItem({ ...s })}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold border-2 border-blue-200 text-blue-700 py-2 rounded-xl hover:bg-blue-50 transition">
                  <Pencil className="w-3.5 h-3.5" />
                  बदलें
                </button>
                <button onClick={() => handleDelete(s.id, s.naam)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold border-2 border-red-200 text-red-600 py-2 rounded-xl hover:bg-red-50 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                  हटाएं
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-white text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-bold">नाम</th>
              <th className="px-5 py-3 text-left font-bold">श्रेणी</th>
              <th className="px-5 py-3 text-left font-bold">इकाई</th>
              <th className="px-5 py-3 text-left font-bold">HSN</th>
              <th className="px-5 py-3 text-right font-bold">GST%</th>
              <th className="px-5 py-3 text-right font-bold">खरीद</th>
              <th className="px-5 py-3 text-right font-bold">बिक्री</th>
              <th className="px-5 py-3 text-right font-bold">मात्रा</th>
              <th className="px-5 py-3 text-center font-bold">कार्य</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-400">{search || filter ? "कोई मिला नहीं" : "कोई सामान नहीं"}</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className={`border-t border-slate-100 hover:bg-slate-50 transition ${s.matra < 5 ? "bg-red-50/40" : ""}`}>
                <td className="px-5 py-3 font-semibold text-slate-900">{s.naam}</td>
                <td className="px-5 py-3 text-slate-500">{s.shreni}</td>
                <td className="px-5 py-3 text-slate-500">{s.ikaai}</td>
                <td className="px-5 py-3 text-slate-400">{s.hsnCode ?? "—"}</td>
                <td className="px-5 py-3 text-right text-slate-600">{s.gstDar ?? 18}%</td>
                <td className="px-5 py-3 text-right text-slate-700">₹{s.kharidMulya}</td>
                <td className="px-5 py-3 text-right font-semibold text-green-700">₹{s.bikriMulya}</td>
                <td className={`px-5 py-3 text-right font-extrabold text-lg ${s.matra < 5 ? "text-red-600" : "text-green-700"}`}>{s.matra}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setEditItem({ ...s })}
                      className="w-8 h-8 flex items-center justify-center text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.naam)}
                      className="w-8 h-8 flex items-center justify-center text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}