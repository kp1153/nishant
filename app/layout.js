import { Baloo_2, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import SessionWrapper from "@/components/SessionWrapper"

const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["devanagari"] })
const noto = Noto_Sans_Devanagari({ variable: "--font-noto", subsets: ["devanagari"] })

export const metadata = {
  title: "निशांत हार्डवेयर",
  description: "हार्डवेयर दुकान — बिल, स्टॉक, उधारी, GST रिपोर्ट",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d4ed8",
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="निशांत" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`
        }} />
      </head>
      <body className={`${baloo.variable} ${noto.variable} antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}