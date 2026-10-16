import React, { useState } from 'react';
import { Save, Download, Trash2, Shield, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminSettings() {
  // Form states initialized with realistic admin data
  const [formData, setFormData] = useState({
    fullName: 'Praneetha Dukkipati',
    email: 'praneethadukkipati@gmail.com',
    mobile: '+917569324623',
    cosineThreshold: 0.40,
    livenessDetection: true,
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [logsCount, setLogsCount] = useState(26);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle slider change specifically
  const handleSliderChange = (e) => {
    setFormData(prev => ({
      ...prev,
      cosineThreshold: parseFloat(e.target.value)
    }));
  };

  // Save settings action handler
  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');

    // Simulate API request delay
    setTimeout(() => {
      setSaving(false);
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000); // Hide after 4 seconds
    }, 800);
  };

  // Clear logs action handler
  const handleClearLogs = () => {
    setLogsCount(0);
    setShowClearModal(false);
    // Add your backend delete logic here
  };

  // Export logs handler
  const handleExportLogs = () => {
    // Add your CSV export trigger logic here
    console.log('Exporting logs to CSV...');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Settings 
              <span className="text-sm font-normal px-3 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                1 User • {logsCount} Logins
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage AccessIQ system configuration and security parameters.</p>
          </div>

          {/* Success Toast Notification */}
          {successMessage && (
            <div className="mt-4 md:mt-0 flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-lg text-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Admin Profile */}
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-indigo-400" />
                  Admin Profile
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName} 
                      onChange={handleChange}
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      required
                    />
                  </div>

                  {/* Email (Read Only) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Email <span className="text-gray-500 font-normal lowercase">(read only)</span>
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled
                      className="w-full bg-[#0d1117]/50 border border-gray-800 rounded-lg px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Mobile
                    </label>
                    <input 
                      type="text" 
                      name="mobile"
                      value={formData.mobile} 
                      onChange={handleChange}
                      className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Face Recognition Security */}
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Face Recognition Security
                </h2>

                <div className="space-y-6">
                  {/* Cosine Distance Threshold Slider */}
                  <div className="bg-[#0d1117] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Cosine Distance Threshold
                      </label>
                      <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded">
                        {formData.cosineThreshold.toFixed(2)}
                      </span>
                    </div>

                    <input 
                      type="range" 
                      min="0.10" 
                      max="0.60" 
                      step="0.01"
                      value={formData.cosineThreshold}
                      onChange={handleSliderChange}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-2"
                    />

                    <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                      <span>0.10 Strict</span>
                      <span>0.60 Loose</span>
                    </div>

                    <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                      Lower = stricter matching. Recommended <strong className="text-gray-300">0.40</strong> for AccessIQ.
                      <br />
                      <span className="text-gray-500 font-mono text-[11px]">Current avg distance: <strong className="text-indigo-400">0.376</strong></span>
                    </p>
                  </div>

                  {/* Liveness Detection Toggle */}
                  <div className="flex items-center justify-between bg-[#0d1117] border border-gray-800 rounded-lg p-4">
                    <div>
                      <span className="text-sm font-medium text-white block">Liveness Detection</span>
                      <span className="text-xs text-gray-400">Haar Cascade + Eye blink check</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="livenessDetection"
                        checked={formData.livenessDetection}
                        onChange={handleChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Card 3: System Actions */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-white mb-4">System Actions</h2>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Export Logs Button */}
                <button
                  type="button"
                  onClick={handleExportLogs}
                  className="flex items-center gap-2 bg-[#21262d] hover:bg-gray-800 text-gray-200 border border-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  <Download className="w-4 h-4 text-gray-400" />
                  Export Logs (CSV)
                </button>

                {/* Clear Logs Button */}
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Clear {logsCount} Login Logs
                </button>
              </div>

              {/* Version & Badge Info */}
              <div className="text-xs text-gray-400 font-mono bg-[#0d1117] border border-gray-800 px-3.5 py-2 rounded-lg">
                Version: v2.1.0 AccessIQ • Threshold {formData.cosineThreshold.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Sticky/Fixed Footer Action Bar */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Confirmation Modal for Clearing Logs */}
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold text-white">Clear All Login Logs?</h3>
              </div>
              <p className="text-sm text-gray-300 mb-6">
                Are you sure you want to delete all <span className="font-semibold text-white">{logsCount} login logs</span>? This action is permanent and cannot be undone from the admin panel.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="bg-[#21262d] hover:bg-gray-800 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition"
                >
                  Yes, Clear Logs
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}