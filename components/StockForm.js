"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { masterCatalog } from "@/lib/catalog"

const ikaaiList = ["नग", "मीटर", "किलो", "लीटर", "पैकेट", "बॉक्स", "रोल", "सेट", "जोड़ी", "बैग", "वर्ग फीट", "kg"]
const gstList = [0, 5, 12, 18, 28]

export default function StockForm() {
  const router = useRouter()
  const [mode, setMode] = useState("catalog")
  const [selectedShreni, setSelectedShreni] = useState(null)
  const [selectedSamaan, setSelectedSamaan] = useState(null)
  const [form, setForm] = useState({
    naam: "", shreni: "", ikaai: "नग",
    kharidMulya: "", bikriMulya: "", matra: "",
    hsnCode: "", gstDar: 18,
  })
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  function catalogSelect(item, shreni) {
    setSelectedSamaan(item)
    setForm({
      naam: item.naam,
      shreni: shreni,
      ikaai: item.ikaai,
      kharidMulya: "",
      bikriMulya: "",
      matra: "",
      hsnCode: item.hsnCode,
      gstDar: item.gstDar,
    })
  }

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
      setForm({ naam: "", shreni: "", ikaai: "नग", kharidMulya: "", bikriMulya: "", matra: "", hsnCode: "", gstDar: 18 })
      setSelectedShreni(null)
      setSelectedSamaan(null)
      router.refresh()
    } else {
      setMsg("❌ कुछ गड़बड़ हुई, दोबारा कोशिश करें")
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">

      <div className="flex gap-2">
        <button onClick={() => setMode("catalog")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${mode === "catalog" ? "bg-[#0f2d5e] text-white border-[#0f2d5e]" : "bg-white text-gray-600 border-gray-200"}`}>
          📋 Catalog से चुनें
        </button>
        <button onClick={() => setMode("manual")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${mode === "manual" ? "bg-[#0f2d5e] text-white border-[#0f2d5e]" : "bg-white text-gray-600 border-gray-200"}`}>
          ✏️ खुद से भरें
        </button>
      </div>

      {mode === "catalog" && !selectedSamaan && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {!selectedShreni ? (
            <>
              <div className="text-sm font-semibold text-gray-600 mb-2">श्रेणी चुनें</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {masterCatalog.map((cat) => (
                  <button key={cat.shreni} onClick={() => setSelectedShreni(cat.shreni)}
                    className="py-3 px-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-[#0f2d5e] hover:text-white hover:border-[#0f2d5e] transition-all text-center">
                    {cat.shreni}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setSelectedShreni(null)} className="text-xs text-blue-600 hover:underline">← वापस</button>
                <span className="text-sm font-semibold text-gray-700">{selectedShreni}</span>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {masterCatalog.find(c => c.shreni === selectedShreni)?.samaan.map((item) => (
                  <div key={item.naam} onClick={() => { catalogSelect(item, selectedShreni); }}
                    className="flex justify-between items-center px-4 py-2.5 rounded-lg hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.naam}</div>
                      <div className="text-xs text-gray-400">HSN: {item.hsnCode} · GST: {item.gstDar}% · {item.ikaai}</div>
                    </div>
                    <span className="text-xs text-blue-600 font-semibold">चुनें →</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {(mode === "manual" || selectedSamaan) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5">
          {selectedSamaan && (
            <div className="flex items-center justify-between mb-4 bg-blue-50 rounded-lg px-4 py-2">
              <span className="text-sm font-semibold text-blue-800">{selectedSamaan.naam}</span>
              <button type="button" onClick={() => { setSelectedSamaan(null); setForm({ naam: "", shreni: "", ikaai: "नग", kharidMulya: "", bikriMulya: "", matra: "", hsnCode: "", gstDar: 18 }) }}
                className="text-xs text-red-500 font-semibold">बदलें</button>
            </div>
          )}

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
              <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                placeholder="श्रेणी" value={form.shreni}
                onChange={e => setForm({ ...form, shreni: e.target.value })} />
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
      )}
    </div>
  )
}