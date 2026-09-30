// frontend/src/components/LoginHistory.jsx
import { useState, useEffect } from 'react';
import API from '../services/api';

export default function LoginHistory({ userEmail }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      fetchLogs(userEmail);
    }
  }, [userEmail]);

  const fetchLogs = async (email) => {
    try {
      const res = await API.get(`/api/v1/login-history/${email}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Error fetching login history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📊 Biometric Login History 
      </h2>
      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading audit records...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No login attempts recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">IP Address</th>
                <th className="pb-2 font-medium">Match Distance</th>
                <th className="pb-2 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{log.ip_address}</td>
                  <td className="py-3 text-gray-600">{log.cosine_distance.toFixed(4)}</td>
                  <td className="py-3 text-gray-400 text-xs">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}