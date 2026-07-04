import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Heart, ShieldAlert, Award, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';

const Home = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [contentRes, noticeRes] = await Promise.all([
          api.get('/admin/content'),
          api.get('/announcements')
        ]);
        setContent(contentRes.data.data);
        setNotices(noticeRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 font-spiritual pb-16">
      {/* 1. Hero Banner Slider / Section */}
      <section className="relative bg-slate-900 text-white min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1609137144814-7fa2536fae7c?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-950 via-maroon-900/60 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left space-y-6">
          <span className="bg-saffron-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
            Jai BrahamBaba
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
            {t('home.welcome')}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            {content?.significance || t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              to="/donate"
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <Heart className="h-5 w-5 fill-white" />
              <span>Donate Online</span>
            </Link>
            <Link
              to="/pooja"
              className="bg-white hover:bg-amber-50 text-maroon-900 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              <span>Book Pooja</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Intro and Timings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-maroon-900 dark:text-amber-500">
            About BrahamBaba Shrine
          </h2>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
            {content?.history || "Seeded by Vedic history and maintained by spiritual gurus..."}
          </p>
          <Link
            to="/about"
            className="text-saffron-600 hover:text-saffron-700 font-bold inline-flex items-center gap-2"
          >
            <span>Read Full History</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Timings */}
        <div className="bg-amber-50/60 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 text-maroon-900 dark:text-amber-400">
            <Clock className="h-6 w-6" />
            <h3 className="text-xl font-bold">{t('home.timings')}</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="divide-y divide-amber-200/50 dark:divide-slate-800">
              {content?.timings?.map((time, index) => (
                <div key={index} className="flex justify-between py-3 text-sm">
                  <span className="font-semibold text-gray-700 dark:text-slate-300">{time.activity}</span>
                  <span className="text-saffron-700 dark:text-amber-400 font-bold">{time.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Notices board */}
      <section className="bg-amber-50/40 dark:bg-slate-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-maroon-900 dark:text-amber-500">Notice Board</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">Stay updated with latest announcements & alerts</p>
            </div>
            <Link to="/announcements" className="text-saffron-600 font-bold flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)
            ) : notices.length === 0 ? (
              <p className="text-slate-500 col-span-3 text-center">No active announcements at the moment.</p>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice._id}
                  className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow hover-lift relative"
                >
                  {notice.isPinned && (
                    <span className="absolute top-4 right-4 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Pinned
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    notice.category === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {notice.category}
                  </span>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-white mt-3 mb-2">{notice.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-3">{notice.content}</p>
                  <div className="mt-4 text-[10px] text-gray-400">
                    Published: {new Date(notice.publishDate).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Statistics CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-100 dark:border-slate-800/60 shadow">
          <Heart className="h-10 w-10 text-saffron-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-maroon-900 dark:text-white">100%</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Transparency in Donations</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-100 dark:border-slate-800/60 shadow">
          <ShieldAlert className="h-10 w-10 text-saffron-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-maroon-900 dark:text-white">Daily</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Annadanam Food Seva</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-amber-100 dark:border-slate-800/60 shadow">
          <Award className="h-10 w-10 text-saffron-600 mx-auto mb-4" />
          <h3 className="text-3xl font-extrabold text-maroon-900 dark:text-white">80G</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Govt. Tax Exemption Receipt</p>
        </div>
      </section>

      {/* 5. Seva CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-spiritual-gradient text-white p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold">Experience the Joy of Spiritual Service</h3>
          <p className="text-amber-100/90 text-sm max-w-xl">
            Join hands with BrahamBaba Trust. Sign up as a regular volunteer or become an annual member to receive blessings and updates.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/volunteer-register"
            className="bg-white text-maroon-900 font-bold px-6 py-3 rounded-xl shadow hover:bg-amber-50 hover:scale-105 transition"
          >
            Become Volunteer
          </Link>
          <Link
            to="/membership"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl shadow hover:scale-105 transition"
          >
            Become Member
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
export { Home };
