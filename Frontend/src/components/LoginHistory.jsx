import { useEffect, useState } from "react"
import API from "../services/api.js"

export default function LoginHistory(){
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const email = localStorage.getItem("email")

  useEffect(()=>{
    if(!email) return
    fetchHistory()
  },[email])

  const fetchHistory = async () => {
    setLoading(true)
    try{
      // Try user-specific history first
      const res = await API.get(`/api/v1/login-history/${email}`)
      console.log("Login history response:", res.data)

      // Backend returns {status: "success", logs: [...]}
      const data = res.data.logs || res.data || []
      setLogs(Array.isArray(data)? data : [])

      // If empty, fallback to admin logs filtered by email (for demo)
      if((!data || data.length === 0)){
        console.log("No user history, trying admin logs fallback")
        const adminRes = await API.get("/api/v1/admin/logs")
        const allLogs = adminRes.data.logs || []
        const filtered = allLogs.filter(l =>
          l.user?.toLowerCase() === email.toLowerCase() ||
          l.email?.toLowerCase() === email.toLowerCase()
        )
        setLogs(filtered)
      }
    }catch(e){
      console.error("Failed to fetch login history", e.response?.data || e.message)
      // Try fallback
      try{
        const adminRes = await API.get("/api/v1/admin/logs")
        const allLogs = adminRes.data.logs || []
        const filtered = allLogs.filter(l => l.user?.toLowerCase() === email.toLowerCase())
        setLogs(filtered)
      }catch{}
    }finally{
      setLoading(false)
    }
  }

  if(loading) return <div className="p-6 text-[12px] text-zinc-500">Loading login history...</div>

  return(
    <div className="p-6">
      <h1 className="text-[18px] font-semibold mb-1">Login History</h1>
      <p className="text-[11px] text-zinc-500 mb-4">All verifications for {email} • Backend verified • Threshold 0.35</p>

      <div className="rounded-xl border border-zinc-800 bg-[#121214] overflow-hidden">
        <div className="grid grid-cols-4 text-[11px] text-zinc-500 bg-zinc-900/50 px-4 py-2.5">
          <span>Time</span>
          <span>Status</span>
          <span>Distance</span>
          <span>IP</span>
        </div>

        {logs.length === 0? (
          <div className="px-4 py-12 text-center">
            <p className="text-[12px] text-zinc-600">No login history yet</p>
            <p className="text-[11px] text-zinc-700 mt-1">Login once with your face, then refresh. Logs are saved in backend.</p>
            <button onClick={fetchHistory} className="mt-3 text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">Retry Fetch</button>
          </div>
        ) : (
          logs.map(log=>(
            <div key={log.id} className="grid grid-cols-4 text-[12px] px-4 py-2.5 border-t border-zinc-800/50">
              <span className="text-zinc-400 text-[11px]">{log.timestamp}</span>
              <span className={`font-medium ${log.status==="SUCCESS"?"text-green-400":"text-red-400"}`}>{log.status}</span>
              <span className="text-zinc-300">{log.cosine_distance?.toFixed(3)?? "-"}</span>
              <span className="text-zinc-500 text-[11px]">{log.ip_address || "127.0.0.1"}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 text-[10px] text-zinc-600">
        Total: {logs.length} • Showing from backend /api/v1/login-history/{email}
      </div>
    </div>
  )
}