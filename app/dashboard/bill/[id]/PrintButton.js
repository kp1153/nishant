"use client"
import { useRef } from "react"

export default function PrintButton() {
  function handlePrint() {
    const printArea = document.querySelector(".print-area")
    if (!printArea) { window.print(); return; }
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
            .text-blue { color: #0f2d5e; }
            .text-orange { color: #ea580c; }
            .text-gray { color: #6b7280; }
            .border-top { border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body>${printArea.innerHTML}</body>
      </html>
    `)
    w.document.close()
    w.onload = () => { w.focus(); w.print(); w.close(); }
  }

  return (
    <button
      onClick={handlePrint}
      className="bg-[#0f2d5e] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3f7a]">
      🖨️ प्रिंट करें
    </button>
  )
}