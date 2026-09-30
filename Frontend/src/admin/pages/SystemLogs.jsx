// src/admin/pages/SystemLogs.jsx
import { useState, useEffect } from 'react';
import API from '../../services/api';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get('/api/v1/admin/logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Error fetching system logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">System Logs & Telemetry</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Real-time Security Audit Trail</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity Feed</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-slate-500 text-center py-8 text-sm">No system logs recorded yet.</p>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 bg-slate-900/60 border border-slate-700/80 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.level === 'WARN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {log.level}
                  </span>
                  <span className="text-slate-200">{log.event}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span>User: <strong className="text-slate-300">{log.user}</strong></span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}