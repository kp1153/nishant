"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"

const OFFLINE_TTL = 72 * 60 * 60 * 1000

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const lastVerified = localStorage.getItem("last_verified")
    if (lastVerified && Date.now() - parseInt(lastVerified) < OFFLINE_TTL) {
      setAllowed(true)
      setChecked(true)
      return
    }

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          if (data.user.status === "expired") {
            localStorage.removeItem("last_verified")
            router.push("/payment")
          } else {
            localStorage.setItem("last_verified", Date.now().toString())
            setAllowed(true)
          }
        } else {
          router.push("/login")
        }
        setChecked(true)
      })
      .catch(() => {
        router.push("/login")
        setChecked(true)
      })
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">लोड हो रहा है...</p>
      </div>
    )
  }

  if (!allowed) return null

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="w-full md:ml-64 flex-1 p-4 pt-16 pb-24 md:pt-6 md:pb-6">
        {children}
      </main>
    </div>
  )
}