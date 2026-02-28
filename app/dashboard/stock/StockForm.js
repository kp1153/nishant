"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const shreniList = [
  "सेनेटरी वेयर",
  "नल एवं बाथरूम फिटिंग",
  "पाइप एवं पाइप फिटिंग",
  "पेन्ट्स एवं वॉटरप्रूफिंग",
  "इलेक्ट्रिकल",
  "हैंड टूल्स",
  "पावर टूल्स",
  "दरवाजे एवं खिड़की",
  "ताले एवं दरवाजा हार्डवेयर",
  "फास्टनर्स",
  "मशीनरी एवं पंप",
  "टाइल्स एवं फ्लोरिंग",
  "बिल्डिंग मटेरियल",
  "एल्युमीनियम एवं शीट",
  "अन्य",
]
const ikaaiList = ["नग", "मीटर", "किलो", "लीटर", "पैकेट", "बॉक्स"]
const gstList = [0, 5, 12, 18, 28]

export default function StockForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    naam: "", shreni: "सेनेटरी वेयर", ikaai: "नग",
    kharidMulya: "", bikriMulya: "", matra: "",
    hsnCode: "", gstDar: 18,
  })
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.naam || !form.kharidMulya || !form.bikriMulya) {
      setMsg("❌ नाम और मूल्य जरूरी है")
      return
    }
    setLoading(true)
    const res = await fetch("/api/samaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      setMsg("✅ सामान जोड़ा गया")
      setForm({ naam: "", shreni: "सेनेटरी वेयर", ikaai: "नग", kharidMulya: "", bikriMulya: "", matra: "", hsnCode: "", gstDar: 18 })
      router.refresh()
    } else {
      setMsg("❌ कुछ गड़बड़ हुई, दोबारा कोशिश करें")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 max-w-2xl">
      <div className="font-bold text-[#0f2d5e] mb-4 text-base">नया सामान जोड़ें</div>

      {msg && (
        <div className={`text-sm mb-3 px-4 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 mb-1 block">सामान का नाम *</label>
          <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            placeholder="जैसे: गेट वाल्व 1 इंच" value={form.naam}
            onChange={e => setForm({ ...form, naam: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">श्रेणी</label>
          <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            value={form.shreni} onChange={e => setForm({ ...form, shreni: e.target.value })}>
            {shreniList.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">इकाई</label>
          <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            value={form.ikaai} onChange={e => setForm({ ...form, ikaai: e.target.value })}>
            {ikaaiList.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">खरीद मूल्य (₹) *</label>
          <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            placeholder="0" value={form.kharidMulya}
            onChange={e => setForm({ ...form, kharidMulya: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">बिक्री मूल्य (₹) *</label>
          <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            placeholder="0" value={form.bikriMulya}
            onChange={e => setForm({ ...form, bikriMulya: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">शुरुआती मात्रा</label>
          <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            placeholder="0" value={form.matra}
            onChange={e => setForm({ ...form, matra: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">HSN कोड</label>
          <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            placeholder="जैसे: 8481" value={form.hsnCode}
            onChange={e => setForm({ ...form, hsnCode: e.target.value })} />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 mb-2 block">GST दर</label>
          <div className="flex gap-2 flex-wrap">
            {gstList.map(g => (
              <button type="button" key={g} onClick={() => setForm({ ...form, gstDar: g })}
                className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-all ${form.gstDar === g ? "bg-[#0f2d5e] text-white border-[#0f2d5e]" : "bg-white text-gray-600 border-gray-200 hover:border-[#0f2d5e]"}`}>
                {g}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="mt-5 bg-[#0f2d5e] text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3f7a] disabled:opacity-50">
        {loading ? "जोड़ा जा रहा है..." : "✚ जोड़ें"}
      </button>
    </form>
  )
}