"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, UserX, Search, Pencil, Trash2, X, Check, UserPlus } from "lucide-react";

const colors = [
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-emerald-500 to-emerald-700",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-indigo-500 to-indigo-700",
];

const input = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

export default function GrahakPage() {
  const [suchi, setSuchi] = useState([]);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ naam: "", mobile: "", pata: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/grahak").then(r => r.json()).then(setSuchi);
  }, []);

  function validMobile(m) {
    const cleaned = m?.replace(/\D/g, "");
    return cleaned && cleaned.length === 10;
  }

  async function refresh() {
    const r = await fetch("/api/grahak");
    setSuchi(await r.json());
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.naam || !form.mobile) {
      setMsg("❌ नाम और मोबाइल जरूरी है");
      return;
    }
    if (!validMobile(form.mobile)) {
      setMsg("❌ मोबाइल 10 अंक का होना चाहिए");
      return;
    }
    const duplicate = suchi.find(g => g.mobile === form.mobile);
    if (duplicate) {
      setMsg(`❌ यह मोबाइल पहले से ${duplicate.naam} के नाम से जुड़ा है`);
      return;
    }
    setAdding(true);
    const res = await fetch("/api/grahak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAdding(false);
    if (res.ok) {
      setForm({ naam: "", mobile: "", pata: "" });
      setMsg("✅ ग्राहक जुड़ गया");
      refresh();
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg("❌ कुछ गड़बड़ हुई");
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editItem.naam || !validMobile(editItem.mobile)) {
      setMsg("❌ सही नाम और 10-अंकी मोबाइल डालें");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/grahak", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editItem),
    });
    setLoading(false);
    if (res.ok) {
      setMsg("✅ ग्राहक अपडेट हुआ");
      setEditItem(null);
      refresh();
      setTimeout(() => setMsg(""), 2500);
    } else {
      setMsg("❌ कुछ गड़बड़ हुई");
    }
  }

  async function handleDelete(id, naam) {
    if (!confirm(`${naam} को सूची से हटाना चाहते हैं?`)) return;
    const res = await fetch("/api/grahak", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) refresh();
  }

  const filtered = suchi.filter(g =>
    !search ||
    g.naam?.toLowerCase().includes(search.toLowerCase()) ||
    g.mobile?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">ग्राहक सूची</h1>
        <p className="text-sm text-slate-500 mt-1">कुल {suchi.length} ग्राहक</p>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`text-sm px-4 py-3 rounded-xl font-semibold border flex items-center gap-2 ${msg.startsWith("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4" strokeWidth={2.5} />
          <span className="font-bold text-sm">नया ग्राहक जोड़ें</span>
        </div>
        <div className="p-5 space-y-3">
          <input className={input} placeholder="नाम *" value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} />
          <input className={input} placeholder="मोबाइल * (10 अंक)" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
          <input className={input} placeholder="पता" value={form.pata} onChange={e => setForm({ ...form, pata: e.target.value })} />
          <button type="submit" disabled={adding}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-md active:scale-[0.98] disabled:opacity-50">
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            {adding ? "जोड़ा जा रहा है..." : "जोड़ें"}
          </button>
        </div>
      </form>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className={input + " pl-10"} placeholder="नाम या मोबाइल खोजें..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 text-lg">
                  <Pencil className="w-5 h-5 text-blue-700" />
                  ग्राहक बदलें
                </div>
                <button onClick={() => setEditItem(null)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-3">
                <input className={input} placeholder="नाम" value={editItem.naam}
                  onChange={e => setEditItem({ ...editItem, naam: e.target.value })} />
                <input className={input} placeholder="मोबाइल (10 अंक)" value={editItem.mobile}
                  onChange={e => setEditItem({ ...editItem, mobile: e.target.value })} />
                <input className={input} placeholder="पता" value={editItem.pata ?? ""}
                  onChange={e => setEditItem({ ...editItem, pata: e.target.value })} />
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
              <UserX className="w-8 h-8 text-slate-400" strokeWidth={1.8} />
            </div>
            <div className="text-slate-500 font-semibold">{search ? "कोई ग्राहक नहीं मिला" : "कोई ग्राहक नहीं जुड़ा"}</div>
          </div>
        ) : filtered.map((g, i) => (
          <motion.div key={g.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md`}>
                {g.naam?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate">{g.naam}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>{g.mobile}</span>
                </div>
                {g.pata && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 truncate mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{g.pata}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
              <button onClick={() => setEditItem({ ...g })}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold border-2 border-blue-200 text-blue-700 py-2 rounded-xl hover:bg-blue-50 transition">
                <Pencil className="w-3.5 h-3.5" />
                बदलें
              </button>
              <button onClick={() => handleDelete(g.id, g.naam)}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold border-2 border-red-200 text-red-600 py-2 rounded-xl hover:bg-red-50 transition">
                <Trash2 className="w-3.5 h-3.5" />
                हटाएं
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-bold">नाम</th>
              <th className="px-5 py-3 text-left font-bold">मोबाइल</th>
              <th className="px-5 py-3 text-left font-bold">पता</th>
              <th className="px-5 py-3 text-center font-bold">कार्य</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">{search ? "कोई मिला नहीं" : "कोई ग्राहक नहीं"}</td></tr>
            ) : filtered.map((g, i) => (
              <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {g.naam?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="font-semibold text-slate-900">{g.naam}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700">{g.mobile}</td>
                <td className="px-5 py-3 text-slate-500">{g.pata ?? "—"}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setEditItem({ ...g })}
                      className="w-8 h-8 flex items-center justify-center text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(g.id, g.naam)}
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