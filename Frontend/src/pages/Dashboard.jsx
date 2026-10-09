import { useEffect, useState } from "react";
import API from "../services/api.js";

export default function Dashboard() {
  const email = localStorage.getItem("email") || "user@test.com";
  const [tab, setTab] = useState("dashboard");
  const [inbox, setInbox] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({ full_name:"", mobile:"", gender:"", dob:"", email });

  useEffect(()=>{
    const fetchAll = async () => {
      try {
        const [inb, alt, lg, set] = await Promise.all([
          API.get(`/api/v1/user/inbox?email=${email}`),
          API.get(`/api/v1/user/alerts?email=${email}`),
          API.get(`/api/v1/user/login-history?email=${email}`),
          API.get(`/api/v1/user/settings?email=${email}`),
        ]);
        setInbox(inb.data.messages || []);
        setAlerts(alt.data.alerts || []);
        setLogs(lg.data.logs || []);
        setSettings(set.data);
      } catch(e){ console.error("Fetch error", e); }
    };
    fetchAll();
  },[email]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const saveSettings = async () => {
    try {
      // FIXED ENDPOINT - was /user/settings, now /settings
      await API.put(`/api/v1/settings/${email}`, settings);
      alert("Settings saved!");
    } catch{ alert("Failed to save"); }
  };

  const MenuItem = ({ id, label }) => (
    <button
      onClick={()=>setTab(id)}
      className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] mb-1 transition ${tab===id? "bg-[#7c3aed] text-white":"text-gray-400 hover:text-white hover:bg-white/5"}`}
    >{label}</button>
  );

  const totalLogins = logs.length;
  const failedAttempts = logs.filter(l=>l.status==="FAILED").length;
  const successLogins = logs.filter(l=>l.status==="SUCCESS").length;
  const activeSessions = logs.filter(l=>{
    try {
      const d = new Date(l.timestamp);
      return (Date.now() - d.getTime()) < 1000*60*60*24;
    } catch { return false; }
  }).length;
  const securityScore = totalLogins? Math.max(60, 100 - (failedAttempts * 2)) : 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <div className="w-[220px] bg-black border-r border-white/10 p-4 flex flex-col">
        <h1 className="font-bold text-[16px] mb-6">AccessIQ</h1>
        <div className="flex-1">
          <MenuItem id="dashboard" label="Dashboard" />
          <MenuItem id="inbox" label="Inbox" />
          <MenuItem id="alerts" label="Alerts" />
          <MenuItem id="history" label="Login History" />
          <MenuItem id="settings" label="Settings" />
        </div>
        <button onClick={handleLogout} className="mt-auto w-full py-2.5 rounded-lg bg-white/10 hover:bg-red-600 text-sm font-medium transition">Logout</button>
      </div>

      <div className="flex-1">
        <div className="h-[56px] border-b border-white/10 flex items-center justify-between px-6 bg-[#111]">
          <span className="text-sm text-gray-400">{email}</span>
          {/* VIOLET DOT REMOVED AS YOU ASKED */}
        </div>

        <div className="p-6">
          {tab==="dashboard" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Security Overview</h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#18181b] rounded-xl p-4 border border-white/10">
                  <p className="text-[11px] text-gray-400">Total Logins</p>
                  <p className="text-xl font-bold mt-1">{totalLogins}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">+{successLogins} success</p>
                </div>
                <div className="bg-[#18181b] rounded-xl p-4 border border-white/10">
                  <p className="text-[11px] text-gray-400">Failed Attempts</p>
                  <p className="text-xl font-bold mt-1">{failedAttempts}</p>
                  <p className="text-[11px] text-red-400 mt-1">{failedAttempts>0?"needs attention":"all good"}</p>
                </div>
                <div className="bg-[#18181b] rounded-xl p-4 border border-white/10">
                  <p className="text-[11px] text-gray-400">Active Sessions (24h)</p>
                  <p className="text-xl font-bold mt-1">{activeSessions}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">real-time</p>
                </div>
                <div className="bg-[#18181b] rounded-xl p-4 border border-white/10">
                  <p className="text-[11px] text-gray-400">Security Score</p>
                  <p className="text-xl font-bold mt-1">{securityScore}%</p>
                  <p className="text-[11px] text-emerald-400 mt-1">calculated</p>
                </div>
              </div>
              <div className="bg-[#18181b] rounded-xl border border-white/10">
                <p className="p-4 text-sm font-semibold border-b border-white/10">Recent Activity</p>
                {logs.slice(0,4).map((l,i)=>(
                  <div key={i} className="flex justify-between p-4 border-b border-white/5 text-[13px]">
                    <div><p className="font-medium">{l.status} login</p><p className="text-[11px] text-gray-500">{l.ip_address} • {l.timestamp}</p></div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] h-fit ${l.status==="SUCCESS"?"bg-emerald-500/20 text-emerald-400":"bg-red-500/20 text-red-400"}`}>{l.status?.toLowerCase()}</span>
                  </div>
                ))}
                {logs.length===0 && <p className="p-4 text-sm text-gray-500">No activity yet</p>}
              </div>
            </>
          )}

          {tab==="inbox" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Inbox ({inbox.length})</h2>
              <div className="space-y-3">{inbox.map(m=>(
                <div key={m.id} className="bg-[#18181b] p-4 rounded-xl border border-white/10">
                  <div className="flex justify-between"><p className="font-semibold text-sm">{m.subject}</p><span className="text-[11px] text-gray-500">{m.timestamp}</span></div>
                  <p className="text-xs text-gray-400 mt-1">{m.sender}</p>
                  <p className="text-sm mt-2 text-gray-300">{m.body}</p>
                </div>
              ))}</div>
            </>
          )}

          {tab==="alerts" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Security Alerts</h2>
              <div className="space-y-3">{alerts.map(a=>(
                <div key={a.id} className="bg-[#18181b] p-4 rounded-xl border border-white/10 flex justify-between">
                  <div><p className="font-semibold text-sm">{a.title}</p><p className="text-sm text-gray-300 mt-1">{a.message}</p><p className="text-[11px] text-gray-500 mt-1">{a.timestamp}</p></div>
                  <span className={`px-2 py-1 rounded-full text-[10px] h-fit ${a.severity==="success"?"bg-emerald-500/20 text-emerald-400": a.severity==="warning"?"bg-yellow-500/20 text-yellow-400":"bg-red-500/20 text-red-400"}`}>{a.severity}</span>
                </div>
              ))}</div>
            </>
          )}

          {tab==="history" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Login History</h2>
              <div className="bg-[#18181b] rounded-xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-4 p-3 text-[11px] text-gray-400 border-b border-white/10"><span>Time</span><span>Status</span><span>Distance</span><span>IP</span></div>
                {logs.map(l=>(
                  <div key={l.id} className="grid grid-cols-4 p-3 text-[13px] border-b border-white/5"><span className="text-gray-400 text-xs">{l.timestamp}</span><span className={l.status==="SUCCESS"?"text-emerald-400":"text-red-400"}>{l.status}</span><span>{l.cosine_distance?.toFixed(3)}</span><span className="text-gray-400">{l.ip_address}</span></div>
                ))}
              </div>
            </>
          )}

          {tab==="settings" && (
            <>
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="bg-[#18181b] rounded-xl border border-white/10 p-6 max-w-[500px] grid grid-cols-2 gap-4">
                <input value={settings.full_name||""} onChange={e=>setSettings({...settings,full_name:e.target.value})} placeholder="Full Name" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm col-span-2" />
                <input value={settings.mobile||""} onChange={e=>setSettings({...settings,mobile:e.target.value})} placeholder="Mobile" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input value={settings.gender||""} onChange={e=>setSettings({...settings,gender:e.target.value})} placeholder="Gender" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input value={settings.dob||""} onChange={e=>setSettings({...settings,dob:e.target.value})} placeholder="DOB" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm" />
                <input value={settings.email||""} disabled className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm col-span-2 opacity-60" />
                <button onClick={saveSettings} className="col-span-2 bg-[#7c3aed] py-2.5 rounded-lg text-sm font-medium mt-2">Save Changes</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}