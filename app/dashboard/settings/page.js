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

  const inp = "w-full border border-gray-300 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500"

  return (
    <div className="space-y-6 max-w-lg pb-20">
      <h1 className="text-2xl font-extrabold text-gray-900">⚙️ सेटिंग्स</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
        <div className="font-extrabold text-gray-800 text-lg border-b border-gray-100 pb-3">🏪 दुकान की जानकारी</div>
        {[
          { label: "दुकान का नाम", name: "naam", placeholder: "जैसे: राम हार्डवेयर एंड सेनेटरी" },
          { label: "पता", name: "pata", placeholder: "गली, मोहल्ला" },
          { label: "शहर", name: "shahar", placeholder: "शहर का नाम" },
          { label: "मोबाइल नंबर", name: "mobile", placeholder: "दुकान का नंबर" },
          { label: "GSTIN", name: "gstin", placeholder: "GST नंबर (वैकल्पिक)" },
          { label: "टैगलाइन", name: "tagline", placeholder: "जैसे: हार्डवेयर · सेनेटरी · पाइप" },
        ].map((f) => (
          <div key={f.name} className="space-y-1.5">
            <div className="text-base text-gray-600 font-semibold">{f.label}</div>
            <input
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className={inp}
            />
          </div>
        ))}
        <button onClick={save} disabled={saving}
          className="w-full bg-blue-700 text-white py-4 rounded-xl font-extrabold text-lg disabled:opacity-40 hover:bg-blue-800 transition-colors">
          {saving ? "सेव हो रहा है..." : saved ? "✅ सेव हो गया" : "सेव करें"}
        </button>
      </div>
    </div>
  )
}