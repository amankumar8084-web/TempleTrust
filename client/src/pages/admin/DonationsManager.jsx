import React, { useState } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import { Download, Search } from 'lucide-react';
import { API_BASE_URL } from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import { useDonations } from '../../hooks/queries/useQueries.js';

const DonationsManager = () => {
  const [search, setSearch] = useState('');

  const { data: donations = [], isLoading: loading } = useDonations();

  const filtered = donations.filter(d =>
    d.donorName?.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Donations Manager</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">View and manage all donation records</p>
        </div>
        <a
          href={`${API_BASE_URL}/donations/export`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition w-full sm:w-auto justify-center"
        >
          <Download className="h-3.5 w-3.5" /> Export Excel
        </a>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search donor or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
        />
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />) :
          filtered.length === 0 ? <p className="text-center text-slate-400 text-sm py-10">No donations found.</p> :
            filtered.map((d) => (
              <div key={d._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-800 dark:text-white truncate">
                      {d.anonymous ? 'Anonymous' : d.donorName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{d.anonymous ? '—' : d.donorEmail}</p>
                  </div>
                  <p className="font-extrabold text-amber-600 text-base shrink-0">₹{d.amount}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full text-[9px]">{d.category}</span>
                  {d.panCard && <span className="text-[9px] text-gray-400 font-mono">{d.panCard}</span>}
                  {d.anonymous && <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">Anonymous</span>}
                  <span className="text-[9px] text-gray-400 ml-auto">{new Date(d.createdAt).toLocaleDateString()}</span>
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
              <tr>{['Date', 'Donor Name', 'Email', 'Category', 'Amount (₹)', 'PAN Card', 'Anonymous'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="p-6"><Skeleton className="h-8 w-full" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400">No donations found.</td></tr>
              ) : filtered.map((d) => (
                <tr key={d._id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{d.anonymous ? 'Anonymous' : d.donorName}</td>
                  <td className="px-4 py-3 text-gray-500">{d.anonymous ? '—' : d.donorEmail}</td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">{d.category}</span>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-amber-700">₹{d.amount}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{d.panCard || '—'}</td>
                  <td className="px-4 py-3">{d.anonymous ? <span className="text-amber-600 font-bold">Yes</span> : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default DonationsManager;
