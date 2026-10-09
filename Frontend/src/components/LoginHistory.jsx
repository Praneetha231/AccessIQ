import { useEffect, useState } from "react"
export default function LoginHistory() {
  const [logs, setLogs] = useState([])
  const email = localStorage.getItem("email") || localStorage.getItem("userEmail")
  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/user/login-history?email=${email}`)
     .then(r => r.json()).then(d => setLogs(d.logs || d || []))
  }, [email])
  return <div>{logs.map((l,i) => <div key={i} style={{background:"white", padding:"15px", borderRadius:"8px", marginBottom:"10px"}}><span style={{background: l.status==="SUCCESS"?"#dcfce7":"#fee2e2", padding:"2px 8px", borderRadius:"12px", fontSize:"12px"}}>{l.status}</span> <span style={{fontSize:"13px", marginLeft:"10px"}}>{l.timestamp} - {l.ip_address} - Distance: {l.cosine_distance}</span></div>)}</div>
}