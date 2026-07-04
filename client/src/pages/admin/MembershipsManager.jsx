import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const MembershipsManager = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/memberships/admin/all');
        setMemberships(res.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? memberships : memberships.filter(m => m.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Memberships Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Monitor all temple membership subscriptions</p>
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'expired'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize border transition ${
                  filter === f ? 'bg-saffron-600 text-white border-saffron-600' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-amber-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                <tr>{['Member', 'Email', 'Plan', 'Amount Paid', 'Start Date', 'End Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-6"><Skeleton className="h-8 w-full" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No memberships found.</td></tr>
                ) : filtered.map((m) => (
                  <tr key={m._id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{m.userId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.userId?.email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] ${
                        m.plan === 'Lifetime' ? 'bg-purple-100 text-purple-700' : m.plan === 'Annual' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>{m.plan}</span>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-saffron-700">₹{m.amountPaid}</td>
                    <td className="px-4 py-3 text-gray-500">{m.startDate ? new Date(m.startDate).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.endDate ? new Date(m.endDate).toLocaleDateString() : 'Lifetime'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${
                        m.status === 'active' ? 'bg-green-100 text-green-700' : m.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>{m.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipsManager;
