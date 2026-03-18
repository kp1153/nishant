"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { masterCatalog } from "@/lib/catalog"

const gstList = [0, 5, 12, 18, 28]
const ikaaiList = ["नग", "मीटर", "किलो", "लीटर", "पैकेट", "बॉक्स", "रोल", "सेट", "जोड़ी", "बैग", "वर्ग फीट", "kg"]

export default function StockPage() {
  const router = useRouter()
  const [suchi, setSuchi] = useState([])
  const [editItem, setEditItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [filter, setFilter] = useState("")

  const shreniList = ["सभी", ...masterCatalog.map(c => c.shreni)]

  useEffect(() => {
    fetch("/api/samaan").then(r => r.json()).then(setSuchi)
  }, [])

  const filtered = suchi.filter(s =>
    (filter === "" || filter === "सभी" || s.shreni === filter)
  )

  async function handleEdit(e) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/samaan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editItem),
    })
    setLoading(false)
    if (res.ok) {
      setMsg("✅ सामान अपडेट हुआ")
      setEditItem(null)
      const updated = await fetch("/api/samaan").then(r => r.json())
      setSuchi(updated)
    } else {
      setMsg("❌ कुछ गड़बड़ हुई")
    }
  }

  async function handleDelete(id) {
    if (!confirm("क्या आप यह सामान हटाना चाहते हैं?")) return
    const res = await fetch("/api/samaan", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setSuchi(suchi.filter(s => s.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#0f2d5e]">📦 स्टॉक</h1>
        <button onClick={() => router.push("/dashboard/stock/add")}
          className="bg-[#0f2d5e] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3f7a]">
          ➕ नया सामान
        </button>
      </div>

      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {shreniList.map(s => (
          <button key={s} onClick={() => setFilter(s === "सभी" ? "" : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${(filter === s || (s === "सभी" && filter === "")) ? "bg-blue-50 text-[#0f2d5e] border-[#0f2d5e]" : "bg-white text-gray-600 border-gray-200 hover:border-[#0f2d5e]"}`}>
            {s}
          </button>
        ))}
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-[#0f2d5e]">✏️ सामान संपादित करें</div>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">नाम</label>
                <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                  value={editItem.naam} onChange={e => setEditItem({ ...editItem, naam: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">खरीद मूल्य ₹</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                    value={editItem.kharidMulya} onChange={e => setEditItem({ ...editItem, kharidMulya: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">बिक्री मूल्य ₹</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                    value={editItem.bikriMulya} onChange={e => setEditItem({ ...editItem, bikriMulya: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">मात्रा</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                    value={editItem.matra} onChange={e => setEditItem({ ...editItem, matra: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">इकाई</label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                    value={editItem.ikaai} onChange={e => setEditItem({ ...editItem, ikaai: e.target.value })}>
                    {ikaaiList.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">HSN कोड</label>
                  <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
                    value={editItem.hsnCode ?? ""} onChange={e => setEditItem({ ...editItem, hsnCode: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">GST दर</label>
                <div className="flex gap-2">
                  {gstList.map(g => (
                    <button type="button" key={g} onClick={() => setEditItem({ ...editItem, gstDar: g })}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${editItem.gstDar === g ? "bg-blue-50 text-[#0f2d5e] border-[#0f2d5e]" : "bg-white text-gray-600 border-gray-200"}`}>
                      {g}%
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#0f2d5e] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3f7a] disabled:opacity-50">
                {loading ? "सेव हो रहा है..." : "✅ सेव करें"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-sm">कोई सामान नहीं</div>
        ) : filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-[#0f2d5e]">{s.naam}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.shreni} · {s.ikaai}</div>
                <div className="text-xs text-gray-400 mt-0.5">HSN: {s.hsnCode ?? "—"} · GST: {s.gstDar ?? 18}%</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${s.matra < 5 ? "text-red-600" : "text-green-700"}`}>{s.matra}</div>
                <div className="text-xs text-gray-400">{s.ikaai} बचा</div>
              </div>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 text-sm">
              <span className="text-gray-500">खरीद: <span className="font-semibold text-gray-700">₹{s.kharidMulya}</span></span>
              <span className="text-gray-500">बिक्री: <span className="font-semibold text-[#0f2d5e]">₹{s.bikriMulya}</span></span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditItem({ ...s })}
                className="flex-1 text-xs font-semibold border border-blue-200 text-blue-600 py-1.5 rounded-lg hover:bg-blue-50">
                ✏️ संपादित
              </button>
              <button onClick={() => handleDelete(s.id)}
                className="flex-1 text-xs font-semibold border border-red-200 text-red-600 py-1.5 rounded-lg hover:bg-red-50">
                🗑️ हटाएं
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">नाम</th>
              <th className="px-5 py-3 text-left">श्रेणी</th>
              <th className="px-5 py-3 text-left">इकाई</th>
              <th className="px-5 py-3 text-left">HSN</th>
              <th className="px-5 py-3 text-right">GST%</th>
              <th className="px-5 py-3 text-right">खरीद</th>
              <th className="px-5 py-3 text-right">बिक्री</th>
              <th className="px-5 py-3 text-right">मात्रा</th>
              <th className="px-5 py-3 text-center">कार्य</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-5 py-8 text-center text-gray-400">कोई सामान नहीं</td></tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold">{s.naam}</td>
                <td className="px-5 py-3">{s.shreni}</td>
                <td className="px-5 py-3">{s.ikaai}</td>
                <td className="px-5 py-3 text-gray-400">{s.hsnCode ?? "—"}</td>
                <td className="px-5 py-3 text-right">{s.gstDar ?? 18}%</td>
                <td className="px-5 py-3 text-right">₹{s.kharidMulya}</td>
                <td className="px-5 py-3 text-right">₹{s.bikriMulya}</td>
                <td className={`px-5 py-3 text-right font-bold ${s.matra < 5 ? "text-red-600" : "text-green-700"}`}>{s.matra}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setEditItem({ ...s })}
                      className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50">
                      ✏️ संपादित
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                      🗑️ हटाएं
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}