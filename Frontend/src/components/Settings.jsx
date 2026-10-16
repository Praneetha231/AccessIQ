import { useEffect, useState } from "react";
import API from "../services/api.js";

export default function Settings() {
  const email = localStorage.getItem("email");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    mobile: ""
  });
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    loginAlerts: true,
    darkMode: true
  });

  const fetchProfile = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/v1/auth/profile/${email}`);
      setProfile({
        full_name: res.data.full_name || "",
        email: res.data.email || email,
        mobile: res.data.mobile || ""
      });
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [email]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post("/api/v1/auth/update-profile", {
        email: profile.email,
        full_name: profile.full_name,
        mobile: profile.mobile
      });
      alert("Profile updated!");
    } catch (e) {
      alert(e.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full p-1 transition-colors ${enabled? "bg-white" : "bg-zinc-700"}`}
    >
      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${enabled? "translate-x-5 bg-violet-600" : "translate-x-0 bg-white"}`} />
    </button>
  );

  if (loading) return <div className="p-6 text-sm text-zinc-500">Loading profile...</div>;

  return (
    <div className="p-6">
      <h1 className="text-[18px] font-semibold mb-1">Settings</h1>
      <p className="text-[11px] text-zinc-500 mb-4">Manage your account settings and preferences</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="rounded-xl border-zinc-800 bg-[#121214] p-6">
          <h3 className="text-sm font-semibold mb-4">Profile</h3>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg">
              {(profile.full_name?.[0] || profile.email?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{profile.full_name || "No name set"}</p>
              <p className="text-[11px] text-zinc-500">{profile.email}</p>
              <p className="text-[11px] text-violet-400 cursor-pointer mt-0.5">Change photo</p>
            </div>
          </div>

          <label className="text-[11px] text-zinc-500 tracking-wider">FULL NAME</label>
          <input
            value={profile.full_name}
            onChange={(e) => setProfile({...profile, full_name: e.target.value })}
            className="w-full mt-1 mb-4 px-3 py-2.5 rounded-lg bg-zinc-900 border-zinc-800 text-sm outline-none focus:border-violet-500"
          />

          <label className="text-[11px] text-zinc-500 tracking-wider">EMAIL ADDRESS</label>
          <input
            value={profile.email}
            disabled
            className="w-full mt-1 mb-4 px-3 py-2.5 rounded-lg bg-zinc-900 border-zinc-800 text-sm text-zinc-500"
          />

          <label className="text-[11px] text-zinc-500 tracking-wider">PHONE NUMBER</label>
          <input
            value={profile.mobile}
            onChange={(e) => setProfile({...profile, mobile: e.target.value })}
            className="w-full mt-1 mb-6 px-3 py-2.5 rounded-lg bg-zinc-900 border-zinc-800 text-sm outline-none focus:border-violet-500"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Security */}
          <div className="rounded-xl border-zinc-800 bg-[#121214] p-6">
            <h3 className="text-sm font-semibold mb-4">Security</h3>

            <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
              <div>
                <p className="text-sm font-medium">Face Login</p>
                <p className="text-[11px] text-zinc-500">Login with your face, no password needed</p>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border-green-500/20">Active</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium">Active Sessions</p>
                <p className="text-[11px] text-zinc-500">11 devices in last 24 hours</p>
              </div>
              <span className="text-[11px] text-zinc-400 underline cursor-pointer">Manage</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="rounded-xl border-zinc-800 bg-[#121214] p-6">
            <h3 className="text-sm font-semibold mb-4">Preferences</h3>
            <div className="flex justify-between items-center py-2.5">
              <p className="text-sm">Email Notifications</p>
              <Toggle enabled={prefs.emailNotifications} onChange={(v) => setPrefs({...prefs, emailNotifications: v })} />
            </div>
            <div className="flex justify-between items-center py-2.5">
              <p className="text-sm">Login Alerts</p>
              <Toggle enabled={prefs.loginAlerts} onChange={(v) => setPrefs({...prefs, loginAlerts: v })} />
            </div>
            <div className="flex justify-between items-center py-2.5">
              <p className="text-sm">Dark Mode</p>
              <Toggle enabled={prefs.darkMode} onChange={(v) => setPrefs({...prefs, darkMode: v })} />
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="rounded-xl border-zinc-800 bg-[#121214] p-6">
            <h3 className="text-sm font-semibold mb-4">Data & Privacy</h3>
            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg border-zinc-700 text-xs hover:bg-zinc-800">
                Download My Data
              </button>
              <button className="flex-1 py-2 rounded-lg border-red-900/50 text-red-400 text-xs hover:bg-red-900/20">
                Delete Account
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-3">11 logins • 100% secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}