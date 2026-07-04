import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Plus, Pin, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const AnnouncementsManager = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'Notice', isPinned: false });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchNotices = async () => {
    try {
      const res = await api.get('/announcements');
      setNotices(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await api.post('/announcements/admin', form);
      setMsg('Announcement published!');
      setShowForm(false);
      setForm({ title: '', content: '', category: 'Notice', isPinned: false });
      fetchNotices();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error creating notice.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/announcements/admin/${id}`);
      fetchNotices();
    } catch (err) { alert('Error deleting notice.'); }
  };

  const handleTogglePin = async (id, currentState) => {
    try {
      await api.put(`/announcements/admin/${id}`, { isPinned: !currentState });
      fetchNotices();
    } catch (err) { alert('Error updating notice.'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Announcements</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Manage temple notice board alerts</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
            <Plus className="h-3.5 w-3.5" /> New Notice
          </button>
        </div>

        {msg && <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl font-bold border border-amber-200">{msg}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white">Publish New Notice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white">
                  <option>Notice</option>
                  <option>Festival Alert</option>
                  <option>Emergency</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500">Content</label>
              <textarea rows={4} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white resize-none" />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="rounded text-saffron-600" />
              Pin this notice to top
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-5 py-2 rounded-xl">
                {submitting ? 'Publishing...' : 'Publish Notice'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-bold px-5 py-2 rounded-xl">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {loading ? [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />) :
            notices.length === 0 ? <p className="text-slate-500 text-sm text-center py-10">No notices published yet.</p> :
            notices.map((notice) => (
              <div key={notice._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow flex items-start gap-4">
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">{notice.title}</h3>
                    {notice.isPinned && <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">Pinned</span>}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${notice.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{notice.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{notice.content}</p>
                  <p className="text-[9px] text-gray-400">{new Date(notice.publishDate).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleTogglePin(notice._id, notice.isPinned)}
                    className={`p-1.5 rounded-lg ${notice.isPinned ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'} hover:opacity-80`}>
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(notice._id)}
                    className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsManager;
