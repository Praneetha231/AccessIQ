import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "./services/api.js";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "", dob: "", gender: "" });
  const [scanning, setScanning] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  const startCamera = async () => {
    if (!form.full_name ||!form.email.includes("@") ||!form.dob ||!form.gender) {
      return setMsg({ type: "error", text: "Fill Full Name, Email, DOB, Gender *" });
    }
    setMsg({ type: "", text: "" });
    setCaptured(null);
    setScanning(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = s;
      setTimeout(() => videoRef.current && (videoRef.current.srcObject = s), 100);
    } catch {
      setMsg({ type: "error", text: "Camera denied" });
      setScanning(false);
    }
  };

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.8);
    setCaptured(data);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const retake = async () => {
    setCaptured(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setScanning(false);
    }
  };

  const handleEnroll = async () => {
    if (!captured) return;
    setLoading(true);
    try {
      await API.post("/api/v1/auth/register", {
        full_name: form.full_name,
        email: form.email.toLowerCase(),
        mobile: form.mobile,
        dob: form.dob,
        gender: form.gender,
        image_data: captured,
      });
      setMsg({ type: "success", text: "Enrolled! Redirecting to login..." });
      setTimeout(() => window.location.href = "/login", 1500);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.detail || "Enrollment failed" });
      setLoading(false);
    }
  };

  const cancelScan = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setScanning(false);
    setCaptured(null);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-4">
      <div className="w-11 h-11 bg-white text-black rounded-xl grid place-items-center font-bold">A</div>
      <h1 className="text-[20px] font-bold mt-3">AccessIQ</h1>
      <p className="text-[11px] text-zinc-500 mb-6">Passwordless Face Registration</p>

      <div className="w-[360px] bg-[#121214] border border-zinc-800 rounded-[18px] p-5">
        <h2 className="text-[13px] font-semibold">User Face Enrollment</h2>
        <p className="text-[11px] text-zinc-500 mt-1 mb-4">Register once with biometric. No password needed ever.</p>

        <div className="space-y-2.5">
          <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value })} placeholder="Full Name *" className="w-full bg-[#1a1a1d] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-[13px] outline-none" />
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value })} placeholder="Enter email *" className="w-full bg-[#1a1a1d] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-[13px] outline-none" />
          <input value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value })} placeholder="Mobile (optional)" className="w-full bg-[#1a1a1d] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-[13px] outline-none" />

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-zinc-500">Date of Birth *</label>
              <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value })} className="w-full mt-1 bg-[#1a1a1d] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-[13px] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Gender *</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value })} className="w-full mt-1 bg-[#1a1a1d] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-[13px] outline-none">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {scanning &&!captured && <video ref={videoRef} autoPlay playsInline className="w-full h-[240px] rounded-xl bg-black object-cover mt-2" />}
          {captured && <img src={captured} className="w-full h-[240px] rounded-xl object-cover mt-2 border border-zinc-800" />}

          {msg.text && <div className={`text-[11px] px-3 py-2 rounded-lg border mt-2 ${msg.type === "error"? "bg-red-950/30 border-red-900/30 text-red-400" : "bg-emerald-950/30 border-emerald-900/30 text-emerald-400"}`}>{msg.text}</div>}

          {!scanning &&!captured && (
            <button onClick={startCamera} className="w-full h-[42px] rounded-xl bg-[#7c3aed] text-white text-[13px] font-medium mt-1">Start Face Enrollment</button>
          )}

          {scanning &&!captured && (
            <div className="flex gap-2 mt-2">
              <button onClick={cancelScan} className="flex-1 h-[42px] rounded-xl bg-zinc-800 text-[13px]">Cancel</button>
              <button onClick={capture} className="flex-1 h-[42px] rounded-xl bg-white text-black text-[13px] font-medium">Capture</button>
            </div>
          )}

          {captured && (
            <div className="flex gap-2 mt-2">
              <button onClick={retake} className="flex-1 h-[42px] rounded-xl bg-zinc-800 text-[13px] border border-zinc-700">Retake</button>
              <button onClick={handleEnroll} disabled={loading} className="flex-1 h-[42px] rounded-xl bg-[#7c3aed] text-white text-[13px] font-medium disabled:opacity-50">{loading? "Enrolling..." : "Enroll Face"}</button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-[11px] text-zinc-500">Already registered? <Link to="/login" className="text-white">Login with Face</Link></div>
      </div>
    </div>
  );
}