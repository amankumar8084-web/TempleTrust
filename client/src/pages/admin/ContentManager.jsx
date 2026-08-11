import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Save, Trash2, UploadCloud } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const ContentManager = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setMsg('');

    try {
      const res = await api.post('/admin/donation-images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setContent({
        ...content,
        donationImages: res.data.data
      });
      setMsg('Donation image uploaded successfully.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error uploading image.');
    } finally {
      setUploading(false);
      // Reset file input value so same file can be uploaded again
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (url) => {
    if (!window.confirm('Are you sure you want to remove this donation image?')) return;
    setMsg('');
    try {
      const res = await api.post('/admin/donation-images/remove', { url });
      setContent({
        ...content,
        donationImages: res.data.data
      });
      setMsg('Donation image removed successfully.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error removing image.');
    }
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

        {msg && <div className={`p-3 text-xs rounded-xl font-bold border ${msg.includes('success') || msg.includes('uploaded') || msg.includes('removed') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{msg}</div>}

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : !content ? (
          <p className="text-slate-500 text-sm text-center py-10">Unable to load content. Check backend connection.</p>
        ) : (
          <div className="space-y-8">
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

            {/* Donation Images Manager */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mt-6">
              <h3 className="text-lg font-bold text-maroon-900 dark:text-amber-500 mb-1">Donation Details Images</h3>
              <p className="text-xs text-gray-550 dark:text-slate-400 mb-6">Manage the QR codes and bank details images displayed inside the Donation page. If this list is empty, default images will be displayed.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                {(content.donationImages || []).map((imgUrl, idx) => (
                  <div key={idx} className="relative group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-2 rounded-2xl shadow hover:shadow-md transition duration-300">
                    <div className="aspect-[4/3] bg-gray-50 dark:bg-slate-850 flex items-center justify-center rounded-xl overflow-hidden p-1">
                      <img src={imgUrl} alt={`Donation Image ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleRemoveImage(imgUrl)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition"
                        title="Remove Image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-850 rounded-3xl p-8 hover:border-saffron-500 hover:bg-amber-50/20 dark:hover:bg-slate-900/50 transition cursor-pointer relative bg-white dark:bg-slate-900">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="text-center space-y-2">
                  <UploadCloud className="h-10 w-10 text-gray-400 mx-auto" />
                  <div className="text-sm font-bold text-gray-700 dark:text-slate-300">
                    {uploading ? 'Uploading Image...' : 'Click or drag an image here to upload'}
                  </div>
                  <p className="text-xs text-gray-400">Supports PNG, JPG, or JPEG format</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
