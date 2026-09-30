// src/admin/pages/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Simple mock admin validation for module setup
    if (email === 'admin@accessiq.com' && password === 'admin123') {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans text-slate-100 p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
            Restricted Area
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Admin Login</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Access IQ Management Portal</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Admin Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@accessiq.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            Access Admin Panel
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs font-medium text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}