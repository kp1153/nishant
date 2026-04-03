import { db } from "@/db"
import { grahak } from "@/db/schema"
import GrahakForm from "./GrahakForm"

export default async function GrahakPage() {
  const suchi = await db.select().from(grahak).orderBy(grahak.naam)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blue-700">👥 ग्राहक सूची</h1>
      <GrahakForm />

      <div className="space-y-3 lg:hidden">
        {suchi.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-sm">कोई ग्राहक नहीं</div>
        ) : suchi.map((g) => (
          <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold flex-shrink-0">
              {g.naam?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-blue-700 truncate">{g.naam}</div>
              <div className="text-xs text-gray-400 mt-0.5">{g.mobile}</div>
              {g.pata && <div className="text-xs text-gray-400 truncate">{g.pata}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">नाम</th>
              <th className="px-5 py-3 text-left">मोबाइल</th>
              <th className="px-5 py-3 text-left">पता</th>
            </tr>
          </thead>
          <tbody>
            {suchi.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">कोई ग्राहक नहीं</td></tr>
            ) : suchi.map((g) => (
              <tr key={g.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-800">{g.naam}</td>
                <td className="px-5 py-3 text-gray-700">{g.mobile}</td>
                <td className="px-5 py-3 text-gray-500">{g.pata ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}