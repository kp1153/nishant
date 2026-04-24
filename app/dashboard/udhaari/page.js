"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Check, X, Wallet, CheckCircle2, Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const input = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

function relativeDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "आज";
  if (diffDays === 1) return "कल";
  if (diffDays < 30) return `${diffDays} दिन पहले`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} महीने पहले`;
  return iso.slice(0, 10);
}

export default function UdhaariPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [rakam, setRakam] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("oldest");

  useEffect(() => {
    fetch("/api/udhaari").then(r => r.json()).then(data => { setList(data); setLoading(false); });
  }, []);

  async function chukao(id, purana) {
    const naya = parseFloat(rakam);
    if (!naya || naya <= 0) return alert("सही रकम डालें");
    const res = await fetch("/api/udhaari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, chukaya: purana + naya }),
    });
    if (res.ok) {
      const updated = await res.json();
      setList(list.map(row => row.udhaari.id === id ? { ...row, udhaari: updated } : row));
      setPaying(null);
      setRakam("");
    }
  }

  if (loading) return (
    <div className="text-center py-16">
      <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
      <div className="text-slate-500 mt-3 text-sm">लोड हो रहा है...</div>
    </div>
  );

  const baakiAll = list.filter(row => row.udhaari.rakam - row.udhaari.chukaya > 0.01);
  const chuka = list.filter(row => row.udhaari.rakam - row.udhaari.chukaya <= 0.01);

  const baakiFiltered = baakiAll.filter(row =>
    !search ||
    row.grahak?.naam?.toLowerCase().includes(search.toLowerCase()) ||
    row.grahak?.mobile?.includes(search)
  );

  const baaki = [...baakiFiltered].sort((a, b) => {
    const aBaki = a.udhaari.rakam - a.udhaari.chukaya;
    const bBaki = b.udhaari.rakam - b.udhaari.chukaya;
    if (sortBy === "amount") return bBaki - aBaki;
    if (sortBy === "newest") return new Date(b.udhaari.banaya) - new Date(a.udhaari.banaya);
    return new Date(a.udhaari.banaya) - new Date(b.udhaari.banaya);
  });

  const kulBaaki = baakiAll.reduce((s, r) => s + (r.udhaari.rakam - r.udhaari.chukaya), 0);

  const sortOptions = [
    { key: "oldest", label: "पुराना पहले" },
    { key: "newest", label: "नया पहले" },
    { key: "amount", label: "बड़ी रकम पहले" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">उधार बही</h1>
        <p className="text-sm text-slate-500 mt-1">{baakiAll.length} ग्राहकों पर बाकी</p>
      </div>

      {kulBaaki > 0 && (
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-red-100 text-xs font-semibold mb-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>कुल बाकी रकम</span>
            </div>
            <div className="text-3xl font-extrabold">₹{kulBaaki.toLocaleString("hi-IN", { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      )}

      {baakiAll.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2} />
          </div>
          <div className="text-slate-700 font-bold">कोई बाकी उधार नहीं</div>
          <div className="text-xs text-slate-500 mt-1">सब चुक चुके हैं 🎉</div>
        </div>
      )}

      {baakiAll.length > 0 && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className={input + " pl-10"} placeholder="ग्राहक या मोबाइल खोजें..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex gap-2 flex-wrap">
            {sortOptions.map(opt => (
              <button key={opt.key} onClick={() => setSortBy(opt.key)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold border transition ${
                  sortBy === opt.key
                    ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="space-y-3">
        {baaki.map((row) => {
          const baki = (row.udhaari.rakam - row.udhaari.chukaya).toFixed(2);
          const mobile = row.grahak?.mobile;
          const waMsg = `नमस्ते ${row.grahak?.naam}, आपका ₹${baki} बाकी है। कृपया जल्द चुकाएं।`;
          const isPaying = paying === row.udhaari.id;
          return (
            <motion.div key={row.udhaari.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-slate-900 text-lg truncate">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-sm text-slate-500">{mobile}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    {row.bill?.billNumber && (
                      <Link href={`/dashboard/bill/${row.bill.id}`}
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline font-semibold">
                        <FileText className="w-3 h-3" />
                        {row.bill.billNumber}
                      </Link>
                    )}
                    <span>· {relativeDate(row.udhaari.banaya)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">बाकी</div>
                  <div className="font-extrabold text-red-600 text-2xl">₹{baki}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">कुल: ₹{row.udhaari.rakam} · दिया: ₹{row.udhaari.chukaya}</div>
                </div>
              </div>

              {mobile && (
                <a href={`https://wa.me/91${mobile}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition shadow-md active:scale-[0.98]">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp से याद दिलाएं
                </a>
              )}

              <AnimatePresence mode="wait">
                {isPaying ? (
                  <motion.div key="paying" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex gap-2 overflow-hidden">
                    <input type="number" placeholder="रकम" value={rakam} onChange={e => setRakam(e.target.value)}
                      className={input} autoFocus />
                    <button onClick={() => chukao(row.udhaari.id, row.udhaari.chukaya)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-xl font-bold transition flex items-center gap-1">
                      <Check className="w-4 h-4" strokeWidth={3} />
                      जमा
                    </button>
                    <button onClick={() => { setPaying(null); setRakam(""); }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-xl font-semibold transition">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button key="pay-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => { setPaying(row.udhaari.id); setRakam(""); }}
                    className="mt-3 w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-[0.98] transition">
                    रकम चुकाएं
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {chuka.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <div className="text-sm font-bold text-slate-600">चुकाए गए उधार ({chuka.length})</div>
          </div>
          <div className="space-y-2">
            {chuka.map((row) => (
              <div key={row.udhaari.id} className="bg-slate-50 rounded-xl border border-slate-100 p-4 flex justify-between items-center opacity-75">
                <div>
                  <div className="font-bold text-slate-700 text-sm">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-xs text-slate-400">{relativeDate(row.udhaari.banaya)}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-extrabold text-green-600">
                  ₹{row.udhaari.rakam}
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}