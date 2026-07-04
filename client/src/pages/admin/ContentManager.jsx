import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Save } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const ContentManager = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/content');
        setContent(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/admin/content', content);
      setMsg('Temple information saved successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving content.');
    } finally { setSaving(false); }
  };

  const FIELDS = [
    { key: 'history', label: 'Temple History', rows: 5 },
    { key: 'significance', label: 'Spiritual Significance', rows: 4 },
    { key: 'architecture', label: 'Vedic Architecture', rows: 4 },
    { key: 'founderDetails', label: 'Founder Details', rows: 3 },
    { key: 'mission', label: 'Mission Statement', rows: 3 },
    { key: 'vision', label: 'Vision Statement', rows: 3 },
    { key: 'trustInformation', label: 'Trust Information', rows: 3 },
    { key: 'address', label: 'Temple Address', rows: 2 },
    { key: 'phone', label: 'Contact Phone', rows: 1 },
    { key: 'email', label: 'Contact Email', rows: 1 },
    { key: 'liveDarshanUrl', label: 'Live Darshan YouTube URL', rows: 1 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">CMS Content Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Edit all dynamic temple website content</p>
          </div>
          <button onClick={handleSave} disabled={saving || !content}
            className="flex items-center gap-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {msg && <div className={`p-3 text-xs rounded-xl font-bold border ${msg.includes('success') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{msg}</div>}

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : !content ? (
          <p className="text-slate-500 text-sm text-center py-10">Unable to load content. Check backend connection.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label, rows }) => (
              <div key={key} className={rows >= 4 ? 'md:col-span-2' : ''}>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
                {rows === 1 ? (
                  <input type="text" value={content[key] || ''} onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                    className="mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-saffron-500 dark:text-white" />
                ) : (
                  <textarea rows={rows} value={content[key] || ''} onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                    className="mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-saffron-500 dark:text-white resize-none leading-relaxed" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
