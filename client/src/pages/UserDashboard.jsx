import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, TrendingUp, Settings, Edit2, Mail, Phone, Calendar, Shield, Clock, ImageIcon, Bell } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';
import ProfilePictureManager from '../components/profile/ProfilePictureManager.jsx';
import ProfileEditModal from '../components/profile/ProfileEditModal.jsx';
import { updateProfileSuccess } from '../features/auth/authSlice.js';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState({ financials: null });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finRes, profRes] = await Promise.all([
          api.get('/admin/financials'),
          api.get('/users/profile')
        ]);
        setData({ financials: finRes.data.data });
        if (profRes.data?.data) {
          dispatch(updateProfileSuccess(profRes.data.data));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'My Profile', icon: Settings },
    { id: 'finance', label: 'Financial Statement', icon: TrendingUp },
  ];

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-100 dark:border-slate-800/80 p-6 md:p-8 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-spiritual-gradient" />
          <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
            <ProfilePictureManager currentUser={user} />
            <div className="text-center md:text-left space-y-1.5 flex-1">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.name?.split(' ')[0]}! 🙏</h1>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-saffron-700 dark:text-amber-400 rounded-lg hover:scale-105 active:scale-95 transition-all"
                  title="Edit Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  {user?.role}
                </span>
                {user?.phone && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                    <Phone className="w-3 h-3" />
                    {user.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${activeSection === id
                ? 'bg-saffron-600 text-white border-saffron-600 shadow-md shadow-saffron-600/20'
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-slate-800'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 p-6 md:p-8 shadow-lg min-h-64">
          {loading ? (
            <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Your spiritual journey at a glance</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="p-5 bg-amber-50/60 dark:bg-slate-800/60 rounded-2xl space-y-3 border border-amber-100/50 dark:border-slate-700/50">
                      <h4 className="text-sm font-bold text-maroon-900 dark:text-amber-400">Quick Actions</h4>
                      <div className="space-y-2.5">
                        <Link to="/gallery" className="flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-900/50 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition group">
                          <div className="p-2 bg-amber-500 rounded-lg text-white group-hover:scale-110 transition">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-white">View Gallery</p>
                            <p className="text-[10px] text-gray-400">Browse sacred moments captured at the temple</p>
                          </div>
                        </Link>
                        <Link to="/announcements" className="flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-900/50 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition group">
                          <div className="p-2 bg-saffron-600 rounded-lg text-white group-hover:scale-110 transition">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-white">Announcements</p>
                            <p className="text-[10px] text-gray-400">Stay updated with the latest temple news</p>
                          </div>
                        </Link>
                        <Link to="/about" className="flex items-center gap-3 p-3 bg-white/70 dark:bg-slate-900/50 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition group">
                          <div className="p-2 bg-maroon-700 rounded-lg text-white group-hover:scale-110 transition">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-white">About the Temple</p>
                            <p className="text-[10px] text-gray-400">Learn about BrahamBaba's history and mission</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Profile Quick View */}
                    <div className="p-5 bg-amber-50/60 dark:bg-slate-800/60 rounded-2xl space-y-3 border border-amber-100/50 dark:border-slate-700/50">
                      <h4 className="text-sm font-bold text-maroon-900 dark:text-amber-400">Account Summary</h4>
                      <div className="space-y-2">
                        {[
                          { icon: User, label: 'Name', value: user?.name },
                          { icon: Mail, label: 'Email', value: user?.email },
                          { icon: Shield, label: 'Role', value: user?.role },
                          { icon: Calendar, label: 'Member Since', value: memberSince },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-3 p-2.5 bg-white/70 dark:bg-slate-900/50 rounded-xl">
                            <Icon className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0" />
                            <span className="text-[10px] text-gray-400 w-20 flex-shrink-0 font-semibold uppercase">{label}</span>
                            <span className="text-xs text-gray-700 dark:text-slate-200 font-bold truncate">{value || '—'}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-xs text-saffron-600 font-bold hover:underline"
                      >
                        Edit Profile →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FINANCIALS */}
              {activeSection === 'finance' && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Temple Financial Transparency Statement</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Published and verified by the Board of Trustees for devotees' verification.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-2xl space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Total Funds Received</span>
                      <div className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-300">₹{(data.financials?.totalFundsComing || 0).toLocaleString()}</div>
                      <p className="text-[11px] text-emerald-600/80">Includes devotee donations, trust endowments, and service collections.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-2xl space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">Total Expenses / Outgoings</span>
                      <div className="text-3xl font-extrabold text-rose-800 dark:text-rose-300">₹{(data.financials?.totalExpenses || 0).toLocaleString()}</div>
                      <p className="text-[11px] text-rose-600/80">Includes daily Annadanam, staff salaries, constructions, and social aid.</p>
                    </div>
                  </div>
                  <div className="p-5 bg-amber-50 dark:bg-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-amber-200/50 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-maroon-900 dark:text-amber-400">Net Surplus / Reserve Balance</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Retained in trust savings account for upcoming major festival celebrations.</p>
                    </div>
                    <div className="text-2xl font-extrabold text-saffron-700 dark:text-amber-400">
                      ₹{Math.max(0, (data.financials?.totalFundsComing || 0) - (data.financials?.totalExpenses || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE SECTION */}
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Profile Management</h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Update your avatar, name, and contact details below.</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-6 bg-amber-50/40 dark:bg-slate-800/40 rounded-3xl border border-amber-100/50 dark:border-slate-800">
                    <div className="flex-shrink-0">
                      <ProfilePictureManager currentUser={user} />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { icon: User, label: 'Full Name', value: user?.name },
                          { icon: Mail, label: 'Email Address', value: user?.email },
                          { icon: Phone, label: 'Phone Number', value: user?.phone || 'Not provided' },
                          { icon: Calendar, label: 'Registered On', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex-shrink-0">
                              <Icon className="w-4 h-4 text-saffron-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:scale-105 transition-all shadow"
                      >
                        Edit Profile Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
};

export default UserDashboard;
export { UserDashboard };
