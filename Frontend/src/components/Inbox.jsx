import { useEffect, useState } from "react"

export default function Inbox() {
  const [messages, setMessages] = useState([])
  const email = localStorage.getItem("email") || localStorage.getItem("userEmail")

  useEffect(() => {
    if(!email) return
    fetch(`http://localhost:8000/api/v1/user/inbox?email=${email}`)
     .then(r => r.json())
     .then(data => {
        // Handles both {messages: []} and [] format
        setMessages(data.messages || data || [])
      })
     .catch(() => setMessages([]))
  }, [email])

  if(messages.length === 0) return <p>Loading inbox...</p>

  return (
    <div>
      {messages.map((m, i) => (
        <div key={m.id || i} style={{ background: "white", padding: "15px", borderRadius: "8px", marginBottom: "10px", border: "1px solid #e2e8f0" }}>
          <strong>{m.subject || m.title}</strong>
          <p style={{ fontSize: "13px", color: "#64748b" }}>{m.sender} - {m.timestamp || m.time}</p>
          <p style={{ marginTop: "8px" }}>{m.body || m.message}</p>
        </div>
      ))}
    </div>
  )
}