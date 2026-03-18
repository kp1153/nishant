"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function GrahakForm() {
  const router = useRouter()
  const [form, setForm] = useState({ naam: "", mobile: "", pata: "" })
  const [msg, setMsg] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.naam || !form.mobile) return setMsg("नाम और मोबाइल जरूरी है")
    const res = await fetch("/api/grahak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg("ग्राहक जोड़ा गया ✓")
      setForm({ naam: "", mobile: "", pata: "" })
      router.refresh()
    } else {
      setMsg("कुछ गड़बड़ हुई")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 max-w-lg">
      <div className="font-bold text-blue-50">नया ग्राहक जोड़ें</div>
      {msg && <p className="text-sm text-blue-600">{msg}</p>}
      <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-50"
        placeholder="नाम *" value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} />
      <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-50"
        placeholder="मोबाइल *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
      <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-50"
        placeholder="पता" value={form.pata} onChange={e => setForm({ ...form, pata: e.target.value })} />
      <button type="submit" className="bg-blue-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3f7a]">
        जोड़ें
      </button>
    </form>
  )
}
