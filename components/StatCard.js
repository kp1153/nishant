"use client";
import { motion } from "framer-motion";

const styles = {
  up: {
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    badge: "bg-green-50 text-green-700 border-green-200",
    ring: "hover:ring-green-200",
  },
  down: {
    iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
    badge: "bg-red-50 text-red-700 border-red-200",
    ring: "hover:ring-red-200",
  },
  warn: {
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "hover:ring-amber-200",
  },
};

export default function StatCard({ Icon, label, value, trend, type }) {
  const s = styles[type] || styles.up;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:ring-4 ${s.ring} p-4 transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>{trend}</span>
      </div>
      <div className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium truncate">{label}</div>
    </motion.div>
  );
}