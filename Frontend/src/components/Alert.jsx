// frontend/src/components/Alert.jsx
import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Alert({ userEmail }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail) {
      fetchAlerts(userEmail);
    }
  }, [userEmail]);

  const fetchAlerts = async (email) => {
    try {
      const res = await API.get(`/api/v1/alerts/${email}`);
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🚨 Security Alerts & Notifications
      </h2>
      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading security alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No active security alerts.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-xl border ${
              alert.severity === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm">{alert.title}</h3>
                <span className="text-xs opacity-75">{alert.timestamp}</span>
              </div>
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}