import { db } from "@/db"
import { bill, billItem, grahak, samaan, dukaan } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import PrintButton from "./PrintButton"

export default async function PrintPage({ params }) {
  const { id } = await params

  const [billData] = await db
    .select()
    .from(bill)
    .leftJoin(grahak, eq(bill.grahakId, grahak.id))
    .where(eq(bill.id, Number(id)))

  if (!billData) notFound()

  const items = await db
    .select()
    .from(billItem)
    .leftJoin(samaan, eq(billItem.samaanId, samaan.id))
    .where(eq(billItem.billId, Number(id)))

  const [dukaanInfo] = await db.select().from(dukaan).limit(1)

  const b = billData.bill
  const g = billData.grahak

  return (
    <div className="max-w-2xl mx-auto">
      <div className="print:hidden flex gap-3 mb-4">
        <PrintButton bill={b} grahak={g} items={items} dukaan={dukaanInfo ?? {}} />
        <a href="/dashboard/bill"
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200">
          ← वापस
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 print:border-0 print:rounded-none print:p-0 print-area">
        <div className="text-center border-b border-gray-200 pb-4">
          <div className="text-xl font-bold text-blue-50">
            {dukaanInfo?.naam ?? "मेरी दुकान"}
          </div>
          {dukaanInfo?.tagline && (
            <div className="text-sm text-gray-500 mt-1">{dukaanInfo.tagline}</div>
          )}
          {dukaanInfo?.pata && (
            <div className="text-xs text-gray-400 mt-0.5">
              {dukaanInfo.pata}{dukaanInfo.shahar ? `, ${dukaanInfo.shahar}` : ""}
            </div>
          )}
          {dukaanInfo?.mobile && (
            <div className="text-xs text-gray-400">📞 {dukaanInfo.mobile}</div>
          )}
          {dukaanInfo?.gstin && (
            <div className="text-xs text-gray-400">GSTIN: {dukaanInfo.gstin}</div>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <div>
            <div className="text-gray-500">बिल नंबर</div>
            <div className="font-bold text-blue-50">{b.billNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500">तारीख</div>
            <div className="font-semibold">{b.banaya?.slice(0, 10)}</div>
          </div>
        </div>

        {g && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
            <div className="text-gray-500 text-xs mb-1">ग्राहक</div>
            <div className="font-semibold">{g.naam}</div>
            {g.mobile && <div className="text-gray-500">{g.mobile}</div>}
            {g.pata && <div className="text-gray-500">{g.pata}</div>}
          </div>
        )}

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-3 py-2 text-left border border-gray-200">सामान</th>
              <th className="px-3 py-2 text-center border border-gray-200">मात्रा</th>
              <th className="px-3 py-2 text-right border border-gray-200">मूल्य</th>
              <th className="px-3 py-2 text-right border border-gray-200">GST%</th>
              <th className="px-3 py-2 text-right border border-gray-200">CGST</th>
              <th className="px-3 py-2 text-right border border-gray-200">SGST</th>
              <th className="px-3 py-2 text-right border border-gray-200">कुल</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.bill_item.id} className="border border-gray-200">
                <td className="px-3 py-2 border border-gray-200">
                  <div className="font-semibold">{row.samaan?.naam ?? "—"}</div>
                  {row.samaan?.hsnCode && (
                    <div className="text-xs text-gray-400">HSN: {row.samaan.hsnCode}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-center border border-gray-200">{row.bill_item.matra}</td>
                <td className="px-3 py-2 text-right border border-gray-200">₹{row.bill_item.mulya}</td>
                <td className="px-3 py-2 text-right border border-gray-200">{row.bill_item.gstDar}%</td>
                <td className="px-3 py-2 text-right border border-gray-200 text-orange-600">₹{row.bill_item.cgst}</td>
                <td className="px-3 py-2 text-right border border-gray-200 text-orange-600">₹{row.bill_item.sgst}</td>
                <td className="px-3 py-2 text-right border border-gray-200 font-bold">₹{row.bill_item.kul}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col items-end gap-1 text-sm border-t border-gray-200 pt-3">
          <div className="flex gap-8">
            <span className="text-gray-500">मूल्य (GST पहले)</span>
            <span className="font-semibold w-24 text-right">₹{b.mulyaBeforeGst}</span>
          </div>
          <div className="flex gap-8">
            <span className="text-gray-500">कुल GST</span>
            <span className="text-orange-600 font-semibold w-24 text-right">₹{b.gstRakam}</span>
          </div>
          <div className="flex gap-8 text-base font-bold text-blue-50 border-t border-gray-200 pt-2 mt-1">
            <span>कुल रकम</span>
            <span className="w-24 text-right">₹{b.kulRakam}</span>
          </div>
          <div className="flex gap-8 text-sm">
            <span className="text-gray-500">भुगतान विधि</span>
            <span className="font-semibold w-24 text-right">{b.bhugtanVidhi}</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4 mt-2">
          धन्यवाद! पुनः पधारें 🙏
        </div>
      </div>
    </div>
  )
}