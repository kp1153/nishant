"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const menu = [
  { naam: "डैशबोर्ड", path: "/dashboard", icon: "🏠" },
  { naam: "नया बिल", path: "/dashboard/bill/new", icon: "🧾" },
  { naam: "बिल ब्यौरा", path: "/dashboard/bill", icon: "📋" },
  { naam: "उधारी", path: "/dashboard/udhaari", icon: "💳" },
  { naam: "स्टॉक देखें", path: "/dashboard/stock", icon: "📦" },
  { naam: "स्टॉक जोड़ें", path: "/dashboard/stock/add", icon: "➕" },
  { naam: "ग्राहक सूची", path: "/dashboard/grahak", icon: "👥" },
  { naam: "बिक्री रिपोर्ट", path: "/dashboard/report", icon: "📊" },
  { naam: "GST रिपोर्ट", path: "/dashboard/gst", icon: "📄" },
  { naam: "सेटिंग्स", path: "/dashboard/settings", icon: "⚙️" },
];

const bottomNav = [
  { naam: "होम", path: "/dashboard", icon: "🏠" },
  { naam: "नया बिल", path: "/dashboard/bill/new", icon: "🧾" },
  { naam: "उधारी", path: "/dashboard/udhaari", icon: "💳" },
  { naam: "स्टॉक", path: "/dashboard/stock", icon: "📦" },
  { naam: "और", path: null, icon: "☰" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 h-screen flex-col fixed top-0 left-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <div className="text-2xl font-extrabold text-[#0f2d5e] tracking-wide">
            निशांत
          </div>
          <div className="text-gray-400 text-xs mt-1">हार्डवेयर प्रबंधन</div>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm shadow">
              नि
            </div>
            <div>
              <div className="text-[#0f2d5e] text-xs font-semibold">
                व्यवस्थापक
              </div>
              <div className="text-gray-400 text-[10px]">प्रोप्राइटर</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all rounded-lg mx-2 mb-0.5
                ${
                  pathname === item.path
                    ? "bg-blue-50 text-[#0f2d5e]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#0f2d5e]"
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.naam}</span>
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-400 border-t border-gray-200 hover:bg-gray-50 hover:text-[#0f2d5e] transition-all flex-shrink-0"
        >
          <span>🚪</span>
          <span>लॉगआउट</span>
        </button>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 shadow-sm">
        <div className="text-[#0f2d5e] font-extrabold text-lg tracking-wide">
          निशांत
        </div>
        <div className="text-gray-400 text-xs">हार्डवेयर प्रबंधन</div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {bottomNav.map((item) =>
          item.path ? (
            <Link
              key={item.path}
              href={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-all
                ${pathname === item.path ? "text-[#0f2d5e]" : "text-gray-400 hover:text-[#0f2d5e]"}`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.naam}
            </Link>
          ) : (
            <button
              key="meer"
              onClick={() => setDrawerOpen(true)}
              className="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium text-gray-400 hover:text-[#0f2d5e] transition-all"
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.naam}
            </button>
          ),
        )}
      </div>

      {/* MOBILE DRAWER */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-2xl p-4 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#0f2d5e] font-semibold">सभी विकल्प</div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {menu.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all
                    ${
                      pathname === item.path
                        ? "bg-blue-50 text-[#0f2d5e]"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  {item.naam}
                </Link>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-all"
            >
              <span>🚪</span> लॉगआउट
            </button>
          </div>
        </div>
      )}
    </>
  );
}
