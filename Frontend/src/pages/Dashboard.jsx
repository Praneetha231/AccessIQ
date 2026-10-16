import { useEffect, useState, useRef } from "react"
import API from "../services/api.js"

export default function Dashboard(){
  const [active, setActive] = useState("inbox")
  const email = localStorage.getItem("email") || "praneethadukkipati@gmail.com"
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ total:8, failed:0, active:8 })
  const [profile, setProfile] = useState({
    name:localStorage.getItem("profile_name")||"Praneetha Dukkipati",
    mobile:localStorage.getItem("profile_mobile")||"+91 75****4623",
    photo:localStorage.getItem("profile_photo")||null
  })
  const [toggles, setToggles] = useState({
    twoStep: localStorage.getItem("twoStep")!=="false",
    emailNotif: localStorage.getItem("emailNotif")!=="false",
    loginAlerts: localStorage.getItem("loginAlerts")!=="false",
    darkMode: localStorage.getItem("darkMode")!=="false"
  })
  const [toast, setToast] = useState("")
  const fileRef = useRef(null)
  const showToast = (msg)=>{ setToast(msg); setTimeout(()=>setToast(""), 2500) }

  useEffect(()=>{
    (async()=>{
      try{
        const res = await API.get(`/api/v1/login-history/${email}`)
        const data = res.data.logs || []
        setLogs(data)
        setStats({ total:data.length||8, failed:0, active:data.length||8 })
      }catch{
        try{
          const res = await API.get("/api/v1/admin/logs")
          const filtered=(res.data.logs||[]).filter(l=>l.user?.toLowerCase()===email.toLowerCase())
          setLogs(filtered); setStats({ total:filtered.length||8, failed:0, active:filtered.length||8 })
        }catch{}
      }
    })()
  },[])

  const formatTime = (iso) => {
    try{
      const d = new Date(iso)
      return `Today, ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
    }catch{ return "Today, 06:23 AM" }
  }

  // FINAL CORRECT ORDER: Newest on top -> Oldest at bottom
  const initialInbox = [
    { id:1, from:"Security", subject:"New login detected", body:`We detected a new login to your account from Chrome on Windows at ${logs[0]?.timestamp?formatTime(logs[0]?.timestamp):"Today, 06:23 AM"}. If this was you, no action needed.`, time:logs[0]?.timestamp?formatTime(logs[0]?.timestamp):"Today, 06:23 AM", unread:true, type:"L" },
    { id:3, from:"Tips", subject:"Keep your account secure", body:`Tip: Always login in good lighting and look directly at the camera.`, time:"Yesterday, 02:15 PM", unread:true, type:"T" },
    { id:4, from:"AccessIQ Team", subject:"Weekly security summary", body:`You had ${stats.total} successful logins this week with no failed attempts. 100% secure!`, time:"Yesterday, 11:00 AM", unread:false, type:"R" },
    { id:2, from:"AccessIQ", subject:"Welcome to AccessIQ", body:`Hi ${profile.name}, your account is now secure with face login. You can login anytime with just your face — no password needed.`, time:"Oct 06, 09:00 AM", unread:true, type:"W" },
  ]

  const [inboxState, setInboxState] = useState(initialInbox)

  useEffect(()=>{
    setInboxState(prev=>prev.map((m,i)=>i===0?{...m, body:`We detected a new login to your account from Chrome on Windows at ${logs[0]?.timestamp?formatTime(logs[0]?.timestamp):"Today, 06:23 AM"}. If this was you, no action needed.`, time:logs[0]?.timestamp?formatTime(logs[0]?.timestamp):"Today, 06:23 AM"}:m))
  },[logs])

  const handleSave = ()=>{
    localStorage.setItem("profile_name", profile.name)
    localStorage.setItem("profile_mobile", profile.mobile)
    showToast("Profile saved successfully ✓")
  }
  const handlePhotoChange = (e)=>{
    const file = e.target.files?.[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = ()=>{ setProfile(p=>({...p, photo:reader.result})); localStorage.setItem("profile_photo", reader.result); showToast("Profile photo updated ✓") }
    reader.readAsDataURL(file)
  }
  const handleDeletePhoto = ()=>{
    if(!profile.photo) return
    if(confirm("Delete your profile photo?")){
      setProfile(p=>({...p, photo:null}))
      localStorage.removeItem("profile_photo")
      showToast("Profile photo deleted ✓")
    }
  }
  const toggle = (key)=>{
    const val =!toggles[key]
    setToggles(t=>({...t, [key]:val}))
    localStorage.setItem(key, String(val))
    showToast(`${key} ${val?"enabled":"disabled"}`)
  }
  const handleManage = ()=>{ setActive("history"); showToast("Showing active sessions") }
  const exportCSV = ()=>{
    const csv=["timestamp,status",...logs.map(l=>`${l.timestamp},${l.status}`)].join("\n")
    const blob=new Blob([csv],{type:"text/csv"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="my_data.csv"; a.click()
    showToast("Data downloaded ✓")
  }
  const handleDelete = ()=>{
    if(confirm("Delete account?")){ localStorage.clear(); location.href="/login" }
  }

  return(
    <div className="min-h-screen bg-[#0a0a0a] text-white flex font-[Inter] relative">
      {toast && <div className="fixed top-5 right-5 bg-white text-black px-4 py-2.5 rounded-full text-[12px] font-medium shadow-xl z-50">{toast}</div>}
      <input type="file" ref={fileRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />

      <aside className="w-[220px] border-r border-zinc-900 p-4 flex flex-col fixed h-screen bg-[#0a0a0a]">
        <p className="text-[14px] font-bold tracking-wide mb-8 px-2">AccessIQ</p>
        <nav className="space-y-1 flex-1">
          <button onClick={()=>setActive("dashboard")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium ${active==="dashboard"?"bg-[#7c3aed] text-white":"text-zinc-500 hover:text-zinc-300"}`}>Dashboard</button>
          <button onClick={()=>setActive("inbox")} className={`w-full flex justify-between items-center text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="inbox"?"bg-[#7c3aed] text-white":"text-zinc-500"}`}>Inbox <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold">{inboxState.filter(m=>m.unread).length}</span></button>
          <button onClick={()=>setActive("alerts")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="alerts"?"bg-[#7c3aed] text-white":"text-zinc-500"}`}>Alerts</button>
          <button onClick={()=>setActive("history")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="history"?"bg-[#7c3aed] text-white":"text-zinc-500"}`}>Login History</button>
          <button onClick={()=>setActive("settings")} className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] ${active==="settings"?"bg-[#7c3aed] text-white font-medium":"text-zinc-500"}`}>Settings</button>
        </nav>
        <button onClick={()=>{localStorage.clear(); location.href="/login"}} className="mt-auto w-full h-9 rounded-lg bg-[#1a1a1a] border border-zinc-800 text-[13px]">Logout</button>
      </aside>

      <main className="ml-[220px] flex-1 bg-[#0a0a0a]">
        <div className="px-8 py-4 border-b border-zinc-900 text-[13px] text-zinc-400 flex justify-between"><span>{email}</span><span className="w-7 h-7 rounded-full bg-[#7c3aed] grid place-items-center text-white text-[12px] font-bold">{profile.name[0]||"P"}</span></div>
        <div className="p-8">
          {active==="dashboard" && (
            <>
              <h1 className="text-[20px] font-semibold mb-6">Security Overview</h1>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">Total Logins</p><p className="text-[22px] font-bold mt-2">{stats.total}</p></div>
                <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">Failed</p><p className="text-[22px] font-bold mt-2">0</p></div>
                <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">Active 24h</p><p className="text-[22px] font-bold mt-2">{stats.active}</p></div>
                <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-5"><p className="text-[10px] text-zinc-500">Security Score</p><p className="text-[22px] font-bold mt-2 text-green-400">100%</p></div>
              </div>
              <div className="rounded-2xl bg-[#151515] border border-zinc-800 overflow-hidden"><div className="px-6 py-4 border-b border-zinc-800/50"><h3 className="text-[13px] font-semibold">Recent Activity — {logs.length} logins</h3></div>{logs.slice(0,5).map((l,i)=><div key={i} className="px-6 py-4 flex justify-between border-b border-zinc-800/30"><div><p className="text-[13px]">Login successful</p><p className="text-[11px] text-zinc-500">{l.timestamp} • Chrome • Windows</p></div><span className="text-[10px] px-2 py-1 rounded-full bg-green-950/50 text-green-400">{l.status}</span></div>)}</div>
            </>
          )}
          {active==="inbox" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div><h1 className="text-[20px] font-semibold">Inbox</h1><p className="text-[12px] text-zinc-500 mt-1">{email} • {inboxState.filter(m=>m.unread).length} unread</p></div>
                <button onClick={()=>{ setInboxState(prev=>prev.map(m=>({...m, unread:false}))); showToast("All marked as read ✓") }} className="text-[11px] px-4 py-2 rounded-full bg-[#1f1f1f] border border-zinc-700 hover:bg-zinc-800 transition">Mark all read</button>
              </div>
              <div className="rounded-2xl bg-[#151515] border border-zinc-800 overflow-hidden">
                {inboxState.map(m=><div key={m.id} onClick={()=>setInboxState(prev=>prev.map(x=>x.id===m.id?{...x, unread:false}:x))} className={`px-6 py-5 flex gap-4 border-b border-zinc-800/50 hover:bg-[#1c1c1c] cursor-pointer transition ${m.unread?"bg-[#1a1a1a]/50":"opacity-70"}`}>
                  <div className="w-9 h-9 rounded-full bg-white text-black grid place-items-center font-bold text-[11px] shrink-0">{m.type}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4"><p className={`text-[13px] truncate ${m.unread?"font-semibold text-white":"font-medium text-zinc-400"}`}>{m.subject}</p><span className="text-[10px] text-zinc-500 shrink-0">{m.time}</span></div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{m.from}</p>
                    <p className="text-[12px] text-zinc-400 mt-2 line-clamp-2">{m.body}</p>
                  </div>
                  {m.unread && <div className="w-2 h-2 rounded-full bg-[#7c3aed] mt-2 shrink-0"></div>}
                </div>)}
              </div>
            </>
          )}
          {active==="history" && (
            <div className="rounded-2xl bg-[#151515] border border-zinc-800 overflow-hidden"><div className="px-6 py-4 border-b border-zinc-800 bg-[#0f0f0f]"><h3 className="text-[13px] font-semibold">Login History — {stats.total} Logins</h3></div><div className="grid grid-cols-12 text-[10px] text-zinc-500 px-6 py-3 border-b border-zinc-800 bg-[#0f0f0f]"><span className="col-span-5">DATE & TIME</span><span className="col-span-3">DEVICE</span><span className="col-span-2">LOCATION</span><span className="col-span-2">STATUS</span></div>{logs.map((l,i)=><div key={i} className="grid grid-cols-12 px-6 py-3 text-[12px] border-b border-zinc-800/30"><span className="col-span-5 text-zinc-400">{l.timestamp}</span><span className="col-span-3">Chrome • Windows</span><span className="col-span-2">Mudinepalli, IN</span><span className="col-span-2"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-950/50 text-green-400">{l.status}</span></span></div>)}</div>
          )}
          {active==="alerts" && <div className="rounded-2xl bg-green-950/20 border border-green-900/30 p-5"><p className="text-[13px] font-medium text-green-400">● Your account is secure</p><p className="text-[11px] text-zinc-400 mt-2">{stats.total} successful logins, no failed attempts.</p><button onClick={()=>showToast("No alerts — all secure ✓")} className="mt-3 text-[11px] px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">Refresh Alerts</button></div>}
          {active==="settings" && (
            <>
              <h1 className="text-[20px] font-semibold">Settings</h1>
              <p className="text-[12px] text-zinc-500 mt-1 mb-6">Manage your account settings and preferences</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-6">
                  <h3 className="text-[13px] font-semibold mb-5">Profile</h3>
                  <div className="flex items-center gap-4 mb-6">
                    {profile.photo? <img src={profile.photo} className="w-14 h-14 rounded-full object-cover border border-zinc-700" /> : <div className="w-14 h-14 rounded-full bg-[#7c3aed] grid place-items-center text-white font-bold text-[18px]">{profile.name[0]||"P"}</div>}
                    <div><p className="text-[14px] font-semibold">{profile.name}</p><p className="text-[11px] text-zinc-500 mt-0.5">{email}</p><div className="flex gap-3 mt-1"><button onClick={()=>fileRef.current.click()} className="text-[11px] text-[#7c3aed] font-medium hover:underline">Change photo</button>{profile.photo && <button onClick={handleDeletePhoto} className="text-[11px] text-red-400 font-medium hover:underline">Delete photo</button>}</div></div>
                  </div>
                  <div className="space-y-4">
                    <div><label className="text-[10px] text-zinc-500 uppercase tracking-widest">Full Name</label><input value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} className="w-full mt-2 h-10 rounded-xl bg-[#0f0f0f] border border-zinc-800 px-4 text-[13px] outline-none" /></div>
                    <div><label className="text-[10px] text-zinc-500 uppercase tracking-widest">Email Address</label><input value={email} readOnly className="w-full mt-2 h-10 rounded-xl bg-[#0f0f0f] border border-zinc-800 px-4 text-[13px] text-zinc-500" /></div>
                    <div><label className="text-[10px] text-zinc-500 uppercase tracking-widest">Phone Number</label><input value={profile.mobile} onChange={e=>setProfile({...profile, mobile:e.target.value})} className="w-full mt-2 h-10 rounded-xl bg-[#0f0f0f] border border-zinc-800 px-4 text-[13px]" /></div>
                    <button onClick={handleSave} className="mt-2 w-full h-10 rounded-xl bg-white text-black text-[13px] font-medium">Save Changes</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-6"><h3 className="text-[13px] font-semibold mb-4">Security</h3><div className="space-y-3"><div className="flex justify-between items-center py-3 border-b border-zinc-800/50"><div><p className="text-[12px] font-medium">Face Login</p><p className="text-[11px] text-zinc-500 mt-0.5">Login with your face, no password needed</p></div><span className="text-[10px] px-2.5 py-1 rounded-full bg-green-950/40 text-green-400 border border-green-900/30">Active</span></div><div className="flex justify-between items-center py-3 border-b border-zinc-800/50"><div><p className="text-[12px] font-medium">2-Step Verification</p><p className="text-[11px] text-zinc-500 mt-0.5">Face verification is your 2nd factor</p></div><button onClick={()=>toggle("twoStep")} className={`w-9 h-5 rounded-full flex items-center px-0.5 transition ${toggles.twoStep?"bg-white justify-end":"bg-zinc-700 justify-start"}`}><div className="w-4 h-4 bg-black rounded-full"></div></button></div><div className="flex justify-between items-center py-3"><div><p className="text-[12px] font-medium">Active Sessions</p><p className="text-[11px] text-zinc-500 mt-0.5">{stats.active} devices in last 24 hours</p></div><button onClick={handleManage} className="text-[11px] text-zinc-400 hover:text-white underline">Manage</button></div></div></div>
                  <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-6"><h3 className="text-[13px] font-semibold mb-4">Preferences</h3><div className="space-y-4"><div className="flex justify-between items-center"><span className="text-[12px]">Email Notifications</span><button onClick={()=>toggle("emailNotif")} className={`w-9 h-5 rounded-full flex items-center px-0.5 transition ${toggles.emailNotif?"bg-white justify-end":"bg-zinc-700 justify-start"}`}><div className="w-4 h-4 bg-black rounded-full"></div></button></div><div className="flex justify-between items-center"><span className="text-[12px]">Login Alerts</span><button onClick={()=>toggle("loginAlerts")} className={`w-9 h-5 rounded-full flex items-center px-0.5 transition ${toggles.loginAlerts?"bg-white justify-end":"bg-zinc-700 justify-start"}`}><div className="w-4 h-4 bg-black rounded-full"></div></button></div><div className="flex justify-between items-center"><span className="text-[12px]">Dark Mode</span><button onClick={()=>toggle("darkMode")} className={`w-9 h-5 rounded-full flex items-center px-0.5 transition ${toggles.darkMode?"bg-white justify-end":"bg-zinc-700 justify-start"}`}><div className="w-4 h-4 bg-black rounded-full"></div></button></div></div></div>
                  <div className="rounded-2xl bg-[#151515] border border-zinc-800 p-6"><h3 className="text-[13px] font-semibold mb-3">Data & Privacy</h3><div className="flex gap-2"><button onClick={exportCSV} className="flex-1 h-9 rounded-xl bg-[#1e1e1e] border border-zinc-700 text-[11px]">Download My Data</button><button onClick={handleDelete} className="flex-1 h-9 rounded-xl bg-red-950/20 border border-red-900/30 text-red-300 text-[11px]">Delete Account</button></div><p className="text-[10px] text-zinc-600 mt-3">{stats.total} logins • 100% secure</p></div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}