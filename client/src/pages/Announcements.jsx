import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, Calendar } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';

const Announcements = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await api.get('/announcements');
        setNotices(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-spiritual">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
          Official Notice Board
        </span>
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
          Announcements & Alerts
        </h1>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Official notifications and festival program schedules issued by the BrahamBaba Devotee Trust.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : notices.length === 0 ? (
        <p className="text-center text-slate-500 py-10">No notices posted at the moment.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const isEmergency = notice.category === 'Emergency';
            return (
              <div
                key={notice._id}
                className={`p-6 rounded-3xl border shadow-md flex gap-4 transition hover:-translate-y-0.5 ${
                  isEmergency
                    ? 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/40'
                    : notice.isPinned
                    ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/40'
                    : 'bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800'
                }`}
              >
                <div className="pt-1">
                  {isEmergency ? (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Megaphone className="h-6 w-6 text-saffron-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-white text-base">{notice.title}</h3>
                    {notice.isPinned && (
                      <span className="bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Pinned
                      </span>
                    )}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isEmergency ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {notice.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
                    {notice.content}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Published: {new Date(notice.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Announcements;
export { Announcements };
