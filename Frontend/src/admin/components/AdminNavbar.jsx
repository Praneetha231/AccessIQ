export default function AdminNavbar() {
  const adminEmail = localStorage.getItem('userEmail') || 'admin@accessiq.com';

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between text-slate-100">
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
          Admin Portal
        </span>
        <span className="text-sm text-slate-400">System Management & Telemetry</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-medium text-white">{adminEmail}</p>
          <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Authorized Admin</p>
        </div>
      </div>
    </header>
  );
}