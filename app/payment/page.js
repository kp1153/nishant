"use client";

import { useState } from "react";
import Script from "next/script";

export default function PaymentPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [plan, setPlan] = useState("new");
  const [loading, setLoading] = useState(false);

  const plans = {
    new: { label: "नया — पहली बार (1 साल शामिल)", amount: 5500 },
    renew: { label: "नवीनीकरण — सालाना", amount: 2500 },
  };

  async function handlePayment() {
    if (!form.name || !form.phone) {
      alert("नाम और फोन नंबर जरूरी है");
      return;
    }

    setLoading(true);

    const orderRes = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: plans[plan].amount, plan }),
    });

    const order = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "निशांत हार्डवेयर सॉफ्टवेयर",
      description: plans[plan].label,
      order_id: order.id,
      handler: async function (response) {
        const verifyRes = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            name: form.name,
            email: form.email,
            phone: form.phone,
            plan: plans[plan].label,
          }),
        });

        const data = await verifyRes.json();
        if (data.success) {
          alert("Payment सफल! आपको email मिलेगी।");
        } else {
          alert("कुछ गलत हुआ। WhatsApp करें।");
        }
      },
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#1d4ed8" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            निशांत सॉफ्टवेयर — Payment
          </h1>

          <div className="flex gap-3 mb-6">
            {Object.entries(plans).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setPlan(key)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${plan === key ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
              >
                {val.label}
                <br />
                <span className="text-lg font-bold">₹{val.amount}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="नाम *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            />
            <input
              type="tel"
              placeholder="फोन नंबर *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : `₹${plans[plan].amount} — Pay Now`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            मदद चाहिए?{" "}
            <a
              href="https://wa.me/919996865069"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline"
            >
              WhatsApp करें
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
