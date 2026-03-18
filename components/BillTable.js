import { db } from "@/db"
import { bill, grahak } from "@/db/schema"
import { desc, eq } from "drizzle-orm"

const chip = {
  "नकद":    "bg-green-100 text-green-700",
  "UPI":    "bg-blue-100 text-blue-700",
  "उधार":   "bg-amber-100 text-amber-700",
  "आंशिक": "bg-purple-100 text-purple-700",
}

export default async function BillTable() {
  const aajKeBill = await db
    .select()
    .from(bill)
    .leftJoin(grahak, eq(bill.grahakId, grahak.id))
    .orderBy(desc(bill.banaya))
    .limit(10)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span className="font-bold text-blue-50">🧾 आज के बिल</span>
        <button className="text-xs font-semibold text-[#1a3f7a]">सभी देखें →</button>
      </div>

      {/* मोबाइल कार्ड */}
      <div className="divide-y divide-gray-50 lg:hidden">
        {aajKeBill.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">आज कोई बिल नहीं बना</div>
        ) : (
          aajKeBill.map((row) => (
            <div key={row.bill.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-50">{row.bill.billNumber}</div>
                <div className="text-sm font-semibold mt-0.5">{row.grahak?.naam ?? "—"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-700">₹{row.bill.kulRakam}</div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${chip[row.bill.sthiti] ?? "bg-gray-100 text-gray-600"}`}>
                  {row.bill.sthiti}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* डेस्कटॉप टेबल */}
      <table className="w-full hidden lg:table">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
            <th className="px-5 py-3 text-left">बिल नं.</th>
            <th className="px-5 py-3 text-left">ग्राहक</th>
            <th className="px-5 py-3 text-left">रकम</th>
            <th className="px-5 py-3 text-left">GST</th>
            <th className="px-5 py-3 text-left">स्थिति</th>
          </tr>
        </thead>
        <tbody>
          {aajKeBill.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">
                आज कोई बिल नहीं बना
              </td>
            </tr>
          ) : (
            aajKeBill.map((row) => (
              <tr key={row.bill.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 text-xs font-bold text-blue-50">{row.bill.billNumber}</td>
                <td className="px-5 py-3 text-sm font-semibold">{row.grahak?.naam ?? "—"}</td>
                <td className="px-5 py-3 text-sm font-bold text-green-700">₹{row.bill.kulRakam}</td>
                <td className="px-5 py-3 text-xs text-orange-600 font-semibold">₹{row.bill.gstRakam ?? 0}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${chip[row.bill.sthiti] ?? "bg-gray-100 text-gray-600"}`}>
                    {row.bill.sthiti}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
