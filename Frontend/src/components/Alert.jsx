import { useEffect, useState } from "react"
export default function Alert() {
  const [alerts, setAlerts] = useState([])
  const email = localStorage.getItem("email") || localStorage.getItem("userEmail")
  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/user/alerts?email=${email}`)
     .then(r => r.json()).then(d => setAlerts(d.alerts || d || []))
  }, [email])
  return <div>{alerts.map((a,i) => <div key={i} style={{background:"white", padding:"15px", borderRadius:"8px", marginBottom:"10px", borderLeft:"4px solid #22c55e"}}><strong>{a.title}</strong><p>{a.message}</p><small>{a.timestamp}</small></div>)}</div>
}