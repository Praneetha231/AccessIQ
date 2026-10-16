
import { useState, useEffect } from 'react';
import API from '../services/api';

export default function LoginHistory({ userEmail }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      fetchLogs(userEmail);
    } else {
      setLogs([]);
      setLoading(false);
    }
  }, [userEmail]);

  const fetchLogs = async (email) => {
    setLoading(true);

    try {
      const res = await API.get(
        `/api/v1/login-history/${encodeURIComponent(email)}`
      );

      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching login history:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert timestamps to Indian Standard Time (IST).
  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';

    const date = new Date(isoString);

    // Handle invalid timestamps.
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>📈</span> Login History &amp; Audit Trail
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            Total recorded authentication sessions: {logs.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <p className="text-slate-500 text-center py-12 font-medium">
          No login attempts recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3 px-4">Date &amp; Time (IST)</th>
                <th className="pb-3 px-4">Device</th>
                <th className="pb-3 px-4">Location</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr
                  key={log.id ?? `${log.timestamp}-${log.status}`}
                  className="hover:bg-slate-50/80 transition"
                >
                  <td className="py-4 px-4 font-mono text-xs text-slate-600 font-medium whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </td>

                  <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                    {log.device || 'Chrome • Windows'}
                  </td>

                  <td className="py-4 px-4 text-slate-600 text-xs">
                    {log.location || 'Mudinepalli, IN'}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        log.status?.toUpperCase() === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {log.status || 'UNKNOWN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
