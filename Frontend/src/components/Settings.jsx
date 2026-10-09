export default function Settings() {
  const email = localStorage.getItem("email") || localStorage.getItem("userEmail")
  return <div style={{background:"white", padding:"20px", borderRadius:"8px"}}><h3>Settings</h3><p>Email: {email}</p><p style={{marginTop:"20px", color:"#64748b"}}>Profile settings coming soon...</p></div>
}