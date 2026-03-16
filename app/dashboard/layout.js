"use client"

import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      {/* ऊपर मोबाइल टॉपबार की जगह, नीचे बॉटम नेव की जगह */}
      <main className="w-full md:ml-64 flex-1 p-4 pt-16 pb-24 md:pt-6 md:pb-6">
        {children}
      </main>
    </div>
  )
}
