import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const GalleryManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'photo', category: 'Darshan', album: '', directUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchMedia = async () => {
    try {
      const res = await api.get('/gallery?limit=20');
      setMedia(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await api.post('/gallery/admin', form);
      setMsg('Media added to gallery!');
      setShowForm(false);
      setForm({ title: '', type: 'photo', category: 'Darshan', album: '', directUrl: '' });
      fetchMedia();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error adding media.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await api.delete(`/gallery/admin/${id}`);
      fetchMedia();
    } catch (err) { alert('Error deleting media.'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Gallery Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Manage temple photo and video gallery</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
            <Plus className="h-3.5 w-3.5" /> Add Media
          </button>
        </div>

        {msg && <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl font-bold border border-amber-200">{msg}</div>}

        {showForm && (
          <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white">Add Gallery Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Title', key: 'title', type: 'text', required: true },
                { label: 'Album Name', key: 'album', type: 'text', required: true },
                { label: 'Direct Image/Video URL', key: 'directUrl', type: 'url', required: true },
              ].map(({ label, key, type, required }) => (
                <div key={key} className={key === 'directUrl' ? 'md:col-span-2' : ''}>
                  <label className="text-[10px] font-bold text-gray-500">{label}</label>
                  <input type={type} required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-gray-500">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white">
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white">
                  {['Darshan', 'Festivals', 'Seva', 'Inauguration'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-5 py-2 rounded-xl">
                {submitting ? 'Adding...' : 'Add to Gallery'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-bold px-5 py-2 rounded-xl">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />) :
            media.length === 0 ? <p className="text-slate-500 text-sm col-span-5 text-center py-10">No media uploaded yet.</p> :
            media.map((item) => (
              <div key={item._id} className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800/80 shadow bg-white dark:bg-slate-900">
                <img src={item.url} alt={item.title} className="w-full h-36 object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button onClick={() => handleDelete(item._id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold text-gray-700 dark:text-white truncate">{item.title}</p>
                  <p className="text-[9px] text-gray-400">{item.category} • {item.album}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
