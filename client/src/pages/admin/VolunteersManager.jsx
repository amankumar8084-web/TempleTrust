import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const statusColor = (s) => ({
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
}[s] || 'bg-gray-100 text-gray-700');

const VolunteersManager = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchVolunteers = async () => {
    try {
      const res = await api.get('/volunteers/admin/all');
      setVolunteers(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVolunteers(); }, []);

  const handleApprove = async (id, status) => {
    try {
      await api.put(`/volunteers/admin/${id}/approve`, { status });
      setVolunteers(prev => prev.map(v => v._id === id ? { ...v, status } : v));
    } catch (err) { alert(err.response?.data?.message || 'Error updating status.'); }
  };

  const filtered = filter === 'all' ? volunteers : volunteers.filter(v => v.status === filter);

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Volunteers Manager</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Review and manage volunteer applications</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize border transition ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50'
                }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />) :
          filtered.length === 0 ? <p className="text-center text-slate-400 text-sm py-10">No volunteers found.</p> :
            filtered.map((v) => (
              <div key={v._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{v.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 truncate">{v.userId?.email || 'N/A'}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${statusColor(v.status)}`}>{v.status}</span>
                </div>
                {(v.skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {v.skills.map(s => <span key={s} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px]">{s}</span>)}
                  </div>
                )}
                {v.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleApprove(v._id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-xl text-xs font-bold transition">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => handleApprove(v._id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-bold transition">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
        }
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-amber-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              <tr>{['Volunteer', 'Email', 'Skills', 'Availability', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-6"><Skeleton className="h-8 w-full" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No volunteers found.</td></tr>
              ) : filtered.map((v) => (
                <tr key={v._id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{v.userId?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-500">{v.userId?.email || 'N/A'}</td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="flex flex-wrap gap-1">
                      {(v.skills || []).map(s => <span key={s} className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px]">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="flex flex-wrap gap-1">
                      {(v.availability || []).slice(0, 2).map(a => <span key={a} className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px]">{a}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${statusColor(v.status)}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {v.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(v._id, 'approved')}
                          className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold transition">
                          <CheckCircle className="h-3 w-3" /> Approve
                        </button>
                        <button onClick={() => handleApprove(v._id, 'rejected')}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-bold transition">
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default VolunteersManager;
