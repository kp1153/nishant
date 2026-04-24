"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard/bill/new", label: "नया बिल", icon: "🧾" },
  { href: "/dashboard/bill", label: "बिल सूची", icon: "📋" },
  { href: "/dashboard/grahak", label: "ग्राहक", icon: "👥" },
  { href: "/dashboard/samaan", label: "सामान", icon: "📦" },
  { href: "/dashboard/udhaari", label: "उधार", icon: "💰" },
  { href: "/dashboard/gst", label: "GST", icon: "📄" },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="font-bold text-lg">🏪 दुकान</div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="text-blue-200 text-lg flex items-center gap-1"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-sm font-bold">सेटिंग्स</span>
          </Link>
          <a
            href="/api/auth/logout"
            className="text-blue-200 text-lg flex items-center gap-1"
          >
            <span className="text-2xl">🚪</span>
            <span className="text-sm font-bold">लॉगआउट</span>
          </a>
        </div>
      </header>

      <nav className="hidden lg:flex bg-white border-b border-gray-200 px-4 gap-1">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              pathname === l.href
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <span>{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>

      <main className="px-4 py-5 pb-24 lg:pb-8 max-w-5xl mx-auto">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                pathname === l.href ? "text-blue-700" : "text-gray-400"
              }`}
            >
              <span className="text-2xl leading-none">{l.icon}</span>
              <span className="text-xs font-semibold">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}