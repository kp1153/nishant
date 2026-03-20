import Link from "next/link";

export const metadata = {
  title: "निशांत हार्डवेयर सॉफ्टवेयर | GST Billing & Stock Management",
  description:
    "हार्डवेयर की दुकान के लिए बना सॉफ्टवेयर — बिल, स्टॉक, उधारी, GST रिपोर्ट सब एक जगह। Windows + Android। 7 दिन बिल्कुल मुफ्त।",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-50">
        <span className="text-lg font-bold text-blue-700">
          ⚙️ निशांत सॉफ्टवेयर
        </span>
        <div className="flex gap-3">
          <a
            href="https://wa.me/919996865069"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 font-semibold hover:underline"
          >
            💬 WhatsApp
          </a>
          <Link
            href="/login"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login करें
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 py-16 bg-gradient-to-b from-blue-50 to-white">
        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          🆓 7 दिन बिल्कुल मुफ्त — कोई card नहीं चाहिए
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          हार्डवेयर दुकान का पूरा हिसाब
          <br />
          <span className="text-blue-600">एक ही सॉफ्टवेयर में</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          बिल, स्टॉक, उधारी, GST रिपोर्ट — सब एक जगह। Windows पर भी, Android पर
          भी।
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://pub-36b3216d45d24541a20e55f6b3f26d07.r2.dev/%E0%A4%A8%E0%A4%BF%E0%A4%B6%E0%A4%BE%E0%A4%82%E0%A4%A4%20Setup%200.1.0.exe"
            className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition text-lg"
          >
            🖥️ Windows Download करें (.exe)
          </a>
          <Link
            href="/login"
            className="border-2 border-blue-600 text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition text-lg"
          >
            📱 Android / Web पर खोलें
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">
          क्या-क्या मिलता है?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🧾",
              title: "GST Billing",
              desc: "CGST, SGST के साथ तुरंत बिल बनाओ",
            },
            {
              icon: "📦",
              title: "Stock Management",
              desc: "सामान का पूरा हिसाब — कम हो तो alert",
            },
            {
              icon: "👥",
              title: "ग्राहक सूची",
              desc: "हर ग्राहक की पूरी history एक जगह",
            },
            {
              icon: "💸",
              title: "उधारी ट्रैकर",
              desc: "किसने कितना लिया — WhatsApp reminder",
            },
            {
              icon: "📊",
              title: "Sales Report",
              desc: "रोज, महीने, साल की बिक्री रिपोर्ट",
            },
            {
              icon: "🖨️",
              title: "Print & PDF",
              desc: "बिल print करो या PDF download करो",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="bg-gray-50 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">
            दो तरीके — एक सॉफ्टवेयर
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-4xl mb-4">🖥️</div>
              <h3 className="text-xl font-bold mb-3">Windows Software</h3>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>✅ एक बार install — हमेशा के लिए</li>
                <li>✅ Internet बंद हो तो भी 72 घंटे चलेगा</li>
                <li>✅ बड़ी screen पर आसान billing</li>
                <li>✅ Printer से सीधे bill print</li>
                <li>✅ Windows 10 / 11 — 64-bit</li>
              </ul>
              <a
                href="https://pub-36b3216d45d24541a20e55f6b3f26d07.r2.dev/%E0%A4%A8%E0%A4%BF%E0%A4%B6%E0%A4%BE%E0%A4%82%E0%A4%A4%20Setup%200.1.0.exe"
                className="block text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                ⬇️ Download करें (.exe)
              </a>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Android / Tablet App</h3>
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                <li>
                  ✅ Chrome में install करो — Home Screen पर app जैसा चलेगा
                </li>
                <li>✅ 10 इंच tablet पर बिल्कुल सही</li>
                <li>✅ राह चलते stock और उधारी देखो</li>
                <li>✅ रिपोर्ट कहीं से भी check करो</li>
                <li>✅ Home Screen पर icon — app जैसा लगेगा</li>
              </ul>
              <Link
                href="/login"
                className="block text-center border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
              >
                📱 Web App खोलें
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">कीमत</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-600 text-white rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold mb-1 opacity-80">पहली बार</p>
            <p className="text-5xl font-bold mb-1">₹5,500</p>
            <p className="text-sm opacity-70 mb-6">एक बार — 1 साल शामिल</p>
            <ul className="text-sm space-y-2 mb-8 text-left">
              <li>✅ Windows + Android दोनों</li>
              <li>✅ सभी features</li>
              <li>✅ Updates मुफ्त</li>
              <li>✅ WhatsApp support</li>
              <li>✅ 7 दिन free trial</li>
            </ul>
            <Link
              href="/login"
              className="block bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Trial शुरू करें →
            </Link>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold mb-1 text-gray-500">नवीनीकरण</p>
            <p className="text-5xl font-bold mb-1 text-gray-800">₹2,500</p>
            <p className="text-sm text-gray-400 mb-6">प्रति वर्ष</p>
            <ul className="text-sm space-y-2 mb-8 text-left text-gray-600">
              <li>✅ Windows + Android दोनों</li>
              <li>✅ सभी features</li>
              <li>✅ Updates मुफ्त</li>
              <li>✅ WhatsApp support</li>
              <li>✅ Hosting + रखरखाव</li>
            </ul>
            <Link
              href="/payment"
              className="block border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Renew करें →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white text-center px-6 py-16">
        <h2 className="text-2xl font-bold mb-3">आज ही शुरू करें — मुफ्त में</h2>
        <p className="mb-8 opacity-80">
          7 दिन पूरी तरह मुफ्त। कोई card नहीं, कोई झंझट नहीं।
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://pub-36b3216d45d24541a20e55f6b3f26d07.r2.dev/%E0%A4%A8%E0%A4%BF%E0%A4%B6%E0%A4%BE%E0%A4%82%E0%A4%A4%20Setup%200.1.0.exe"
            className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition"
          >
            🖥️ Windows Download
          </a>
          <Link
            href="/login"
            className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition"
          >
            📱 Android पर खोलें
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-400 px-6 py-8 border-t border-gray-100">
        <p className="mb-2">
          <a href="tel:+919996865069" className="hover:text-blue-600">
            📞 9996865069
          </a>
          &nbsp;|&nbsp;
          <a
            href="mailto:prasad.kamta@gmail.com"
            className="hover:text-blue-600"
          >
            ✉️ prasad.kamta@gmail.com
          </a>
          &nbsp;|&nbsp;
          <a
            href="https://wa.me/919996865069"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600"
          >
            💬 WhatsApp
          </a>
        </p>
        <p>© 2026 निशांत सॉफ्टवेयर — सर्वाधिकार सुरक्षित</p>
      </footer>
    </main>
  );
}
