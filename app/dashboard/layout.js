"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"

const OFFLINE_TTL = 72 * 60 * 60 * 1000

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [offlineAllowed, setOfflineAllowed] = useState(false)

  useEffect(() => {
    const lastVerified = localStorage.getItem("last_verified")
    if (lastVerified && Date.now() - parseInt(lastVerified) < OFFLINE_TTL) {
      setOfflineAllowed(true)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      if (!offlineAllowed) {
        router.push("/login")
      }
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
  }, [status, session, router, offlineAllowed])

  if (status === "loading" || (status === "unauthenticated" && offlineAllowed)) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="w-full md:ml-64 flex-1 p-4 pt-16 pb-24 md:pt-6 md:pb-6">
          {children}
        </main>
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