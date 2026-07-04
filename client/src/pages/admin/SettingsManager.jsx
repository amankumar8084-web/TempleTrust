import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Save } from 'lucide-react';
import api from '../../services/api.js';

const SettingsManager = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/admin/settings', settings);
      setMsg('Settings saved successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving settings.');
    } finally { setSaving(false); }
  };

  const toggleSettings = [
    { key: 'emailNotificationEnabled', label: 'Email Notifications', desc: 'Send automated emails for donations, bookings, and memberships.' },
    { key: 'smsNotificationEnabled', label: 'SMS Notifications', desc: 'Send SMS alerts for booking confirmations (requires Twilio config).' },
    { key: 'whatsappNotificationEnabled', label: 'WhatsApp Notifications', desc: 'Send WhatsApp messages for important alerts (requires Twilio config).' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put site in maintenance mode (displays maintenance page to visitors).' },
    { key: 'aiAssistantFallback', label: 'AI Assistant (Keyword Fallback)', desc: 'Use keyword-based chatbot if no Gemini API key configured.' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">System Settings</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Configure system-wide behavior and notifications</p>
          </div>
          <button onClick={handleSave} disabled={saving || !settings}
            className="flex items-center gap-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {msg && (
          <div className={`p-3 text-xs rounded-xl font-bold border ${msg.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{msg}</div>
        )}

        {loading || !settings ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-2xl" />)}</div>
        ) : (
          <div className="space-y-4">
            {toggleSettings.map(({ key, label, desc }) => (
              <div key={key} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow flex justify-between items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">{label}</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    settings[key] ? 'bg-saffron-600' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}

            {/* Announcement Alert Text */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Global Announcement Alert Text</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Displays as a top banner alert across the entire website.</p>
              <textarea rows={2} value={settings.announcementAlert || ''} onChange={(e) => setSettings({ ...settings, announcementAlert: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white resize-none" />
            </div>

            {/* Financial Stats configuration */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow space-y-4">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white">Temple Financial Statistics</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">Update the financial statements visible to all logged in devotees.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Funds Coming (₹)</label>
                  <input type="number" value={settings.totalFundsComing || 0}
                    onChange={(e) => setSettings({ ...settings, totalFundsComing: Number(e.target.value) })}
                    className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses (₹)</label>
                  <input type="number" value={settings.totalExpenses || 0}
                    onChange={(e) => setSettings({ ...settings, totalExpenses: Number(e.target.value) })}
                    className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsManager;
