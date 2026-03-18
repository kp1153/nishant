import { db } from "@/db"
import { bill, billItem, samaan } from "@/db/schema"
import { sql, eq } from "drizzle-orm"

export default async function GSTPage() {
  const mahwari = await db
    .select({
      mahina: sql`strftime('%Y-%m', ${bill.banaya})`,
      bilSankhya: sql`COUNT(*)`,
      kulBikri: sql`SUM(${bill.kulRakam})`,
      kulGst: sql`SUM(${bill.gstRakam})`,
      mulyaBeforeGst: sql`SUM(${bill.mulyaBeforeGst})`,
    })
    .from(bill)
    .groupBy(sql`strftime('%Y-%m', ${bill.banaya})`)
    .orderBy(sql`strftime('%Y-%m', ${bill.banaya}) DESC`)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-blue-50">📄 GST रिपोर्ट</h1>

      {/* मोबाइल कार्ड */}
      <div className="space-y-3 lg:hidden">
        {mahwari.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-gray-400 text-sm">कोई डेटा नहीं</div>
        ) : mahwari.map((row) => {
          const gst = Number(row.kulGst ?? 0)
          const cgst = (gst / 2).toFixed(2)
          const sgst = (gst / 2).toFixed(2)
          return (
            <div key={row.mahina} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-50">{row.mahina}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">{row.bilSankhya} बिल</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">कुल बिक्री</span>
                <span className="font-bold text-green-700">₹{Number(row.kulBikri).toLocaleString("hi-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GST से पहले</span>
                <span className="font-semibold">₹{Number(row.mulyaBeforeGst).toLocaleString("hi-IN")}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-gray-400">CGST</div>
                  <div className="text-sm font-bold text-orange-600">₹{cgst}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">SGST</div>
                  <div className="text-sm font-bold text-orange-600">₹{sgst}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">कुल GST</div>
                  <div className="text-sm font-bold text-blue-700">₹{gst.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* डेस्कटॉप टेबल */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">महीना</th>
              <th className="px-5 py-3 text-right">बिल</th>
              <th className="px-5 py-3 text-right">GST से पहले</th>
              <th className="px-5 py-3 text-right">CGST</th>
              <th className="px-5 py-3 text-right">SGST</th>
              <th className="px-5 py-3 text-right">कुल GST</th>
              <th className="px-5 py-3 text-right">कुल बिक्री</th>
            </tr>
          </thead>
          <tbody>
            {mahwari.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">कोई डेटा नहीं</td></tr>
            ) : mahwari.map((row) => {
              const gst = Number(row.kulGst ?? 0)
              return (
                <tr key={row.mahina} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold">{row.mahina}</td>
                  <td className="px-5 py-3 text-right">{row.bilSankhya}</td>
                  <td className="px-5 py-3 text-right">₹{Number(row.mulyaBeforeGst).toLocaleString("hi-IN")}</td>
                  <td className="px-5 py-3 text-right text-orange-600">₹{(gst / 2).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-orange-600">₹{(gst / 2).toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-700">₹{gst.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right font-bold text-green-700">₹{Number(row.kulBikri).toLocaleString("hi-IN")}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
