export default function StatCard({ icon, label, value, trend, type }) {
  const color = type === "up" ? "text-green-600" : type === "down" ? "text-red-500" : "text-amber-500"
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold ${color}`}>{trend}</span>
      </div>
      <div className="text-xl font-bold text-blue-50 truncate">{value}</div>
      <div className="text-xs text-gray-400 mt-1 truncate">{label}</div>
    </div>
  )
}
