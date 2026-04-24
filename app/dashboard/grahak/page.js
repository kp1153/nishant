import { db } from "@/db";
import { grahak } from "@/db/schema";
import GrahakForm from "./GrahakForm";
import { Phone, MapPin, UserX } from "lucide-react";

const colors = [
  "bg-gradient-to-br from-blue-500 to-blue-700",
  "bg-gradient-to-br from-emerald-500 to-emerald-700",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-purple-500 to-purple-700",
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-indigo-500 to-indigo-700",
];

export default async function GrahakPage() {
  const suchi = await db.select().from(grahak).orderBy(grahak.naam);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">ग्राहक सूची</h1>
        <p className="text-sm text-slate-500 mt-1">कुल {suchi.length} ग्राहक</p>
      </div>

      <GrahakForm />

      <div className="space-y-3 lg:hidden">
        {suchi.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center">
              <UserX className="w-8 h-8 text-slate-400" strokeWidth={1.8} />
            </div>
            <div className="text-slate-500 font-semibold">कोई ग्राहक नहीं जुड़ा</div>
          </div>
        ) : suchi.map((g, i) => (
          <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition">
            <div className={`w-12 h-12 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md`}>
              {g.naam?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 truncate">{g.naam}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{g.mobile}</span>
              </div>
              {g.pata && (
                <div className="flex items-center gap-1 text-xs text-slate-400 truncate mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{g.pata}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-bold">नाम</th>
              <th className="px-5 py-3 text-left font-bold">मोबाइल</th>
              <th className="px-5 py-3 text-left font-bold">पता</th>
            </tr>
          </thead>
          <tbody>
            {suchi.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-400">कोई ग्राहक नहीं</td></tr>
            ) : suchi.map((g, i) => (
              <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {g.naam?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="font-semibold text-slate-900">{g.naam}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700">{g.mobile}</td>
                <td className="px-5 py-3 text-slate-500">{g.pata ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}