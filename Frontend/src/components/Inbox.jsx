import { useEffect, useState } from "react";
import API from "../services/api";

function formatIST(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const todayStr = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  const logStr = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  if (logStr === todayStr) return `Today, ${time}`;
  const yest = new Date(Date.now() - 86400000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  if (logStr === yest) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short" })}, ${time}`;
}

export default function Inbox() {
  const email = localStorage.getItem("email");
  const [items, setItems] = useState([]);
  const [allRead, setAllRead] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/api/v1/login-history/${email}`);
        const logs = res.data.logs || [];
        const realLogins = logs.slice(0, 3).map((log) => ({
          id: log.id,
          icon: "L",
          title: "New login detected",
          category: "Security",
          desc: `We detected a new login to your account from Chrome on Windows at ${formatIST(log.timestamp)}.`,
          time: formatIST(log.timestamp),
        }));

        const nowStr = formatIST(new Date().toISOString());

        setItems([
         ...realLogins,
          { id: "tip", icon: "T", title: "Keep your account secure", category: "Tips", desc: "Tip: Always login in good lighting and look directly at the camera.", time: nowStr },
          { id: "welcome", icon: "W", title: "Welcome to AccessIQ", category: "AccessIQ", desc: "Hi Praneetha Dukkipati, your account is now secure with face login.", time: nowStr },
        ]);
      } catch (e) {
        console.error("Inbox failed", e);
      }
    };
    load();
  }, [email]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-[18px] font-semibold">Inbox</h1>
          <p className="text-[11px] text-zinc-500">{email} • {allRead? 0 : items.length} unread</p>
        </div>
        <button onClick={() => setAllRead(true)} className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-900 border-zinc-800">
          Mark all read
        </button>
      </div>
      <div className="rounded-xl border-zinc-800 bg-[#121214] divide-y divide-zinc-800">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-[13px] font-bold shrink-0">{item.icon}</div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="text-[13px] font-medium">{item.title}</p>
                <span className="text-[10px] text-zinc-500">{item.time}</span>
              </div>
              <p className="text-[11px] text-zinc-500">{item.category}</p>
              <p className="text-[12px] text-zinc-400 mt-1">{item.desc}</p>
            </div>
            {!allRead && <span className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0"></span>}
          </div>
        ))}
      </div>
    </div>
  );
}