"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, X } from "lucide-react";

const shreniList = [
  "सेनेटरी वेयर", "नल एवं बाथरूम फिटिंग", "पाइप एवं पाइप फिटिंग",
  "पेन्ट्स एवं वॉटरप्रूफिंग", "इलेक्ट्रिकल", "हैंड टूल्स",
  "पावर टूल्स", "दरवाजे एवं खिड़की", "ताले एवं दरवाजा हार्डवेयर",
  "फास्टनर्स", "मशीनरी एवं पंप", "टाइल्स एवं फ्लोरिंग",
  "बिल्डिंग मटेरियल", "एल्युमीनियम एवं शीट", "अन्य",
];
const ikaaiList = ["नग", "मीटर", "किलो", "लीटर", "पैकेट", "बॉक्स"];
const gstList = [0, 5, 12, 18, 28];

const input = "w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white";

export default function StockForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    naam: "", shreni: "सेनेटरी वेयर", ikaai: "नग",
    kharidMulya: "", bikriMulya: "", matra: "",
    hsnCode: "", gstDar: 18,
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.naam || !form.kharidMulya || !form.bikriMulya) {
      setMsgType("error");
      setMsg("नाम और मूल्य जरूरी है");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/samaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setMsgType("success");
      setMsg("सामान जोड़ा गया");
      setForm({ naam: "", shreni: "सेनेटरी वेयर", ikaai: "नग", kharidMulya: "", bikriMulya: "", matra: "", hsnCode: "", gstDar: 18 });
      router.refresh();
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsgType("error");
      setMsg("कुछ गड़बड़ हुई, दोबारा कोशिश करें");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-white flex items-center gap-2">
        <Plus className="w-4 h-4" strokeWidth={3} />
        <span className="font-bold text-sm">नया सामान जोड़ें</span>
      </div>

      <div className="p-5 space-y-4">
        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl font-semibold border flex items-center gap-2 ${
            msgType === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {msgType === "success" ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">सामान का नाम *</label>
            <input className={input} placeholder="जैसे: गेट वाल्व 1 इंच" value={form.naam}
              onChange={e => setForm({ ...form, naam: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">श्रेणी</label>
            <select className={input} defaultValue={form.shreni}
              onChange={e => setForm({ ...form, shreni: e.target.value })}>
              {shreniList.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">इकाई</label>
            <select className={input} defaultValue={form.ikaai}
              onChange={e => setForm({ ...form, ikaai: e.target.value })}>
              {ikaaiList.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">खरीद मूल्य ₹ *</label>
            <input type="number" className={input} placeholder="0" value={form.kharidMulya}
              onChange={e => setForm({ ...form, kharidMulya: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">बिक्री मूल्य ₹ *</label>
            <input type="number" className={input} placeholder="0" value={form.bikriMulya}
              onChange={e => setForm({ ...form, bikriMulya: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">शुरुआती मात्रा</label>
            <input type="number" className={input} placeholder="0" value={form.matra}
              onChange={e => setForm({ ...form, matra: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-600 font-bold mb-1 block uppercase tracking-wide">HSN कोड</label>
            <input className={input} placeholder="जैसे: 8481" value={form.hsnCode}
              onChange={e => setForm({ ...form, hsnCode: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-600 font-bold mb-2 block uppercase tracking-wide">GST दर</label>
            <div className="flex gap-2 flex-wrap">
              {gstList.map(g => (
                <button type="button" key={g} onClick={() => setForm({ ...form, gstDar: g })}
                  className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition ${
                    form.gstDar === g
                      ? "bg-blue-700 text-white border-blue-700 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                  }`}>
                  {g}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3.5 rounded-xl font-extrabold text-base shadow-lg disabled:opacity-50 active:scale-[0.98] transition">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              जोड़ा जा रहा है...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" strokeWidth={3} />
              जोड़ें
            </>
          )}
        </button>
      </div>
    </form>
  );
}