import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Grid } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';

const CATEGORIES = ['All', 'Darshan', 'Festivals', 'Seva', 'Inauguration'];

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        let url = `/gallery?page=${page}&limit=8`;
        if (category !== 'All') url += `&category=${category}`;
        if (type !== 'All') url += `&type=${type}`;
        
        const res = await api.get(url);
        setMedia(res.data.data);
        setTotalPages(Math.ceil(res.data.total / 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [category, type, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-spiritual">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
          Sacred Visuals
        </span>
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
          Media Gallery
        </h1>
        <p className="max-w-xl mx-auto text-sm text-gray-600 dark:text-slate-400">
          Browse through divine albums of Aartis, Abhishekams, social food drives, and temple developments.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800/80 shadow">
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition ${
                category === cat
                  ? 'bg-saffron-600 border-saffron-600 text-white'
                  : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-amber-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-slate-800">
          <button
            onClick={() => { setType('All'); setPage(1); }}
            className={`p-2 rounded-lg border transition ${
              type === 'All'
                ? 'bg-maroon-800 border-maroon-800 text-white'
                : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-amber-50'
            }`}
            title="All Media"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setType('photo'); setPage(1); }}
            className={`p-2 rounded-lg border transition ${
              type === 'photo'
                ? 'bg-maroon-800 border-maroon-800 text-white'
                : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-amber-50'
            }`}
            title="Photos"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setType('video'); setPage(1); }}
            className={`p-2 rounded-lg border transition ${
              type === 'video'
                ? 'bg-maroon-800 border-maroon-800 text-white'
                : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-amber-50'
            }`}
            title="Videos"
          >
            <Video className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-60 rounded-3xl" />)}
        </div>
      ) : media.length === 0 ? (
        <p className="text-center text-slate-500 py-10">No media items match the selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow hover-lift group"
            >
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                {item.type === 'video' ? (
                  // Simple video thumbnail preview or actual iframe
                  <div className="w-full h-full relative">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=60" alt="video cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow text-maroon-900 font-bold hover:scale-110 transition">&#9654;</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                  {item.album}
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-xs text-gray-800 dark:text-white line-clamp-1">{item.title}</h4>
                <span className="text-[10px] text-saffron-600 font-semibold">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default Gallery;
export { Gallery };
