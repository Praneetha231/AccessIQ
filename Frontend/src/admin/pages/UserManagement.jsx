// src/admin/pages/UserManagement.jsx
import { useState, useEffect } from 'react';
import API from '../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/api/v1/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">User Management</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Access IQ Registered Accounts & Permissions</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">System Users</h2>
          <span className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-semibold">
            Total: {users.length}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">User Email</th>
                  <th className="px-6 py-4">Role / Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Auth Method</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{u.email}</td>
                    <td className="px-6 py-4 text-slate-400">{u.role}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg">
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{u.verified}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}