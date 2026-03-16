"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UdhaariChukao({ id, baki, grahakNaam, grahakMobile, dukaanNaam }) {
  const [rakam, setRakam] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function chukao() {
    const r = parseFloat(rakam)
    if (!r || r <= 0 || r > baki) return
    setLoading(true)
    await fetch("/api/udhaari", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rakam: r }),
    })
    setLoading(false)
    setOpen(false)
    setRakam("")
    router.refresh()
  }

  function whatsappReminder() {
    const mobile = grahakMobile?.replace(/\D/g, "")
    const message =
      `नमस्ते ${grahakNaam ?? "जी"} 🙏\n\n` +
      `*${dukaanNaam ?? "हमारी दुकान"}* से आपका ₹${baki} बकाया है।\n\n` +
      `कृपया जल्द भुगतान करें।\n\n` +
      `धन्यवाद 🙏`

    const encoded = encodeURIComponent(message)
    const url = mobile
      ? `https://wa.me/91${mobile}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`

    window.open(url, "_blank")
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">
          💵 चुकाया
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input type="number" placeholder={`₹${baki}`} value={rakam}
            onChange={e => setRakam(e.target.value)}
            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-green-500" />
          <button onClick={chukao} disabled={loading}
            className="text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {loading ? "..." : "✓"}
          </button>
          <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}
      <button onClick={whatsappReminder}
        className="text-xs font-semibold bg-[#25D366] text-white px-3 py-1.5 rounded-lg hover:bg-[#1ebe5d]">
        💬 reminder
      </button>
    </div>
  )
}