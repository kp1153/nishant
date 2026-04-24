import { Suspense } from "react";
import StatCard from "@/components/StatCard";
import BillTable from "@/components/BillTable";
import UdhaariList from "@/components/UdhaariList";
import { getStats } from "@/lib/stats";
import { Wallet, CreditCard, Receipt, AlertTriangle } from "lucide-react";

export default async function Dashboard() {
  const { sale, bills, udhaari, lowStock } = await getStats();

  const ankde = [
    { Icon: Wallet, label: "आज की बिक्री", value: `₹${Number(sale).toLocaleString("hi-IN")}`, trend: "आज", type: "up" },
    { Icon: CreditCard, label: "कुल उधारी", value: `₹${Number(udhaari).toLocaleString("hi-IN")}`, trend: "बाकी", type: "warn" },
    { Icon: Receipt, label: "आज के बिल", value: `${bills}`, trend: "आज", type: "up" },
    { Icon: AlertTriangle, label: "कम स्टॉक", value: `${lowStock}`, trend: "5 से कम", type: "down" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">डैशबोर्ड</h1>
        <p className="text-sm text-slate-500 mt-1">एक नज़र में आपकी दुकान का हाल</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ankde.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-blue-700" />
            </div>
            <h2 className="font-bold text-slate-900">हाल के बिल</h2>
          </div>
          <Suspense fallback={<div className="text-sm text-slate-400 py-8 text-center">लोड हो रहा है...</div>}>
            <BillTable />
          </Suspense>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber-700" />
            </div>
            <h2 className="font-bold text-slate-900">उधारी सूची</h2>
          </div>
          <Suspense fallback={<div className="text-sm text-slate-400 py-8 text-center">लोड हो रहा है...</div>}>
            <UdhaariList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}