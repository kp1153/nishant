export default function StatCard({ icon, label, value, trend, type }) {
  const color = type === "up" ? "text-green-600" : type === "down" ? "text-red-500" : "text-amber-500"
  const bg = type === "down" ? "bg-red-50 border-red-200" : "bg-white border-gray-200"
  return (
    <div className={`rounded-xl border shadow-sm p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className={`text-sm font-bold ${color}`}>{trend}</span>
      </div>
      <div className="text-3xl font-extrabold text-gray-900 truncate">{value}</div>
      <div className="text-sm text-gray-500 mt-1 font-medium truncate">{label}</div>
    </div>
  )
}