// src/admin/components/AdminSidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', path: '/admin', icon: '📊' },
    { id: 'users', label: 'User Management', path: '/admin/users', icon: '👥' },
    { id: 'logs', label: 'System Logs', path: '/admin/logs', icon: '🛡️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex shadow-2xl border-r border-slate-800">
      <div>
        <div className="p-6 border-b border-slate-800/80">
          <h1 className="text-lg font-bold tracking-wider text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            Access IQ
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Admin Portal</p>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button 
          onClick={() => {
            localStorage.clear();
            navigate('/');
          }}
          className="w-full py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold rounded-lg border border-red-500/20 transition-all duration-200 shadow-sm"
        >
          Exit Admin Session
        </button>
      </div>
    </aside>
  );
}