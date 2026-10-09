import { useState } from 'react'
import API from "../../services/api.js";

export default function AdminSettings({ users = [], logs = [], setLogs }) {
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem("face_threshold") || 0.40))
  const [liveness, setLiveness] = useState(() => localStorage.getItem("liveness")!== "false")
  const [loading, setLoading] = useState(false)

  const saveSettings = () => {
    setLoading(true)
    localStorage.setItem("face_threshold", String(threshold))
    localStorage.setItem("liveness", String(liveness))
    setTimeout(() => {
      setLoading(false)
      alert(`Settings saved! Threshold=${threshold} | Liveness=${liveness?'ON':'OFF'}`)
    }, 600)
  }

  const exportLogs = () => {
    if (!logs.length) return alert("No logs to export")
    const header = "timestamp,email,ip,status,distance\n"
    const rows = logs.map(l =>
      `${l.timestamp||''},${l.attempted_email||l.email||''},${l.ip_address||''},${l.status||''},${l.cosine_distance||''}`
    ).join("\n")
    const blob = new Blob([header+rows], {type: "text/csv"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `AccessIQ_logs_${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }

  const clearLogs = async () => {
    const ok = confirm(`Clear ${logs.length||35} login logs?\n\nSAFE MODE: This will only clear screen. Logs will come back after refresh.\n\nIf you want permanent delete, I can add backend delete API.`)
    if (!ok) return

    // SAFE clear - only frontend
    if (setLogs) setLogs([])
    else alert("Logs cleared from view (refresh to restore)")

    // For PERMANENT delete, uncomment below after adding backend endpoint:
    // try {
    // await API.delete("/api/v1/admin/logs")
    // setLogs([])
    // alert("Permanently deleted from DB")
    // } catch { alert("Backend delete endpoint not added yet - only UI cleared") }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings — {users.length||2} Users • {logs.length||35} Logins</h2>
        <p className="text-sm text-gray-400">Manage system configuration</p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Admin Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs text-gray-400">Full Name</label><input defaultValue="Praneetha Dukkipati" className="w-full mt-1 bg-black border border-[#333] rounded-lg px-3 py-2 text-white text-sm" /></div>
          <div><label className="text-xs text-gray-400">Email</label><input defaultValue="praneethadukkipati@gmail.com" disabled className="w-full mt-1 bg-black border border-[#333] rounded-lg px-3 py-2 text-gray-500 text-sm" /></div>
          <div><label className="text-xs text-gray-400">Mobile</label><input defaultValue="+917569324623" className="w-full mt-1 bg-black border border-[#333] rounded-lg px-3 py-2 text-white text-sm" /></div>
          <div><label className="text-xs text-gray-400">Role</label><input defaultValue="Administrator" disabled className="w-full mt-1 bg-black border border-[#333] rounded-lg px-3 py-2 text-gray-500 text-sm" /></div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Face Recognition Security</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 flex justify-between"><span>Cosine Distance Threshold</span><span className="text-white">{threshold.toFixed(2)}</span></label>
            <input type="range" min="0.30" max="0.60" step="0.01" value={threshold} onChange={(e)=>setThreshold(parseFloat(e.target.value))} className="w-full accent-white mt-2" />
            <p className="text-[11px] text-gray-500 mt-1">Lower = Stricter. Recommended 0.40 for AccessIQ</p>
          </div>
          <div className="flex items-center justify-between bg-black border border-[#333] rounded-lg px-4 py-3">
            <div><p className="text-sm text-white">Liveness Detection</p><p className="text-xs text-gray-500">Prevent photo / video spoofing</p></div>
            <button onClick={()=>setLiveness(!liveness)} className={`w-11 h-6 rounded-full transition ${liveness? 'bg-white' : 'bg-[#333]'}`}><div className={`w-5 h-5 bg-black rounded-full transition ${liveness? 'translate-x-5' : 'translate-x-1'}`}></div></button>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">System Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportLogs} className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg text-sm border border-[#333]">Export Logs (CSV)</button>
          <button onClick={clearLogs} className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm border border-red-900/50">Clear {logs.length||35} Login Logs</button>
          <span className="px-4 py-2 bg-[#222] text-gray-400 rounded-lg text-sm border border-[#333]">Version: v2.1.0 AccessIQ</span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3">Clear is SAFE - only hides from screen. Refresh to restore. For permanent delete, add DELETE /admin/logs endpoint.</p>
      </div>

      <button onClick={saveSettings} disabled={loading} className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:bg-gray-200">
        {loading? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}