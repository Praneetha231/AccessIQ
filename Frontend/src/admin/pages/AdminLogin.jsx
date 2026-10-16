import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../../services/api.js"

export default function AdminLogin(){
  const videoRef=useRef(null), streamRef=useRef(null)
  const [captured,setCaptured]=useState(null), [scanning,setScanning]=useState(false), [loading,setLoading]=useState(false), [msg,setMsg]=useState("")
  const navigate=useNavigate()
  useEffect(()=>()=>streamRef.current?.getTracks().forEach(t=>t.stop()),[])
  const startScan=async()=>{
    setScanning(true)
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user", width:640, height:480}})
      streamRef.current=s; setTimeout(()=>{if(videoRef.current) videoRef.current.srcObject=s},100)
    }catch{ setMsg("Camera permission denied"); setScanning(false) }
  }
  const capture=()=>{
    const c=document.createElement("canvas"); c.width=videoRef.current.videoWidth; c.height=videoRef.current.videoHeight
    c.getContext("2d").drawImage(videoRef.current,0,0); setCaptured(c.toDataURL("image/jpeg",0.8))
    streamRef.current?.getTracks().forEach(t=>t.stop()); setScanning(false)
  }
  const login=async()=>{
    if(!captured) return
    setLoading(true); setMsg("")
    try{
      const res=await API.post("/api/v1/auth/login",{image_data:captured, role:"admin"})
      localStorage.setItem("email", res.data.email.toLowerCase())
      localStorage.setItem("role","admin")
      localStorage.setItem("accessiq_user", JSON.stringify({email:res.data.email, role:"admin"}))
      navigate("/admin")
    }catch(e){ setMsg(e.response?.data?.detail || "Admin face not registered in backend ADMIN_EMAILS") }
    finally{ setLoading(false) }
  }
  return(
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4">
      <div className="w-[360px] bg-[#121214] border border-zinc-800 rounded-[18px] p-5">
        <h2 className="font-semibold">Admin Face Login</h2>
        <p className="text-[11px] text-zinc-500 mb-4">Face must be in backend ADMIN_EMAILS</p>
        {scanning &&!captured && <video ref={videoRef} autoPlay muted playsInline className="w-full h-[200px] rounded-xl bg-black mb-2 object-cover" />}
        {captured && <img src={captured} className="w-full h-[200px] rounded-xl mb-2 object-cover border border-zinc-800" alt="cap" />}
        {msg && <p className="text-[11px] bg-red-950/40 border border-red-900 text-red-300 p-2 rounded-lg mb-2">{msg}</p>}
        {!scanning &&!captured && <button onClick={startScan} className="w-full h-10 rounded-xl bg-[#7c3aed] text-[13px] font-medium">Start Face Scan</button>}
        {scanning &&!captured && <div className="flex gap-2"><button onClick={()=>{streamRef.current?.getTracks().forEach(t=>t.stop()); setScanning(false)}} className="flex-1 h-10 rounded-xl bg-zinc-800">Cancel</button><button onClick={capture} className="flex-1 h-10 rounded-xl bg-white text-black">Capture</button></div>}
        {captured && <div className="flex gap-2"><button onClick={()=>{setCaptured(null); startScan()}} className="flex-1 h-10 rounded-xl bg-zinc-800">Retake</button><button onClick={login} disabled={loading} className="flex-1 h-10 rounded-xl bg-white text-black font-medium">{loading?"Verifying...":"Login as Admin"}</button></div>}
      </div>
    </div>
  )
}