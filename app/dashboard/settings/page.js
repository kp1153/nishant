"use client"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [form, setForm] = useState({ naam: "", pata: "", shahar: "", mobile: "", gstin: "", tagline: "" })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/dukaan").then((r) => r.json()).then((d) => {
      if (d?.naam) setForm(d)
    })
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function save() {
    setSaving(true)
    await fetch("/api/dukaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold text-[#0f2d5e]">⚙️ सेटिंग्स</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="font-bold text-[#0f2d5e] border-b pb-2">दुकान की जानकारी</div>
        {[
          { label: "दुकान का नाम", name: "naam", placeholder: "जैसे: राम हार्डवेयर एंड सेनेटरी" },
          { label: "पता", name: "pata", placeholder: "गली, मोहल्ला" },
          { label: "शहर", name: "shahar", placeholder: "शहर का नाम" },
          { label: "मोबाइल", name: "mobile", placeholder: "दुकान का नंबर" },
          { label: "GSTIN", name: "gstin", placeholder: "GST नंबर (वैकल्पिक)" },
          { label: "टैगलाइन", name: "tagline", placeholder: "जैसे: हार्डवेयर · सेनेटरी · पाइप" },
        ].map((f) => (
          <div key={f.name} className="space-y-1">
            <div className="text-sm text-gray-500">{f.label}</div>
            <input
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f2d5e]"
            />
          </div>
        ))}
        <button onClick={save} disabled={saving}
          className="w-full bg-[#0f2d5e] text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 hover:bg-[#1a3f7a] transition-colors">
          {saving ? "सेव हो रहा है..." : saved ? "✅ सेव हो गया" : "सेव करें"}
        </button>
      </div>
    </div>
  )
}