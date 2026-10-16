import { useEffect, useState } from "react"
import API from "../services/api.js"

export default function Settings(){
  const email = localStorage.getItem("email")
  const [form, setForm] = useState({ full_name:"", mobile:"", gender:"Female", dob:"", email:"" })
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    API.get(`/api/v1/auth/profile/${email}`).then(r=>setForm(r.data)).catch(()=>setForm(prev=>({...prev, email})))
  },[email])

  const save = async()=>{
    setSaving(true)
    try{
      await API.post("/api/v1/auth/update-profile", form)
      alert("✓ Profile updated")
    }catch(e){ alert(e.response?.data?.detail || "Failed") }
    finally{ setSaving(false) }
  }

  return(
    <div className="p-6 max-w-[1280px] mx-auto">
      <h1 className="text-[22px] font-semibold mb-1">Settings</h1>
      <p className="text-[12px] text-zinc-500 mb-6">Manage your account settings and preferences</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile */}
        <div className="lg:col-span-2 rounded-[20px] bg-[#151515] border border-zinc-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold text-white">P</div>
            <div>
              <p className="text-[14px] font-semibold flex items-center gap-2">Praneetha Dukkipati <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">ADMIN</span><span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">VERIFIED</span></p>
              <p className="text-[11px] text-zinc-500">{form.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div><label className="text-[10px] tracking-widest text-zinc-500 uppercase">Full Name</label><input value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} className="w-full mt-1.5 h-11 rounded-xl bg-[#0a0a0a] border border-zinc-800 px-4 text-[13px] focus:border-violet-600 focus:outline-none" /></div>
            <div><label className="text-[10px] tracking-widest text-zinc-500 uppercase">Email Address</label><input value={form.email} readOnly className="w-full mt-1.5 h-11 rounded-xl bg-[#0a0a0a] border border-zinc-800 px-4 text-[13px] text-zinc-500" /></div>
            <div><label className="text-[10px] tracking-widest text-zinc-500 uppercase">Phone Number</label><input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} className="w-full mt-1.5 h-11 rounded-xl bg-[#0a0a0a] border border-zinc-800 px-4 text-[13px] focus:border-violet-600 focus:outline-none" /></div>
            <button onClick={save} disabled={saving} className="w-full h-11 rounded-xl bg-[#7c3aed] hover:bg-[#6d28e0] text-white text-[13px] font-medium transition">{saving? "Saving..." : "Save Changes"}</button>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="rounded-[20px] bg-[#151515] border border-zinc-800 p-5">
            <h4 className="text-[12px] font-semibold mb-4">Security</h4>
            <div className="space-y-3 text-[12px]"><div className="flex justify-between items-center"><span>Face Login</span><span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span></div><div className="flex justify-between items-center"><span>2-Step Verification</span><span className="text-zinc-500">Off</span></div><div className="flex justify-between items-center"><span>Active Sessions</span><span className="text-zinc-500">1 device</span></div></div>
          </div>
          <div className="rounded-[20px] bg-[#151515] border border-zinc-800 p-5">
            <h4 className="text-[12px] font-semibold mb-4">Preferences</h4>
            <div className="space-y-3 text-[12px] text-zinc-400"><div className="flex justify-between"><span>Email Notifications</span><span>On</span></div><div className="flex justify-between"><span>Login Alerts</span><span>On</span></div><div className="flex justify-between"><span>Theme</span><span className="text-white">Dark Pro</span></div></div>
          </div>
          <div className="rounded-[20px] bg-[#151515] border border-zinc-800 p-5">
            <h4 className="text-[12px] font-semibold mb-3">Data & Privacy</h4>
            <div className="flex gap-2"><button className="flex-1 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px]">Download My Data</button><button className="flex-1 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">Delete Account</button></div>
          </div>
        </div>
      </div>
    </div>
  )
}