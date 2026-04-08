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
    fetch("/api/samaan").then(r => r.json()).then(data => setSuchi([...data].sort((a, b) => a.matra - b.matra)))
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
      setSuchi([...updated].sort((a, b) => a.matra - b.matra))
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
        <h1 className="text-2xl font-extrabold text-gray-900">📦 स्टॉक</h1>
        <button onClick={() => router.push("/dashboard/stock/add")}
          className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-base font-bold">
          ➕ नया सामान
        </button>
      </div>

      {msg && (
        <div className={`text-base px-4 py-3 rounded-xl font-medium ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {shreniList.map(s => (
          <button key={s} onClick={() => setFilter(s === "सभी" ? "" : s)}
            className={`px-3 py-2 rounded-full text-sm font-bold border transition-all ${
              (filter === s || (s === "सभी" && filter === ""))
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="font-extrabold text-gray-900 text-lg">✏️ सामान बदलें</div>
              <button onClick={() => setEditItem(null)} className="text-gray-500 text-2xl">×</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 font-semibold mb-1 block">नाम</label>
                <input className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"
                  value={editItem.naam} onChange={e => setEditItem({ ...editItem, naam: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 font-semibold mb-1 block">खरीद मूल्य ₹</label>
                  <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"
                    value={editItem.kharidMulya} onChange={e => setEditItem({ ...editItem, kharidMulya: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold mb-1 block">बिक्री मूल्य ₹</label>
                  <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"
                    value={editItem.bikriMulya} onChange={e => setEditItem({ ...editItem, bikriMulya: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold mb-1 block">मात्रा</label>
                  <input type="number" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"
                    value={editItem.matra} onChange={e => setEditItem({ ...editItem, matra: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold mb-1 block">इकाई</label>
                  <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"
                    value={editItem.ikaai} onChange={e => setEditItem({ ...editItem, ikaai: e.target.value })}>
                    {ikaaiList.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-semibold mb-1 block">HSN कोड</label>
                  <input className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"
                    value={editItem.hsnCode ?? ""} onChange={e => setEditItem({ ...editItem, hsnCode: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-semibold mb-2 block">GST दर</label>
                <div className="flex gap-2">
                  {gstList.map(g => (
                    <button type="button" key={g} onClick={() => setEditItem({ ...editItem, gstDar: g })}
                      className={`px-4 py-2 rounded-xl text-base font-bold border transition-all ${editItem.gstDar === g ? "bg-blue-700 text-white border-blue-700" : "bg-white text-gray-600 border-gray-300"}`}>
                      {g}%
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-700 text-white py-3 rounded-xl text-base font-bold disabled:opacity-50">
                {loading ? "सेव हो रहा है..." : "✅ सेव करें"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-base">कोई सामान नहीं</div>
        ) : filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-extrabold text-gray-900 text-base">{s.naam}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.shreni} · {s.ikaai}</div>
                <div className="text-sm text-gray-400 mt-0.5">HSN: {s.hsnCode ?? "—"} · GST: {s.gstDar ?? 18}%</div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-extrabold ${s.matra < 5 ? "text-red-600" : "text-green-700"}`}>{s.matra}</div>
                <div className="text-sm text-gray-400">{s.ikaai} बचा</div>
              </div>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-100 text-base">
              <span className="text-gray-600">खरीद: <span className="font-bold text-gray-800">₹{s.kharidMulya}</span></span>
              <span className="text-gray-600">बिक्री: <span className="font-bold text-gray-800">₹{s.bikriMulya}</span></span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditItem({ ...s })}
                className="flex-1 text-sm font-bold border border-blue-300 text-blue-700 py-2 rounded-xl">
                ✏️ बदलें
              </button>
              <button onClick={() => handleDelete(s.id)}
                className="flex-1 text-sm font-bold border border-red-200 text-red-600 py-2 rounded-xl hover:bg-red-50">
                🗑️ हटाएं
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-white text-xs uppercase">
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
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-800">{s.naam}</td>
                <td className="px-5 py-3 text-gray-500">{s.shreni}</td>
                <td className="px-5 py-3 text-gray-500">{s.ikaai}</td>
                <td className="px-5 py-3 text-gray-400">{s.hsnCode ?? "—"}</td>
                <td className="px-5 py-3 text-right text-gray-600">{s.gstDar ?? 18}%</td>
                <td className="px-5 py-3 text-right text-gray-700">₹{s.kharidMulya}</td>
                <td className="px-5 py-3 text-right text-gray-700">₹{s.bikriMulya}</td>
                <td className={`px-5 py-3 text-right font-extrabold text-lg ${s.matra < 5 ? "text-red-600" : "text-green-700"}`}>{s.matra}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setEditItem({ ...s })}
                      className="text-sm text-blue-700 border border-blue-300 px-3 py-1.5 rounded-lg font-semibold">
                      ✏️ बदलें
                    </button>
                    <button onClick={() => handleDelete(s.id)}
                      className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 font-semibold">
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