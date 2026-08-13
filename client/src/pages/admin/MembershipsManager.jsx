import React, { useState } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import { useMemberships } from '../../hooks/queries/useQueries.js';

const planColor = (p) => ({
  Lifetime: 'bg-purple-100 text-purple-700',
  Annual: 'bg-blue-100 text-blue-700',
}[p] || 'bg-amber-100 text-amber-700');

const statusColor = (s) => ({
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-700');

const MembershipsManager = () => {
  const [filter, setFilter] = useState('all');

  const { data: memberships = [], isLoading: loading } = useMemberships();

  const filtered = filter === 'all' ? memberships : memberships.filter(m => m.status === filter);

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Memberships Manager</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Monitor all temple membership subscriptions</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'active', 'pending', 'expired'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize border transition ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />) :
          filtered.length === 0 ? <p className="text-center text-slate-400 text-sm py-10">No memberships found.</p> :
            filtered.map((m) => (
              <div key={m._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{m.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 truncate">{m.userId?.email || 'N/A'}</p>
                  </div>
                  <p className="font-extrabold text-amber-600 shrink-0">₹{m.amountPaid}</p>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${planColor(m.plan)}`}>{m.plan}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor(m.status)}`}>{m.status}</span>
                  <span className="text-[9px] text-gray-400 ml-auto">
                    {m.startDate ? new Date(m.startDate).toLocaleDateString() : '—'} → {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'Lifetime'}
                  </span>
                </div>
              </div>
            ))
        }
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow overflow-hidden">
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
                  <td className="px-4 py-3"><span className={`font-bold px-2 py-0.5 rounded-full text-[9px] ${planColor(m.plan)}`}>{m.plan}</span></td>
                  <td className="px-4 py-3 font-extrabold text-amber-700">₹{m.amountPaid}</td>
                  <td className="px-4 py-3 text-gray-500">{m.startDate ? new Date(m.startDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{m.endDate ? new Date(m.endDate).toLocaleDateString() : 'Lifetime'}</td>
                  <td className="px-4 py-3"><span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${statusColor(m.status)}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default MembershipsManager;
