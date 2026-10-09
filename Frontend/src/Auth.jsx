import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "./services/api.js";

export default function Auth(){
  const [role, setRole] = useState("user");
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup camera when leaving page - important for review
  useEffect(()=>{
    return ()=> streamRef.current?.getTracks().forEach(t=>t.stop())
  },[]);

  const startScan = async () => {
    setMsg("");
    setCaptured(null);
    setScanning(true);
    try{
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = s;
      setTimeout(()=> { if(videoRef.current) videoRef.current.srcObject = s },100);
    }catch(err){
      setMsg("Camera permission denied. Allow camera from lock icon.");
      setScanning(false);
    }
  };

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current,0,0);
    const data = canvas.toDataURL("image/jpeg",0.8);
    setCaptured(data);
    streamRef.current?.getTracks().forEach(t=>t.stop());
    setScanning(false); // FIX: set scanning false after capture
  };

  const retake = async () => {
    setCaptured(null);
    setMsg("");
    setScanning(true);
    try{
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = s;
      if(videoRef.current) videoRef.current.srcObject = s;
    }catch(err){
      setMsg("Camera error. Please reload.");
    }
  };

  // --- FIXED LOGIN LOGIC ---
  const verifyAndLogin = async () => {
    if(!captured){
      setMsg("Please capture face first");
      return;
    }
    setLoading(true);
    setMsg("");
    try{
      console.log("Sending login request, role:", role);
      const res = await API.post("/api/v1/auth/login", { image_data: captured, role });

      // ONLY if backend returns success
      if(res.data.status === "success"){
        console.log("Login success:", res.data.email, "distance:", res.data.distance);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("role", role);
        localStorage.setItem("login_distance", res.data.distance);
        // Use href only after success
        window.location.href = role==="admin"? "/admin":"/dashboard";
      } else {
        setMsg("Unexpected response from server");
      }
    }catch(e){
      console.log("Login failed:", e.response?.data);
      // This will show distance error from backend
      const detail = e.response?.data?.detail || "Face not recognized. Try with registered face.";
      setMsg(detail);
      // IMPORTANT: No navigation here - stays on login page
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-11 h-11 bg-white text-black rounded-xl grid place-items-center font-bold">A</div>
      <h1 className="text-[20px] font-bold mt-3">AccessIQ</h1>
      <p className="text-[11px] text-zinc-500 mb-6">Face Recognition Secured Access System</p>

      <div className="flex bg-[#1e1e20] border border-zinc-800 rounded-full p-1 mb-6">
        <button onClick={()=>setRole("user")} className={`px-6 py-1.5 rounded-full text-[12px] ${role==="user"?"bg-white text-black font-medium":"text-zinc-400"}`}>User Login</button>
        <button onClick={()=>setRole("admin")} className={`px-6 py-1.5 rounded-full text-[12px] ${role==="admin"?"bg-white text-black font-medium":"text-zinc-400"}`}>Admin Login</button>
      </div>

      <div className="w-[360px] bg-[#121214] border border-zinc-800 rounded-[18px] p-5">
        <h2 className="text-[13px] font-semibold">{role==="admin"?"Admin Face Login":"User Face Login"}</h2>
        <p className="text-[11px] text-zinc-500 mt-1 mb-4">Secure entry with biometric authentication</p>

        {scanning &&!captured && <video ref={videoRef} autoPlay playsInline muted className="w-full h-[240px] rounded-xl bg-black mb-2.5 object-cover" />}
        {captured && <img src={captured} className="w-full h-[240px] rounded-xl object-cover mb-2.5 border border-zinc-800" alt="captured" />}

        {/* Error shows in red with distance */}
        {msg && <p className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2 mb-2">{msg}</p>}

        {!scanning &&!captured && <button onClick={startScan} className="w-full h-[42px] rounded-xl bg-[#7c3aed] hover:bg-[#6d28e0] text-white text-[13px] transition">Start Face Scan</button>}

        {scanning &&!captured && (
          <div className="flex gap-2">
            <button onClick={()=>{streamRef.current?.getTracks().forEach(t=>t.stop()); setScanning(false);}} className="flex-1 h-[42px] rounded-xl bg-zinc-800 text-[13px]">Cancel</button>
            <button onClick={capture} className="flex-1 h-[42px] rounded-xl bg-white text-black text-[13px] font-medium">Capture</button>
          </div>
        )}

        {captured && (
          <div className="flex gap-2">
            <button onClick={retake} disabled={loading} className="flex-1 h-[42px] rounded-xl bg-zinc-800 text-[13px] border border-zinc-700 disabled:opacity-50">Retake</button>
            <button onClick={verifyAndLogin} disabled={loading} className="flex-1 h-[42px] rounded-xl bg-white text-black text-[13px] font-medium disabled:opacity-50">{loading?"Verifying...":"Verify and Login"}</button>
          </div>
        )}

        <div className="mt-4 text-center text-[11px] text-zinc-500">New here? <Link to="/register" className="text-white hover:underline">Register Face</Link></div>
      </div>
    </div>
  );
}