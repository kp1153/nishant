"use client";
import { useEffect, useState } from "react";

export default function ExpiredPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d?.user?.email) setEmail(d.user.email); })
      .catch(() => {});
  }, []);

  const paymentUrl = `https://nishantsoftwares.in/payment?software=hardware${email ? "&email=" + encodeURIComponent(email) : ""}`;

  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="text-5xl mb-3">⏰</div>
        <h1 className="text-2xl font-bold text-blue-800 mb-2">Trial खत्म हो गया</h1>
        <p className="text-gray-500 text-sm mb-6">
          आपका 7 दिन का मुफ्त trial समाप्त हो गया है।<br />
          License लें और काम जारी रखें।
        </p>
        <div className="bg-blue-50 rounded-2xl p-5 mb-3">
          <p className="text-gray-500 text-xs mb-1">नया License — पहली बार (1 साल शामिल)</p>
          <p className="text-4xl font-extrabold text-blue-700 mb-1">
            ₹4,999 <span className="text-sm font-normal text-gray-500">/साल</span>
          </p>
          <p className="text-gray-400 text-xs">नवीनीकरण: ₹2,500/साल</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left text-sm text-gray-600 space-y-1.5">
          <div>✅ Windows + Android दोनों</div>
          <div>✅ बिल, स्टॉक, उधारी, GST — सब कुछ</div>
          <div>✅ Updates मुफ्त</div>
          <div>✅ WhatsApp support</div>
          <div>✅ Hosting + रखरखाव शामिल</div>
        </div>
        <a href={paymentUrl}
          className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base mb-3 transition-colors">
          License खरीदें — ₹4,999
        </a>
        <a href="https://wa.me/919996865069?text=नमस्ते%2C%20मुझे%20निशांत%20हार्डवेयर%20सॉफ्टवेयर%20का%20License%20लेना%20है।"
          target="_blank" rel="noopener noreferrer"
          className="block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-base mb-5 transition-colors">
          💬 WhatsApp पर बात करें
        </a>
        <a href="/login" className="text-gray-400 text-xs hover:text-gray-600">Login page पर जाएं</a>
      </div>
    </main>
  );
}