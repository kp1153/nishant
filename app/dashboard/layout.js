"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Package,
  Wallet,
  FilePlus2,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard/bill/new", label: "नया बिल", Icon: FilePlus2 },
  { href: "/dashboard/bill", label: "बिल", Icon: Receipt },
  { href: "/dashboard/grahak", label: "ग्राहक", Icon: Users },
  { href: "/dashboard/stock", label: "सामान", Icon: Package },
  { href: "/dashboard/udhaari", label: "उधार", Icon: Wallet },
  { href: "/dashboard/gst", label: "GST", Icon: FileText },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center group-hover:bg-white/25 transition">
            <Store className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-extrabold text-base leading-tight">
              निशांत हार्डवेयर
            </div>
            <div className="text-[10px] text-blue-100 leading-tight">
              दुकान प्रबंधन
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center transition"
            aria-label="सेटिंग्स"
          >
            <Settings className="w-5 h-5" strokeWidth={2.2} />
          </Link>
          <a
            href="/api/auth/logout"
            className="w-10 h-10 rounded-xl bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition shadow-md"
            aria-label="लॉगआउट"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.2} />
          </a>
        </div>
      </header>

      <nav className="hidden lg:flex bg-white border-b border-slate-200 px-4 gap-1 shadow-sm sticky top-[64px] z-10">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            pathname === "/dashboard"
              ? "border-blue-700 text-blue-700 bg-blue-50"
              : "border-transparent text-slate-600 hover:text-blue-700 hover:bg-slate-50"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>डैशबोर्ड</span>
        </Link>
        {navLinks.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              pathname === href
                ? "border-blue-700 text-blue-700 bg-blue-50"
                : "border-transparent text-slate-600 hover:text-blue-700 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <main className="px-4 py-5 pb-24 lg:pb-8 max-w-6xl mx-auto">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20">
        <div className="grid grid-cols-6">
          {navLinks.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors relative ${
                  active ? "text-blue-700" : "text-slate-500"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-700 rounded-b-full" />
                )}
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
