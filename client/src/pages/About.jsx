import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';

const About = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await api.get('/admin/content');
        setContent(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-spiritual">
      
      {/* Page Header */}
      <div className="text-center space-y-4">
        <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
          Glimpses of Divinity
        </span>
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
          About BrahamBaba Trust
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-gray-600 dark:text-slate-400">
          Learn about our rich historic heritage, architectural structure, and the trustees executing social welfare.
        </p>
      </div>

      {/* Grid: Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: History & Significance */}
        <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-400 border-b border-amber-200 pb-2">
              Temple History
            </h3>
            {loading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
                {content?.history}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-400 border-b border-amber-200 pb-2">
              Spiritual Significance
            </h3>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
                {content?.significance}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Architecture & Founders */}
        <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-lg space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-400 border-b border-amber-200 pb-2">
              Vedic Architecture
            </h3>
            {loading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
                {content?.architecture}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-400 border-b border-amber-200 pb-2">
              Founder Details
            </h3>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
                {content?.founderDetails}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
        <div className="bg-amber-50/50 dark:bg-slate-900 p-8 rounded-3xl border border-amber-200/50">
          <h3 className="text-2xl font-bold text-maroon-900 dark:text-amber-400 mb-3">Our Mission</h3>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            {content?.mission}
          </p>
        </div>
        <div className="bg-amber-50/50 dark:bg-slate-900 p-8 rounded-3xl border border-amber-200/50">
          <h3 className="text-2xl font-bold text-maroon-900 dark:text-amber-400 mb-3">Our Vision</h3>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            {content?.vision}
          </p>
        </div>
      </div>

      {/* Board Trustees Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-maroon-900 dark:text-amber-500">Board Trustees</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">The spiritual leaders governing temple operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {loading ? (
            [1, 2].map(i => <Skeleton key={i} className="h-56 rounded-3xl" />)
          ) : content?.trustees?.map((trustee, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col items-center text-center shadow-md hover-lift"
            >
              <img
                src={trustee.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"}
                alt={trustee.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-saffron-500 shadow mb-4"
              />
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">{trustee.name}</h4>
              <span className="text-xs text-saffron-600 font-semibold mb-2">{trustee.role}</span>
              <p className="text-xs text-gray-600 dark:text-slate-400 max-w-sm mt-1">{trustee.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default About;
export { About };
