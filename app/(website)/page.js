export default function HomePage() {
  return (
    <div>
      <section className="bg-[#0f2d5e] text-white py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">हार्डवेयर एवं सेनेटरी स्टोर</h1>
        <p className="text-white/70 text-base md:text-lg mb-8">आपका भरोसेमंद हार्डवेयर एवं सेनेटरी स्टोर</p>
        <a href="/contact" className="bg-amber-400 text-[#0f2d5e] font-bold px-8 py-3 rounded-lg hover:bg-amber-300 transition-colors">
          संपर्क करें
        </a>
      </section>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#0f2d5e] text-center mb-10">हमारे उत्पाद</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[
            ["🚿", "सेनेटरी वेयर"],
            ["🚰", "नल एवं बाथरूम फिटिंग"],
            ["🪠", "पाइप एवं पाइप फिटिंग"],
            ["🎨", "पेन्ट्स एवं वॉटरप्रूफिंग"],
            ["⚡", "इलेक्ट्रिकल"],
            ["🔨", "हैंड टूल्स"],
            ["🔌", "पावर टूल्स"],
            ["🚪", "दरवाजे एवं खिड़की"],
            ["🔐", "ताले एवं दरवाजा हार्डवेयर"],
            ["🔩", "फास्टनर्स"],
            ["⚙️", "मशीनरी एवं पंप"],
            ["🪟", "टाइल्स एवं फ्लोरिंग"],
            ["📦", "बिल्डिंग मटेरियल"],
            ["🪨", "एल्युमीनियम एवं शीट"],
            ["➕", "अन्य"],
          ].map(([icon, label]) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="font-semibold text-[#0f2d5e] text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#0f2d5e] mb-8">हमसे क्यों खरीदें?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ["✅", "गुणवत्तापूर्ण सामान", "हर सामान उच्च गुणवत्ता का"],
              ["💰", "उचित मूल्य", "किफायती दाम, बेहतर सामान"],
              ["🤝", "विश्वसनीय सेवा", "वर्षों का अनुभव और विश्वास"],
            ].map(([icon, title, desc]) => (
              <div key={title} className="p-6">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="font-bold text-[#0f2d5e] mb-2">{title}</div>
                <div className="text-gray-500 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}