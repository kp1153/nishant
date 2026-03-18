import { db } from "@/db"
import { udhaari, grahak, dukaan } from "@/db/schema"
import { eq, sql } from "drizzle-orm"
import UdhaariChukao from "./UdhaariChukao"

export default async function UdhaariPage() {
  const baaki = await db
    .select()
    .from(udhaari)
    .leftJoin(grahak, eq(udhaari.grahakId, grahak.id))
    .where(sql`${udhaari.rakam} > ${udhaari.chukaya}`)

  const [dukaanInfo] = await db.select().from(dukaan).limit(1)

  const kul = baaki.reduce((acc, r) => acc + r.udhaari.rakam - r.udhaari.chukaya, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blue-50">💳 उधारी</h1>

      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 inline-block">
        <div className="text-sm text-red-600">कुल बकाया</div>
        <div className="text-3xl font-bold text-red-700">₹{kul.toLocaleString("hi-IN")}</div>
      </div>

      <div className="space-y-3 lg:hidden">
        {baaki.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-sm">कोई उधारी बाकी नहीं</div>
        ) : baaki.map((row) => {
          const baki = row.udhaari.rakam - row.udhaari.chukaya
          const pct = Math.min((row.udhaari.chukaya / row.udhaari.rakam) * 100, 100)
          return (
            <div key={row.udhaari.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-blue-50">{row.grahak?.naam ?? "—"}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{row.grahak?.mobile ?? "—"}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">₹{baki}</div>
                  <div className="text-xs text-gray-400">बाकी</div>
                </div>
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500 mb-1">
                <span>चुकाया: ₹{row.udhaari.chukaya}</span>
                <span>कुल: ₹{row.udhaari.rakam}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
              </div>
              <UdhaariChukao
                id={row.udhaari.id}
                baki={baki}
                grahakNaam={row.grahak?.naam}
                grahakMobile={row.grahak?.mobile}
                dukaanNaam={dukaanInfo?.naam}
              />
            </div>
          )
        })}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">ग्राहक</th>
              <th className="px-5 py-3 text-left">मोबाइल</th>
              <th className="px-5 py-3 text-right">कुल रकम</th>
              <th className="px-5 py-3 text-right">चुकाया</th>
              <th className="px-5 py-3 text-right">बाकी</th>
              <th className="px-5 py-3 text-left">प्रगति</th>
              <th className="px-5 py-3 text-center">कार्रवाई</th>
            </tr>
          </thead>
          <tbody>
            {baaki.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">कोई उधारी बाकी नहीं</td></tr>
            ) : baaki.map((row) => {
              const baki = row.udhaari.rakam - row.udhaari.chukaya
              const pct = Math.min((row.udhaari.chukaya / row.udhaari.rakam) * 100, 100)
              return (
                <tr key={row.udhaari.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold">{row.grahak?.naam ?? "—"}</td>
                  <td className="px-5 py-3">{row.grahak?.mobile ?? "—"}</td>
                  <td className="px-5 py-3 text-right">₹{row.udhaari.rakam}</td>
                  <td className="px-5 py-3 text-right text-green-700">₹{row.udhaari.chukaya}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-600">₹{baki}</td>
                  <td className="px-5 py-3">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <UdhaariChukao
                      id={row.udhaari.id}
                      baki={baki}
                      grahakNaam={row.grahak?.naam}
                      grahakMobile={row.grahak?.mobile}
                      dukaanNaam={dukaanInfo?.naam}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}