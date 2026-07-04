import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Download, Search } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const DonationsManager = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        // Using admin stats endpoint temporarily, ideally we'd have a /admin/donations route
        const res = await api.get('/donations/history');
        setDonations(res.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = donations.filter(d =>
    d.donorName?.toLowerCase().includes(search.toLowerCase()) ||
    d.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Donations Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">View and manage all donation records</p>
          </div>
          <div className="flex gap-3">
            <a href="http://localhost:5000/api/v1/donations/export" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
              <Download className="h-3.5 w-3.5" /> Export Excel
            </a>
          </div>
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search donor or category..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow overflow-hidden">
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
                    <td className="px-4 py-3 font-extrabold text-saffron-700">₹{d.amount}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono">{d.panCard || '—'}</td>
                    <td className="px-4 py-3">{d.anonymous ? <span className="text-amber-600 font-bold">Yes</span> : 'No'}</td>
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

export default DonationsManager;
