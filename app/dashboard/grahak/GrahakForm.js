"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, User, Phone, MapPin, Check } from "lucide-react";

export default function GrahakForm() {
  const router = useRouter();
  const [form, setForm] = useState({ naam: "", mobile: "", pata: "" });
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.naam || !form.mobile) return setMsg("नाम और मोबाइल जरूरी है");
    const res = await fetch("/api/grahak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
      setForm({ naam: "", mobile: "", pata: "" });
      setMsg("");
      router.refresh();
      setTimeout(() => setSuccess(false), 2500);
    } else {
      setMsg("कुछ गड़बड़ हुई");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-white flex items-center gap-2">
        <UserPlus className="w-4 h-4" strokeWidth={2.5} />
        <span className="font-bold text-sm">नया ग्राहक जोड़ें</span>
      </div>
      <div className="p-5 space-y-3">
        <AnimatePresence>
          {msg && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg font-medium">
              {msg}
            </motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" strokeWidth={3} /> ग्राहक जुड़ गया
            </motion.p>
          )}
        </AnimatePresence>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="नाम *" value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="मोबाइल *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="पता" value={form.pata} onChange={e => setForm({ ...form, pata: e.target.value })} />
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-md active:scale-[0.98]">
          <UserPlus className="w-4 h-4" strokeWidth={2.5} />
          जोड़ें
        </button>
      </div>
    </form>
  );
}