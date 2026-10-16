import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "./services/api.js";

const ADMIN_EMAILS = ["admin@accessiq.com", "praneethadukkipati@gmail.com"];

export default function Auth(){
  const [role, setRole] = useState("user");
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(()=>{
    return ()=> streamRef.current?.getTracks().forEach(t=>t.stop())
  },[]);

  const startScan = async () => {
    setMsg("");
    setIsError(false);
    setCaptured(null);
    setScanning(true);
    try{
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = s;
      setTimeout(()=> { if(videoRef.current) videoRef.current.srcObject = s },100);
    }catch(err){
      setMsg("Camera permission denied. Allow camera from lock icon in URL bar.");
      setIsError(true);
      setScanning(false);
    }
  };

  const capture = () => {
    if(!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current,0,0);
    const data = canvas.toDataURL("image/jpeg",0.8);
    setCaptured(data);
    streamRef.current?.getTracks().forEach(t=>t.stop());
    setScanning(false);
  };

  const retake = async () => {
    setCaptured(null);
    setMsg("");
    setIsError(false);
    setScanning(true);
    try{
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = s;
      if(videoRef.current) videoRef.current.srcObject = s;
    }catch(err){
      setMsg("Camera error. Please reload page.");
      setIsError(true);
      setScanning(false);
    }
  };

  const verifyAndLogin = async () => {
    if(!captured){
      setMsg("Please capture face first");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMsg("");
    setIsError(false);
    try{
      console.log("Sending login request, role:", role);
      const res = await API.post("/api/v1/auth/login", { image_data: captured, role });

      if(res.data.status === "success"){
        const email = res.data.email.toLowerCase().trim();
        console.log("Login success:", email, "distance:", res.data.distance);

        // Store unified - AdminRoute will check this
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);
        localStorage.setItem("login_distance", res.data.distance);
        localStorage.setItem("accessiq_user", JSON.stringify({ email, role }));

        // FIXED: Use navigate not window.location.href (SPA, no reload)
        if(role === "admin"){
          // Extra frontend check: is returned email actually admin?
          if(!ADMIN_EMAILS.includes(email)){
            setMsg(`Security: ${email} is not in ADMIN_EMAILS. Backend blocked admin access.`);
            setIsError(true);
            return;
          }
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    }catch(e){
      console.log("Login blocked:", e.response?.data);
      const detail = e.response?.data?.detail || "Face not recognized. Only registered person can login.";
      setMsg(detail);
      setIsError(true);
      // STAYS HERE - no navigate
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
        <button
          disabled={scanning || loading}
          onClick={()=>{ if(!scanning &&!loading) setRole("user")}}
          className={`px-6 py-1.5 rounded-full text-[12px] transition ${role==="user"?"bg-white text-black font-medium":"text-zinc-400"} disabled:opacity-50`}
        >User Login</button>
        <button
          disabled={scanning || loading}
          onClick={()=>{ if(!scanning &&!loading) setRole("admin")}}
          className={`px-6 py-1.5 rounded-full text-[12px] transition ${role==="admin"?"bg-white text-black font-medium":"text-zinc-400"} disabled:opacity-50`}
        >Admin Login</button>
      </div>

      <div className="w-[360px] bg-[#121214] border border-zinc-800 rounded-[18px] p-5">
        <h2 className="text-[13px] font-semibold">{role==="admin"?"Admin Face Login":"User Face Login"}</h2>
        <p className="text-[11px] text-zinc-500 mt-1 mb-4">
          {role==="admin"? "Only face registered in backend ADMIN_EMAILS" : "Only registered face can login"}
        </p>

        {scanning &&!captured && <video ref={videoRef} autoPlay playsInline muted className="w-full h-[240px] rounded-xl bg-black mb-2.5 object-cover" />}
        {captured && <img src={captured} className="w-full h-[240px] rounded-xl object-cover mb-2.5 border border-zinc-800" alt="captured" />}

        {msg && <p className={`text-[11px] rounded-lg p-2.5 mb-2.5 border ${isError? "text-red-300 bg-red-950/40 border-red-900/50" : "text-green-300 bg-green-950/40 border-green-900/50"}`}>{msg}</p>}

        {!scanning &&!captured && <button onClick={startScan} className="w-full h-[42px] rounded-xl bg-[#7c3aed] hover:bg-[#6d28e0] text-white text-[13px] transition font-medium">Start Face Scan</button>}

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