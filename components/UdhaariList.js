import { db } from "@/db"
import { udhaari, grahak } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import Link from "next/link"

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
        <span className="font-bold text-gray-800 text-base">💳 उधारी बाकी</span>
        <Link href="/dashboard/udhaari" className="text-sm font-semibold text-blue-700">सभी देखें</Link>
      </div>
      <div>
        {baaki.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-base">कोई उधारी बाकी नहीं</div>
        ) : (
          baaki.map((row) => {
            const baki = row.udhaari.rakam - row.udhaari.chukaya
            const mobile = row.grahak?.mobile
const waMsg = `नमस्ते ${row.grahak?.naam}, आपका ₹${baki} बाकी है। कृपया जल्द चुकाएं।`
            return (
              <div key={row.udhaari.id} className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-base font-extrabold flex-shrink-0">
                  {row.grahak?.naam?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-extrabold text-gray-900 truncate">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-sm text-red-600 font-bold mt-0.5">बाकी: ₹{baki}</div>
                </div>
                {mobile && (
                  <a
                    href={`https://wa.me/91${mobile}?text=${encodeURIComponent(waMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    📲 याद दिलाएं
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}