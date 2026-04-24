"use client";
import { Store, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Store className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-slate-900">निशांत हार्डवेयर</h1>
          <p className="text-slate-500 text-sm mt-1">बिल · स्टॉक · उधारी · GST</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 text-sm bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-center font-medium"
          >
            Login नहीं हो सका। दोबारा कोशिश करें।
          </motion.div>
        )}

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="/api/auth/google"
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-3.5 px-6 rounded-2xl font-bold text-base hover:bg-slate-800 transition shadow-xl"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google से Login करें
        </motion.a>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-1.5 text-slate-600 text-sm font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>7 दिन बिल्कुल मुफ्त</span>
          </div>
          <div className="flex justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /> कोई कार्ड नहीं</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" strokeWidth={3} /> तुरंत शुरू</span>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginContent />
    </Suspense>
  );
}