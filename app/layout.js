import { Baloo_2, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import SessionWrapper from "@/components/SessionWrapper"

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["devanagari"],
})

const noto = Noto_Sans_Devanagari({
  variable: "--font-noto",
  subsets: ["devanagari"],
})

export const metadata = {
  title: "हार्डवेयर मैनेजर",
  description: "हार्डवेयर एवं सेनेटरी स्टोर प्रबंधन प्रणाली",
}

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className={`${baloo.variable} ${noto.variable} antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}