export default function MetricCard({ title, value, change, isPositive }) {
  return (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-lg space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-3xl font-extrabold text-white">{value}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}