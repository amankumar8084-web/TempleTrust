import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

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
      fetchVolunteers();
    } catch (err) { alert(err.response?.data?.message || 'Error updating status.'); }
  };

  const filtered = filter === 'all' ? volunteers : volunteers.filter(v => v.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Volunteers Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Review and manage volunteer applications</p>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
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
                    <td className="px-4 py-3 text-gray-500 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {(v.skills || []).map(s => <span key={s} className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px]">{s}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {(v.availability || []).slice(0, 2).map(a => <span key={a} className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px]">{a}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${
                        v.status === 'approved' ? 'bg-green-100 text-green-700' : v.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {v.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(v._id, 'approved')}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                            <CheckCircle className="h-3 w-3" /> Approve
                          </button>
                          <button onClick={() => handleApprove(v._id, 'rejected')}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">
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
      </div>
    </div>
  );
};

export default VolunteersManager;
