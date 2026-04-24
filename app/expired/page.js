"use client";
import { useEffect, useState } from "react";
import { Clock, Check, MessageCircle, ArrowLeft, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function ExpiredPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d?.user?.email) setEmail(d.user.email); })
      .catch(() => {});
  }, []);

  const paymentUrl = `https://nishantsoftwares.in/payment?software=hardware${email ? "&email=" + encodeURIComponent(email) : ""}`;

  const features = [
    "Windows + Android दोनों",
    "बिल, स्टॉक, उधारी, GST",
    "Updates + WhatsApp Support",
    "Hosting + रखरखाव शामिल",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Clock className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Trial खत्म हो गया</h1>
          <p className="text-slate-500 text-sm">
            7 दिन का मुफ्त trial समाप्त। License लेकर काम जारी रखें।
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 mb-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-blue-100 text-xs font-semibold mb-1">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>PREMIUM LICENSE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">₹4,999</span>
              <span className="text-sm text-blue-100">/साल</span>
            </div>
            <p className="text-blue-100 text-xs mt-1">नवीनीकरण: ₹2,500/साल</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 mb-5 space-y-2.5">
          {features.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-2.5 text-sm text-slate-700"
            >
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-700" strokeWidth={3.5} />
              </div>
              <span className="font-medium">{f}</span>
            </motion.div>
          ))}
        </div>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href={paymentUrl}
          className="block w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-center font-bold rounded-2xl text-base mb-3 shadow-xl transition"
        >
          License खरीदें — ₹4,999
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://wa.me/919996865069?text=नमस्ते%2C%20मुझे%20निशांत%20हार्डवेयर%20सॉफ्टवेयर%20का%20License%20लेना%20है।"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-base mb-4 transition shadow-lg"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
          WhatsApp पर बात करें
        </motion.a>

        <a href="/login" className="flex items-center justify-center gap-1 text-slate-400 hover:text-slate-600 text-xs">
          <ArrowLeft className="w-3 h-3" /> Login page पर जाएं
        </a>
      </motion.div>
    </main>
  );
}