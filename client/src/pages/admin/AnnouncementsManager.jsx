import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
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
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (err) { alert('Error deleting notice.'); }
  };

  const handleTogglePin = async (id, currentState) => {
    try {
      await api.put(`/announcements/admin/${id}`, { isPinned: !currentState });
      setNotices(prev => prev.map(n => n._id === id ? { ...n, isPinned: !currentState } : n));
    } catch (err) { alert('Error updating notice.'); }
  };

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Announcements</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Manage temple notice board alerts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition w-full sm:w-auto justify-center"
        >
          <Plus className="h-3.5 w-3.5" /> New Notice
        </button>
      </div>

      {msg && <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl font-bold border border-amber-200">{msg}</div>}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-white">Publish New Notice</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notice title..."
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none dark:text-white">
                <option>Notice</option>
                <option>Festival Alert</option>
                <option>Emergency</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Content</label>
            <textarea rows={4} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the notice content here..."
              className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white resize-none" />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
              className="rounded text-amber-600" />
            Pin this notice to top
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" disabled={submitting}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
              {submitting ? 'Publishing...' : 'Publish Notice'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm font-bold px-5 py-2.5 rounded-xl transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notice List */}
      <div className="space-y-3">
        {loading ? [1, 2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />) :
          notices.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-sm">No notices published yet. Create one using the button above.</p>
            </div>
          ) :
            notices.map((notice) => (
              <div key={notice._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 rounded-2xl shadow flex items-start gap-3">
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">{notice.title}</h3>
                    {notice.isPinned && <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">Pinned</span>}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${notice.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {notice.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">{notice.content}</p>
                  <p className="text-[9px] text-gray-400">{new Date(notice.publishDate).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleTogglePin(notice._id, notice.isPinned)}
                    className={`p-2 rounded-xl transition ${notice.isPinned ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                    title={notice.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="p-2 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
        }
      </div>
    </AdminPageLayout>
  );
};

export default AnnouncementsManager;
