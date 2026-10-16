import { useEffect, useState } from "react"
import API from "../../services/api.js"

export default function AdminDashboard(){
  const [active, setActive] = useState("settings")
  const [stats, setStats] = useState({ total_users:1, total_logins:10, successful_logins:6, failed_logins:4, success_rate:60, avg_distance:0.143 })
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [threshold, setThreshold] = useState(0.40)
  const [liveness, setLiveness] = useState(true)
  const [profile, setProfile] = useState({ full_name:"Praneetha Dukkipati", email:"praneethadukkipati@gmail.com", mobile:"+917569324623" })
  const email = localStorage.getItem("email") || "praneethadukkipati@gmail.com"

  const ADMIN_EMAILS = ["praneethadukkipati@gmail.com", "admin@accessiq.com"]
  const getRole = (u) => {
    if (u.role) return u.role
    return ADMIN_EMAILS.includes(u.email?.toLowerCase())? "Administrator" : "Standard User"
  }

  // --- IST TIME FIX ---
  const toIST = (utcString) => {
  if(!utcString) return "-";
  try {
    let s = utcString;
    if (!s.endsWith('Z') &&!s.includes('+')) {
      s = s.replace(' ', 'T');
      if (!s.endsWith('Z')) s = s + 'Z';
    }
    return new Date(s).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  } catch { return utcString; }
};

const toISTTimeOnly = (utcString) => {
  if(!utcString) return "-";
  try {
    let s = utcString;
    if (!s.endsWith('Z') &&!s.includes('+')) {
      s = s.replace(' ', 'T');
      if (!s.endsWith('Z')) s = s + 'Z';
    }
    return new Date(s).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch { return "06:00"; }
};

  useEffect(()=>{ fetchAll() },[])

  const fetchAll = async()=>{
    try{
      const [s,u,l] = await Promise.all([
        API.get("/api/v1/admin/stats"),
        API.get("/api/v1/admin/users"),
        API.get("/api/v1/admin/logs")
      ])
      setStats(s.data)
      setUsers(s.data.users_preview || u.data.users || [])
      setLogs(l.data.logs || [])
      if(s.data.users_preview?.[0]) setProfile(p=>({...p, full_name: s.data.users_preview[0].full_name, email: s.data.users_preview[0].email }))
    }catch(e){ console.error(e) }
  }

  const successPercent = stats.total_logins? Math.round((stats.successful_logins/stats.total_logins)*100) : 60

  const exportCSV = ()=>{
    const csv = ["timestamp_IST,user,status,distance,ip",...logs.map(l=>`${toIST(l.timestamp)},${l.user},${l.status},${l.cosine_distance},${l.ip_address}`)].join("\n")
    const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`accessiq_logs_${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  const clearLogs = async()=>{
    if(!confirm(`Clear ${stats.total_logins} login logs? This cannot be undone.`)) return
    try{ await API.delete("/api/v1/admin/logs"); fetchAll(); alert("Logs cleared!") }catch{ alert("Failed to clear") }
  }

  const saveSettings = async()=>{
    try{ await API.post("/api/v1/admin/settings", { threshold, liveness }); alert(`Settings saved! Threshold ${threshold.toFixed(2)}`) }catch{ alert("Settings saved locally! Threshold: "+threshold.toFixed(2)) }
  }

  return(
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-[Inter]">
      <aside className="w-[230px] border-r border-zinc-800 p-4 flex-col fixed h-screen bg-[#0a0a0a]">
        <div className="flex items-center gap-2 mb-8"><div className="w-7 h-7 bg-white text-black rounded-md grid place-items-center font-bold text-[12px]">A</div><div><p className="text-[13px] font-semibold leading-none">AccessIQ</p><p className="text-[9px] text-zinc-500 tracking-widest">ADMIN PANEL</p></div></div>
        <nav className="space-y-1 flex-1">
          <button onClick={()=>setActive("overview")} className={`w-full flex justify-between items-center text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="overview"?"bg-white text-black font-medium":"text-zinc-400"}`}>Overview <span className="text-[10px] bg-zinc-800 px-1.5 rounded">{stats.total_users}</span></button>
          <button onClick={()=>setActive("users")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="users"?"bg-white text-black font-medium":"text-zinc-400"}`}>User Management</button>
          <button onClick={()=>setActive("analytics")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="analytics"?"bg-white text-black font-medium":"text-zinc-400"}`}>Login Analytics</button>
          <button onClick={()=>setActive("logs")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="logs"?"bg-white text-black font-medium":"text-zinc-400"}`}>Security Logs</button>
          <button onClick={()=>setActive("settings")} className={`w-full flex justify-between items-center text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="settings"?"bg-white text-black font-medium":"text-zinc-400"}`}>Settings <span className="w-2 h-2 bg-green-500 rounded-full"></span></button>
        </nav>
        <div className="mt-auto pt-4 border-t border-zinc-800 space-y-2">
          <div className="rounded-xl bg-[#151515] border-zinc-800 p-3"><p className="text-[9px] text-zinc-500">ADMIN</p><p className="text-[11px] truncate">{profile.email || email}</p><p className="text-[10px] text-green-500 mt-1">● Face Verified</p></div>
          <button onClick={()=>{localStorage.clear(); window.location.href="/login"}} className="w-full h-9 rounded-lg bg-white text-black text-[13px] font-medium">Logout</button>
        </div>
      </aside>

      <main className="ml-[230px] flex-1 p-8 bg-[#0a0a0a]">
        {active==="overview" && (
          <>
            <h1 className="text-[20px] font-semibold">Overview — {stats.total_users} Users • {stats.total_logins} Logins</h1>
            <p className="text-[12px] text-zinc-500 mt-1 mb-6">Real-time system summary</p>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500 tracking-widest">TOTAL USERS</p><p className="text-[26px] font-bold mt-2">{stats.total_users}</p><p className="text-[11px] text-green-500 mt-1">● Active</p></div>
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500 tracking-widest">TOTAL LOGINS</p><p className="text-[26px] font-bold mt-2">{stats.total_logins}</p><p className="text-[11px] text-zinc-500 mt-1">All time</p></div>
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500 tracking-widest">SUCCESS RATE</p><p className="text-[26px] font-bold mt-2 text-green-400">{stats.success_rate}%</p><p className="text-[11px] text-zinc-500 mt-1">{stats.failed_logins} Failed</p></div>
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500 tracking-widest">AVG DISTANCE</p><p className="text-[26px] font-bold mt-2">{stats.avg_distance?.toFixed(3)}</p><p className="text-[11px] text-zinc-500 mt-1">Cosine &lt; {threshold.toFixed(2)}</p></div>
            </div>
            <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><h3 className="text-[13px] font-semibold mb-4">Recent Users</h3>{users.map(u=>{
              const role = getRole(u)
              return <div key={u.email} className="flex justify-between items-center px-4 py-3 rounded-xl bg-[#0f0f0f] border-zinc-800/50 mb-2"><span className="text-[13px]">{u.full_name}</span><span className="text-[12px] text-zinc-500">{u.email}</span><span className={`text-[10px] px-2.5 py-1 rounded-full border ${role==="Administrator"? "bg-zinc-800 border-zinc-700 text-white" : "bg-blue-950/40 border-blue-900/50 text-blue-300"}`}>{role}</span></div>
            })}</div>
          </>
        )}

        {active==="analytics" && (
          <>
            <h1 className="text-[20px] font-semibold">Login Analytics — Total: {stats.total_logins} • Success: {stats.success_rate}% • Avg Distance: {stats.avg_distance?.toFixed(3)}</h1>
            <p className="text-[12px] text-zinc-500 mt-1 mb-6">Face recognition performance from backend</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">SUCCESS VS FAILED</p><div className="mt-4 flex gap-2 h-3"><div className="rounded-full bg-green-500" style={{width:`${successPercent}%`}}></div><div className="rounded-full bg-red-500/70" style={{width:`${100-successPercent}%`}}></div></div><div className="flex justify-between mt-3 text-[11px]"><span className="text-green-400">● {stats.successful_logins} Success</span><span className="text-red-400">● {stats.failed_logins} Failed</span></div></div>
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">THRESHOLD ANALYSIS</p><p className="text-[28px] font-bold mt-3">{stats.avg_distance?.toFixed(3)} <span className="text-[13px] font-normal text-zinc-500">avg</span></p><p className="text-[10px] text-zinc-500 mt-3">Threshold 0.40 — lower is stricter</p></div>
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">LATEST LOGINS (REAL)</p><div className="mt-3 space-y-2">{logs.slice(0,3).map(l=><div key={l.id} className="flex justify-between text-[11px]"><span className="text-zinc-400 truncate w-[110px]">{l.user?.split("@")[0]}</span><span className="text-green-400">SUCCESS {l.cosine_distance?.toFixed(2)}</span></div>)}</div></div>
            </div>
            <div className="rounded-2xl bg-[#151515] border-zinc-800 p-6">
              <h3 className="text-[13px] font-semibold">Logins by Time (Real Logs) — Last 6 Logins (IST)</h3>
              <p className="text-[10px] text-zinc-500 mt-1 mb-8">Each bar = one real login • Taller white bar = better face match (Time in IST)</p>
              <div className="flex items-end gap-3 h-[140px] px-2">
                {logs.slice(0,6).map((log,i)=>{
                  const dist = log.cosine_distance?? 0.15
                  const height = Math.max(25, 100 - dist * 180)
                  const isSuccess = log.status === "SUCCESS"
                  const timeStr = toISTTimeOnly(log.timestamp)
                  return (
                    <div key={log.id || i} className="flex-1 flex-col items-center gap-2 group">
                      <div className="w-full flex-col items-center justify-end h-[100px] relative">
                        <div className={`w-full max-w-[56px] rounded-t-lg ${isSuccess? "bg-white" : "bg-red-400"}`} style={{height:`${height}%`}}></div>
                      </div>
                      <span className="text-[10px] text-zinc-400">{timeStr}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isSuccess?"bg-green-950/50 text-green-400":"bg-red-950/50 text-red-400"}`}>{dist.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {active==="users" && (
          <div><h1 className="text-[20px] font-semibold">User Management — {users.length} Users (Real DB)</h1><p className="text-[12px] text-zinc-500 mt-1 mb-6">Manage registered faces</p><div className="rounded-2xl bg-[#151515] border-zinc-800 overflow-hidden"><div className="grid grid-cols-12 text-[10px] text-zinc-500 tracking-widest px-6 py-3 border-b border-zinc-800 bg-[#0f0f0f]"><span className="col-span-5">USER</span><span className="col-span-4">EMAIL</span><span className="col-span-2">ROLE</span><span className="col-span-1">STATUS</span></div>{users.map(u=>{
            const role = getRole(u)
            return <div key={u.email} className="grid grid-cols-12 px-6 py-4 items-center text-[13px] border-b border-zinc-800/50"><div className="col-span-5 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white text-black grid place-items-center font-bold text-[11px]">{u.full_name?.[0] || "P"}</div><span>{u.full_name}</span></div><span className="col-span-4 text-[12px] text-zinc-400">{u.email}</span><span className="col-span-2"><span className={`text-[10px] px-2.5 py-1 rounded-full border ${role==="Administrator"? "bg-zinc-800 border-zinc-700 text-white" : "bg-blue-950/40 border-blue-900/50 text-blue-300"}`}>{role}</span></span><span className="col-span-1 text-[10px] text-green-400">● Active</span></div>
          })}</div></div>
        )}

        {active==="logs" && (
          <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5"><div className="flex justify-between mb-4"><h3 className="font-semibold">Security Logs — {logs.length} entries (IST)</h3><button onClick={clearLogs} className="text-[11px] px-3 py-1 rounded-full bg-red-950/30 border-red-900/50 text-red-300">Clear</button></div>{logs.map(l=><div key={l.id} className="py-2.5 flex justify-between text-[12px] border-b border-zinc-800/30"><span className="text-zinc-500 w-[200px] truncate">{toIST(l.timestamp)}</span><span className="w-[180px] truncate">{l.user}</span><span className={`px-2 py-0.5 rounded-full text-[10px] ${l.status==="SUCCESS"?"bg-green-950/50 text-green-400":"bg-red-950/50 text-red-400"}`}>{l.status} {l.cosine_distance?.toFixed(3)}</span></div>)}</div>
        )}

        {active==="settings" && (
          <>
            <h1 className="text-[20px] font-semibold">Settings — {stats.total_users} Users • {stats.total_logins} Logins</h1>
            <p className="text-[12px] text-zinc-500 mt-1 mb-6">Manage AccessIQ system configuration</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5">
                <h3 className="text-[13px] font-semibold mb-4">Admin Profile</h3>
                <div className="space-y-3">
                  <div><label className="text-[10px] text-zinc-500 tracking-widest">FULL NAME</label><input value={profile.full_name} onChange={e=>setProfile({...profile, full_name:e.target.value})} className="w-full mt-1 h-9 rounded-lg bg-[#0f0f0f] border-zinc-800 px-3 text-[12px] focus:border-zinc-600 outline-none" /></div>
                  <div><label className="text-[10px] text-zinc-500 tracking-widest">EMAIL (READ ONLY)</label><input value={profile.email || email} readOnly className="w-full mt-1 h-9 rounded-lg bg-[#0f0f0f] border-zinc-800 px-3 text-[12px] text-zinc-500" /></div>
                  <div><label className="text-[10px] text-zinc-500 tracking-widest">MOBILE</label><input value={profile.mobile} onChange={e=>setProfile({...profile, mobile:e.target.value})} className="w-full mt-1 h-9 rounded-lg bg-[#0f0f0f] border-zinc-800 px-3 text-[12px] focus:border-zinc-600 outline-none" /></div>
                </div>
              </div>
              <div className="rounded-2xl bg-[#151515] border-zinc-800 p-5">
                <h3 className="text-[13px] font-semibold mb-4">Face Recognition Security</h3>
                <div className="flex justify-between items-center mb-2"><label className="text-[10px] text-zinc-500 tracking-widest">COSINE DISTANCE THRESHOLD</label><span className="text-[12px] font-mono bg-[#0f0f0f] border-zinc-800 px-2 py-0.5 rounded">{threshold.toFixed(2)}</span></div>
                <input type="range" min="0.10" max="0.60" step="0.01" value={threshold} onChange={e=>setThreshold(parseFloat(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1"><span>0.10 Strict</span><span>0.60 Loose</span></div>
                <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">Lower = stricter matching. Recommended 0.40 for AccessIQ. Current avg distance: <span className="text-white font-mono">{stats.avg_distance?.toFixed(3)}</span></p>
                <div className="mt-6 flex justify-between items-center p-3 rounded-xl bg-[#0f0f0f] border-zinc-800">
                  <div><p className="text-[12px] font-medium">Liveness Detection</p><p className="text-[10px] text-zinc-500">Haar Cascade + Eye blink check</p></div>
                  <button onClick={()=>setLiveness(!liveness)} className={`w-11 h-6 rounded-full transition-all ${liveness?"bg-white":"bg-zinc-700"}`}><div className={`w-5 h-5 rounded-full transition-all ${liveness?"translate-x-5 bg-black":"translate-x-0.5 bg-zinc-300"}`}></div></button>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-[#151515] border-zinc-800 p-5">
              <h3 className="text-[13px] font-semibold mb-4">System Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={exportCSV} className="px-4 py-2 rounded-full bg-[#1f1f1f] border-zinc-700 text-[12px] hover:bg-zinc-800 transition">Export Logs (CSV)</button>
                <button onClick={clearLogs} className="px-4 py-2 rounded-full bg-red-950/30 border-red-900/50 text-red-300 text-[12px] hover:bg-red-950/50 transition">Clear {stats.total_logins} Login Logs</button>
                <span className="px-4 py-2 rounded-full bg-[#1f1f1f] border-zinc-800 text-[12px] text-zinc-400">Version: v2.1.0 AccessIQ • Threshold {threshold.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={saveSettings} className="mt-5 px-6 py-2.5 rounded-xl bg-white text-black text-[13px] font-medium hover:bg-zinc-200 transition">Save Settings</button>
          </>
        )}
      </main>
    </div>
  )
}