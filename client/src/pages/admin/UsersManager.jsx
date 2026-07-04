import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Users, Edit3, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
    } catch (err) { alert(err.response?.data?.message || 'Error updating role.'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const ROLES = ['Devotee', 'Staff', 'Volunteer', 'Trustee', 'Admin'];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Users Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">View and manage all registered devotees</p>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {users.length} users
          </span>
        </div>

        <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-amber-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                <tr>{['Avatar', 'Name', 'Email', 'Phone', 'Role', 'Joined', 'Change Role'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-6"><Skeleton className="h-8 w-full" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No users found.</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] ${
                        u.role === 'Admin' || u.role === 'Super Admin' ? 'bg-red-100 text-red-700' :
                        u.role === 'Trustee' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'Staff' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] focus:outline-none dark:text-white">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
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

export default UsersManager;
