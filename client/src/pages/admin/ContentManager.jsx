import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import { Save, Trash2, UploadCloud } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const ContentManager = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

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
    setMsg({ text: '', type: '' });
    try {
      await api.put('/admin/content', content);
      setMsg({ text: 'Temple information saved successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error saving content.', type: 'error' });
    } finally { setSaving(false); }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await api.post('/admin/donation-images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setContent({ ...content, donationImages: res.data.data });
      setMsg({ text: 'Donation image uploaded successfully.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error uploading image.', type: 'error' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (url) => {
    if (!window.confirm('Remove this donation image?')) return;
    setMsg({ text: '', type: '' });
    try {
      const res = await api.post('/admin/donation-images/remove', { url });
      setContent({ ...content, donationImages: res.data.data });
      setMsg({ text: 'Donation image removed.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error removing image.', type: 'error' });
    }
  };

  const FIELDS = [
    { key: 'history', label: 'Temple History', rows: 5, span: 2 },
    { key: 'significance', label: 'Spiritual Significance', rows: 4, span: 2 },
    { key: 'architecture', label: 'Vedic Architecture', rows: 4, span: 2 },
    { key: 'founderDetails', label: 'Founder Details', rows: 3 },
    { key: 'mission', label: 'Mission Statement', rows: 3 },
    { key: 'vision', label: 'Vision Statement', rows: 2 },
    { key: 'trustInformation', label: 'Trust Information', rows: 2 },
    { key: 'address', label: 'Temple Address', rows: 2 },
    { key: 'phone', label: 'Contact Phone', rows: 1 },
    { key: 'email', label: 'Contact Email', rows: 1 },
    { key: 'liveDarshanUrl', label: 'Live Darshan YouTube URL', rows: 1, span: 2 },
  ];

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">CMS Content Manager</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Edit all dynamic temple website content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !content}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition w-full sm:w-auto justify-center"
        >
          <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {msg.text && (
        <div className={`p-3 text-xs rounded-xl font-bold border ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : !content ? (
        <p className="text-slate-500 text-sm text-center py-10">Unable to load content. Check backend connection.</p>
      ) : (
        <div className="space-y-8">
          {/* Text fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, rows, span }) => (
              <div key={key} className={span === 2 ? 'md:col-span-2' : ''}>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
                {rows === 1 ? (
                  <input type="text" value={content[key] || ''} onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                    className="mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:text-white" />
                ) : (
                  <textarea rows={rows} value={content[key] || ''} onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                    className="mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 dark:text-white resize-none leading-relaxed" />
                )}
              </div>
            ))}
          </div>

          {/* Donation Images Manager */}
          <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
            <h3 className="text-base font-bold text-red-900 dark:text-amber-400 mb-1">Donation Details Images</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
              Manage QR codes and bank detail images on the Donation page. If empty, default images are displayed.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {(content.donationImages || []).map((imgUrl, idx) => (
                <div key={idx} className="relative group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-2 rounded-2xl shadow hover:shadow-md transition">
                  <div className="aspect-[4/3] bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden">
                    <img src={imgUrl} alt={`Donation ${idx + 1}`} className="w-full h-full object-contain" />
                  </div>
                  <button
                    onClick={() => handleRemoveImage(imgUrl)}
                    className="absolute top-3 right-3 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-amber-500 hover:bg-amber-50/20 dark:hover:bg-slate-900/50 transition cursor-pointer bg-white dark:bg-slate-900">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="text-center space-y-2">
                <UploadCloud className="h-8 w-8 text-gray-400 mx-auto" />
                <div className="text-sm font-bold text-gray-700 dark:text-slate-300">
                  {uploading ? 'Uploading...' : 'Click to upload a donation image'}
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default ContentManager;
