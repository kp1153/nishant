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

  if (loading) return <div className="text-center py-16 text-gray-400 text-lg">लोड हो रहा है...</div>

  const baaki = list.filter(row => row.udhaari.rakam - row.udhaari.chukaya > 0.01)
  const chuka = list.filter(row => row.udhaari.rakam - row.udhaari.chukaya <= 0.01)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-blue-700">💰 उधार बही</h1>

      {baaki.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-base">कोई बाकी उधार नहीं</div>
      )}

      <div className="space-y-4">
        {baaki.map((row) => {
          const baki = (row.udhaari.rakam - row.udhaari.chukaya).toFixed(2)
          const mobile = row.grahak?.mobile
          const waMsg = `नमस्ते ${row.grahak?.naam}, आपका ₹${baki} बाकी है। कृपया जल्द चुकाएं।`
          return (
            <div key={row.udhaari.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-extrabold text-gray-900 text-xl">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-base text-gray-500 mt-0.5">{mobile}</div>
                  <div className="text-sm text-gray-400 mt-0.5">बिल: {row.bill?.billNumber} · {row.udhaari.banaya?.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">कुल उधार</div>
                  <div className="font-semibold text-gray-700 text-base">₹{row.udhaari.rakam}</div>
                  <div className="text-sm text-green-600 mt-0.5">चुकाया: ₹{row.udhaari.chukaya}</div>
                  <div className="font-extrabold text-red-600 text-2xl mt-1">₹{baki}</div>
                </div>
              </div>

              {mobile && (
                <a
                  href={`https://wa.me/91${mobile}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold text-base hover:bg-green-600 transition"
                >
                  📲 WhatsApp से याद दिलाएं
                </a>
              )}

              {paying === row.udhaari.id ? (
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    placeholder="रकम डालें"
                    value={rakam}
                    onChange={e => setRakam(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-700 text-gray-800"
                  />
                  <button
                    onClick={() => chukao(row.udhaari.id, row.udhaari.chukaya)}
                    className="bg-green-600 text-white px-5 py-3 rounded-xl text-base font-bold hover:bg-green-700"
                  >
                    जमा
                  </button>
                  <button
                    onClick={() => { setPaying(null); setRakam("") }}
                    className="bg-gray-100 text-gray-600 px-4 py-3 rounded-xl text-base font-semibold"
                  >
                    रद्द
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setPaying(row.udhaari.id); setRakam("") }}
                  className="mt-3 w-full bg-blue-700 text-white py-3 rounded-xl text-base font-bold hover:bg-blue-800"
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
          <div className="text-base font-semibold text-gray-400 mb-2">✅ चुकाए गए उधार</div>
          <div className="space-y-2">
            {chuka.map((row) => (
              <div key={row.udhaari.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-700 text-base">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-sm text-gray-400">{row.udhaari.banaya?.slice(0, 10)}</div>
                </div>
                <div className="text-base font-extrabold text-green-600">₹{row.udhaari.rakam} ✓</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}