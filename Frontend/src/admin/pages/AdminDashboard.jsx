import AdminNavbar from '../components/AdminNavbar';
import MetricCard from '../components/MetricCard';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col">
      <AdminNavbar />
      
      <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">Admin Overview</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Access IQ Enterprise System Metrics</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="Total Registered Users" value="1,248" change="+12%" isPositive={true} />
          <MetricCard title="Biometric Authentications" value="8,432" change="+24%" isPositive={true} />
          <MetricCard title="Security Threat Alerts" value="3" change="-5%" isPositive={true} />
        </div>

        {/* Quick System Status Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">FastAPI & PostgreSQL Backend Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-900/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <span>Database Connection (SQLAlchemy)</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
              </span>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
              <span>OpenCV Liveness Engine</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}