import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Heart, CalendarClock, Users, ShieldCheck, Award, TrendingUp, Bell, Mail } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const PIE_COLORS = ['#d97706', '#b45309', '#92400e', '#78350f', '#fbbf24', '#fcd34d'];

const StatCard = ({ icon: Icon, label, value, color = 'saffron', link }) => (
  <Link to={link || '#'} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow hover-lift flex items-center gap-5">
    <div className={`p-3 rounded-2xl ${color === 'saffron' ? 'bg-amber-100 dark:bg-amber-950/40' : color === 'maroon' ? 'bg-red-100 dark:bg-red-950/40' : 'bg-green-100 dark:bg-green-950/40'}`}>
      <Icon className={`h-6 w-6 ${color === 'saffron' ? 'text-saffron-600' : color === 'maroon' ? 'text-maroon-700' : 'text-green-600'}`} />
    </div>
    <div>
      <div className="text-2xl font-extrabold text-gray-800 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const categoryData = [
    { name: 'General', value: 35 }, { name: 'Annadanam', value: 25 },
    { name: 'Development', value: 20 }, { name: 'Festival', value: 10 },
    { name: 'Gau Seva', value: 5 }, { name: 'Education', value: 5 }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />

      <div className="flex-1 p-6 md:p-8 overflow-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Temple Trust Management Overview</p>
          </div>
          <div className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard icon={Heart} label="Total Donations Received" value={`₹${(stats?.totalDonations || 0).toLocaleString()}`} color="saffron" link="/admin/donations" />
            <StatCard icon={TrendingUp} label="Monthly Revenue" value={`₹${(stats?.monthlyRevenue || 0).toLocaleString()}`} color="saffron" />
            <StatCard icon={Users} label="Total Devotees" value={stats?.devoteeCount || 0} color="maroon" link="/admin/users" />
            <StatCard icon={CalendarClock} label="Pooja Bookings" value={stats?.totalBookings || 0} color="maroon" link="/admin/bookings" />
            <StatCard icon={ShieldCheck} label="Active Volunteers" value={stats?.volunteersCount || 0} color="green" link="/admin/volunteers" />
            <StatCard icon={Award} label="Active Memberships" value={stats?.activeMemberships || 0} color="saffron" link="/admin/memberships" />
            <StatCard icon={Bell} label="Pending Volunteer Approvals" value={stats?.pendingVolunteers || 0} color="maroon" link="/admin/volunteers" />
            <StatCard icon={Mail} label="Pending Memberships" value={stats?.pendingMemberships || 0} color="green" link="/admin/memberships" />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Donations Bar Chart */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Monthly Donation Revenue (INR)</h3>
            {loading ? <Skeleton className="h-48" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.chartData || []} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`₹${val}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#d97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donation Categories Pie Chart */}
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Donation by Category (%)</h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-xs">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-600 dark:text-slate-300">{item.name}: <strong>{item.value}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow">
          <h3 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '+ Create Event', path: '/admin/events', bg: 'bg-saffron-600 hover:bg-saffron-700' },
              { label: '+ Add Announcement', path: '/admin/announcements', bg: 'bg-maroon-700 hover:bg-maroon-800' },
              { label: '+ Upload Gallery', path: '/admin/gallery', bg: 'bg-amber-600 hover:bg-amber-700' },
              { label: 'Export Donations', path: `http://localhost:5000/api/v1/donations/export`, bg: 'bg-emerald-600 hover:bg-emerald-700', ext: true },
              { label: 'Update Temple CMS', path: '/admin/content', bg: 'bg-slate-700 hover:bg-slate-800' },
            ].map(({ label, path, bg, ext }) =>
              ext ? (
                <a key={label} href={path} target="_blank" rel="noreferrer"
                  className={`${bg} text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:scale-105`}>{label}</a>
              ) : (
                <Link key={label} to={path}
                  className={`${bg} text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:scale-105`}>{label}</Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
