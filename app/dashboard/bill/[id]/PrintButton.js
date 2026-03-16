"use client"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function PrintButton({ bill, grahak, items, dukaan }) {

  async function downloadPDF() {
    const printArea = document.querySelector(".print-area")
    if (!printArea) return

    const canvas = await html2canvas(printArea, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW - 20
    const imgH = (canvas.height * imgW) / canvas.width

    let y = 10
    let remainH = imgH

    while (remainH > 0) {
      pdf.addImage(imgData, "PNG", 10, y, imgW, imgH)
      remainH -= (pageH - 20)
      if (remainH > 0) {
        pdf.addPage()
        y = -(imgH - remainH)
      }
    }

    pdf.save(`${bill.billNumber}.pdf`)
  }

  function handlePrint() {
    const printArea = document.querySelector(".print-area")
    if (!printArea) { window.print(); return }
    const w = window.open("", "_blank")
    w.document.write(`
      <html>
        <head>
          <title>बिल</title>
          <meta charset="UTF-8" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; padding: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ccc; padding: 6px 8px; }
            th { background: #f5f5f5; font-size: 11px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
          </style>
        </head>
        <body>${printArea.innerHTML}</body>
      </html>
    `)
    w.document.close()
    w.onload = () => { w.focus(); w.print(); w.close() }
  }

  function whatsappBhejo() {
    const mobile = grahak?.mobile?.replace(/\D/g, "")
    const dukaanNaam = dukaan?.naam ?? "हमारी दुकान"
    const samaanList = items.map((row) =>
      `• ${row.samaan?.naam ?? "सामान"} × ${row.bill_item.matra} = ₹${row.bill_item.kul}`
    ).join("\n")

    const message =
      `🧾 *बिल - ${bill.billNumber}*\n` +
      `📅 तारीख: ${bill.banaya?.slice(0, 10)}\n` +
      `🏪 ${dukaanNaam}\n\n` +
      `*सामान:*\n${samaanList}\n\n` +
      `💰 कुल रकम: *₹${bill.kulRakam}*\n` +
      `🧾 GST: ₹${bill.gstRakam}\n` +
      `💳 भुगतान: ${bill.bhugtanVidhi}\n\n` +
      `धन्यवाद! 🙏`

    const encoded = encodeURIComponent(message)
    const url = mobile
      ? `https://wa.me/91${mobile}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`

    window.open(url, "_blank")
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button onClick={handlePrint}
        className="bg-slate-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-600">
        🖨️ प्रिंट करें
      </button>
      <button onClick={downloadPDF}
        className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600">
        📄 PDF डाउनलोड
      </button>
      <button onClick={whatsappBhejo}
        className="bg-[#25D366] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1ebe5d]">
        💬 WhatsApp भेजें
      </button>
    </div>
  )
}