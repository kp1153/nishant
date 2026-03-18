import { db } from "@/db"
import { udhaari, grahak } from "@/db/schema"
import { eq, sql } from "drizzle-orm"

export default async function UdhaariList() {
  const baaki = await db
    .select()
    .from(udhaari)
    .leftJoin(grahak, eq(udhaari.grahakId, grahak.id))
    .where(sql`${udhaari.rakam} > ${udhaari.chukaya}`)
    .limit(5)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-bold text-blue-50">💳 उधारी बाकी</span>
        <button className="text-xs font-semibold text-[#1a3f7a]">सभी देखें →</button>
      </div>
      <div>
        {baaki.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">कोई उधारी बाकी नहीं</div>
        ) : (
          baaki.map((row) => (
            <div key={row.udhaari.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {row.grahak?.naam?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{row.grahak?.naam ?? "—"}</div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-1.5 rounded-full bg-red-500"
                    style={{ width: `${Math.min((row.udhaari.chukaya / row.udhaari.rakam) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="text-sm font-bold text-red-600 flex-shrink-0">
                ₹{row.udhaari.rakam - row.udhaari.chukaya}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
