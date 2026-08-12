import React, { useState, useEffect, useRef } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import { Trash2, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const GalleryManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [preview, setPreview] = useState(null); // { url, title, idx }
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ title: '', category: 'Darshan', album: '', type: 'photo' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await api.get('/gallery?limit=50');
      setMedia(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    // Auto-fill title from filename
    if (!form.title) {
      setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ') }));
    }
    setShowForm(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMsg({ text: 'Please select a file first.', type: 'error' });
      return;
    }
    if (!form.title.trim()) {
      setMsg({ text: 'Please enter a title.', type: 'error' });
      return;
    }

    setUploading(true);
    setMsg({ text: '', type: '' });

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('album', form.album || 'General');
    formData.append('type', form.type);

    try {
      await api.post('/gallery/admin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg({ text: 'Media uploaded to gallery successfully!', type: 'success' });
      setShowForm(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setForm({ title: '', category: 'Darshan', album: '', type: 'photo' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMedia();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Upload failed. Try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await api.delete(`/gallery/admin/${id}`);
      setMedia(prev => prev.filter(m => m._id !== id));
      setMsg({ text: 'Media deleted.', type: 'success' });
    } catch (err) {
      setMsg({ text: 'Error deleting media.', type: 'error' });
    }
  };

  const cancelUpload = () => {
    setShowForm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm({ title: '', category: 'Darshan', album: '', type: 'photo' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Gallery Manager</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Upload and manage temple photo/video gallery</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          <ImageIcon className="h-3.5 w-3.5" /> {media.length} items
        </div>
      </div>

      {/* Alert */}
      {msg.text && (
        <div className={`p-3 text-xs rounded-xl font-bold border ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Upload Drop Zone */}
      {!showForm ? (
        <div
          className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl p-8 md:p-12 hover:border-amber-500 hover:bg-amber-50/20 dark:hover:bg-slate-900/50 transition cursor-pointer bg-white dark:bg-slate-900 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">Click to upload a photo or video</p>
          <p className="text-xs text-gray-400">Supports JPG, PNG, JPEG, MP4 · Upload goes to Cloudinary</p>
        </div>
      ) : (
        /* Upload Form — shown after file selected */
        <form onSubmit={handleUpload} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white">Upload Details</h3>
            <button type="button" onClick={cancelUpload} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center justify-center h-40">
              <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter a descriptive title"
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none dark:text-white"
              >
                {['Darshan', 'Festivals', 'Seva', 'Inauguration', 'General'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Album</label>
              <input
                type="text"
                value={form.album}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
                placeholder="e.g. Diwali 2024"
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Media Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none dark:text-white"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition"
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload to Gallery'}
            </button>
            <button
              type="button"
              onClick={cancelUpload}
              className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Gallery Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No media uploaded yet. Use the upload area above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {media.map((item) => (
              <div key={item._id} className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800/80 shadow bg-white dark:bg-slate-900">
                <div className="aspect-square bg-gray-50 dark:bg-slate-800">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition hover:scale-110"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-[10px] font-bold text-gray-700 dark:text-white truncate">{item.title}</p>
                  <p className="text-[9px] text-gray-400 truncate">{item.category}{item.album ? ` · ${item.album}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={preview.url} alt={preview.title} className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl" />
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition">
              <X className="h-5 w-5" />
            </button>
            <p className="text-white text-sm font-bold text-center mt-3">{preview.title}</p>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default GalleryManager;
