"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"

const OFFLINE_TTL = 72 * 60 * 60 * 1000

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      const user = session?.user?.dbUser
      if (!user) return

      if (user.status === "expired") {
        localStorage.removeItem("last_verified")
        router.push("/payment")
        return
      }

      if (user.status === "trial") {
        const trialStart = new Date(user.trial_start)
        const now = new Date()
        const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24))
        if (daysPassed >= 7) {
          localStorage.removeItem("last_verified")
          router.push("/payment")
          return
        }
      }

      localStorage.setItem("last_verified", Date.now().toString())
    }

    if (status === "unauthenticated") {
      const lastVerified = localStorage.getItem("last_verified")
      if (lastVerified && Date.now() - parseInt(lastVerified) < OFFLINE_TTL) {
        return
      }
      router.push("/login")
    }
  }, [status, session, router])

  if (status === "loading") {
    const lastVerified = localStorage.getItem("last_verified")
    if (lastVerified && Date.now() - parseInt(lastVerified) < OFFLINE_TTL) {
      return (
        <div className="flex min-h-screen bg-white">
          <Sidebar />
          <main className="w-full md:ml-64 flex-1 p-4 pt-16 pb-24 md:pt-6 md:pb-6">
            {children}
          </main>
        </div>
      )
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">लोड हो रहा है...</p>
      </div>
    )
  }

  if (status === "unauthenticated") return null

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="w-full md:ml-64 flex-1 p-4 pt-16 pb-24 md:pt-6 md:pb-6">
        {children}
      </main>
    </div>
  )
}