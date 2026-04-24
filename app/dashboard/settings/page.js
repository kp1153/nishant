"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Save, Check, Phone, MapPin, FileText, Tag, Building } from "lucide-react";

const fields = [
  { label: "दुकान का नाम", name: "naam", placeholder: "जैसे: राम हार्डवेयर एंड सेनेटरी", Icon: Store },
  { label: "पता", name: "pata", placeholder: "गली, मोहल्ला", Icon: MapPin },
  { label: "शहर", name: "shahar", placeholder: "शहर का नाम", Icon: Building },
  { label: "मोबाइल नंबर", name: "mobile", placeholder: "दुकान का नंबर", Icon: Phone },
  { label: "GSTIN", name: "gstin", placeholder: "GST नंबर (वैकल्पिक)", Icon: FileText },
  { label: "टैगलाइन", name: "tagline", placeholder: "जैसे: हार्डवेयर · सेनेटरी · पाइप", Icon: Tag },
];

export default function SettingsPage() {
  const [form, setForm] = useState({ naam: "", pata: "", shahar: "", mobile: "", gstin: "", tagline: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dukaan").then((r) => r.json()).then((d) => {
      if (d?.naam) setForm(d);
    });
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save() {
    setSaving(true);
    await fetch("/api/dukaan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">सेटिंग्स</h1>
        <p className="text-sm text-slate-500 mt-1">दुकान की जानकारी अपडेट करें</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Store className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-extrabold">दुकान की जानकारी</div>
            <div className="text-xs text-blue-100">बिल पर यही details छपेंगी</div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {fields.map(({ label, name, placeholder, Icon }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-xs text-slate-600 font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                {label}
              </label>
              <input
                name={name}
                value={form[name] ?? ""}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          ))}

          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3.5 rounded-xl font-extrabold text-base shadow-lg disabled:opacity-50 active:scale-[0.98] transition"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                सेव हो रहा है...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" strokeWidth={2.5} />
                सेव करें
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 lg:bottom-8 lg:left-1/2 lg:-translate-x-1/2 lg:right-auto lg:w-auto max-w-sm mx-auto z-30"
          >
            <div className="bg-green-600 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4" strokeWidth={3} />
              </div>
              <div className="font-bold text-sm">सेव हो गया</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}