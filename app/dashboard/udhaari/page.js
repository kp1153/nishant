"use client"
import { useEffect, useState } from "react"

export default function UdhaariPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(null)
  const [rakam, setRakam] = useState("")

  useEffect(() => {
    fetch("/api/udhaari")
      .then(r => r.json())
      .then(data => { setList(data); setLoading(false) })
  }, [])

  async function chukao(id, purana) {
    const naya = parseFloat(rakam)
    if (!naya || naya <= 0) return alert("सही रकम डालें")
    const res = await fetch("/api/udhaari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, chukaya: purana + naya }),
    })
    if (res.ok) {
      const updated = await res.json()
      setList(list.map(row => row.udhaari.id === id ? { ...row, udhaari: updated } : row))
      setPaying(null)
      setRakam("")
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">लोड हो रहा है...</div>

  const baaki = list.filter(row => row.udhaari.rakam - row.udhaari.chukaya > 0.01)
  const chuka = list.filter(row => row.udhaari.rakam - row.udhaari.chukaya <= 0.01)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blue-700">💰 उधार बही</h1>

      {baaki.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-sm">कोई बाकी उधार नहीं</div>
      )}

      <div className="space-y-3">
        {baaki.map((row) => {
          const baki = (row.udhaari.rakam - row.udhaari.chukaya).toFixed(2)
          return (
            <div key={row.udhaari.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-800">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-xs text-gray-400">{row.grahak?.mobile}</div>
                  <div className="text-xs text-gray-400 mt-0.5">बिल: {row.bill?.billNumber} · {row.udhaari.banaya?.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">कुल उधार</div>
                  <div className="font-semibold text-gray-700">₹{row.udhaari.rakam}</div>
                  <div className="text-xs text-green-600 mt-0.5">चुकाया: ₹{row.udhaari.chukaya}</div>
                  <div className="font-bold text-red-600 text-lg">बाकी: ₹{baki}</div>
                </div>
              </div>

              {paying === row.udhaari.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    placeholder="रकम डालें"
                    value={rakam}
                    onChange={e => setRakam(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-700 text-gray-800"
                  />
                  <button
                    onClick={() => chukao(row.udhaari.id, row.udhaari.chukaya)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    जमा
                  </button>
                  <button
                    onClick={() => { setPaying(null); setRakam("") }}
                    className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-semibold"
                  >
                    रद्द
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setPaying(row.udhaari.id); setRakam("") }}
                  className="mt-3 w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-800"
                >
                  ✓ रकम चुकाएं
                </button>
              )}
            </div>
          )
        })}
      </div>

      {chuka.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-gray-400 mb-2">✅ चुकाए गए उधार</div>
          <div className="space-y-2">
            {chuka.map((row) => (
              <div key={row.udhaari.id} className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-600 text-sm">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-xs text-gray-400">{row.udhaari.banaya?.slice(0, 10)}</div>
                </div>
                <div className="text-sm font-bold text-green-600">₹{row.udhaari.rakam} ✓</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}