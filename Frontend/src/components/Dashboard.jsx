// frontend/src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import API from '../services/api';
import Alert from './Alert';
import LoginHistory from './LoginHistory';

export default function Dashboard({ userEmail, onSignOut }) {
  const [email, setEmail] = useState(
    userEmail || localStorage.getItem('userEmail') || localStorage.getItem('email') || ''
  );
  const [activeTab, setActiveTab] = useState('inbox'); // Default directly to 'inbox'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (email) {
      fetchInbox(email);
    } else {
      setLoading(false);
    }
  }, [email]);

  const fetchInbox = async (targetEmail) => {
    try {
      const res = await API.get(`/api/v1/inbox/${targetEmail}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="p-8 bg-white shadow-xl rounded-2xl text-center max-w-md w-full border border-slate-200">
          <p className="text-red-600 font-semibold mb-4">No active user session found. Please sign in again.</p>
          <button 
            onClick={onSignOut} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* Enterprise Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex shadow-2xl border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800/80">
            <h1 className="text-lg font-bold tracking-wider text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              Access IQ
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Passwordless Security</p>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'inbox', label: 'Secure Inbox', icon: '📬' },
              { id: 'alerts', label: 'Security Alerts', icon: '🚨' },
              { id: 'history', label: 'Login History', icon: '📈' },
              { id: 'admin', label: 'Admin Portal', icon: '🛡️', path: '/admin' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.path) {
                    window.location.href = item.path; // Redirects directly to the Admin Panel route
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Footer Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="mb-3 px-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active Account</p>
            <p className="text-xs font-medium text-slate-300 truncate mt-0.5" title={email}>{email}</p>
          </div>
          <button 
            onClick={onSignOut} 
            className="w-full py-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-semibold rounded-lg border border-red-500/20 transition-all duration-200 shadow-sm"
          >
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Viewport Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-xs sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              AUTHENTICATED SESSION
            </div>
            <span className="text-slate-300">/</span>
            <h2 className="text-sm font-bold text-slate-700 capitalize tracking-wide">{activeTab.replace('-', ' ')} View</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{email}</p>
              <p className="text-[10px] text-slate-400">Biometric Verified</p>
            </div>
            <button 
              onClick={onSignOut} 
              className="md:hidden px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content Area */}
        <main className="p-8 max-w-6xl w-full mx-auto space-y-6">
          
          {activeTab === 'inbox' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                <span>📬</span> Secure User Inbox
              </h2>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-slate-500 text-center py-12 font-medium">Your inbox is currently empty.</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-5 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-white transition-all duration-200 shadow-2xs">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-bold text-slate-800 text-sm">{msg.subject}</h3>
                        <span className="text-xs text-slate-400 font-medium">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 mb-2">From: {msg.sender}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{msg.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && <Alert userEmail={email} />}

          {activeTab === 'history' && <LoginHistory userEmail={email} />}

        </main>
      </div>
    </div>
  );
}