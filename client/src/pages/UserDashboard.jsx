import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, CalendarClock, CalendarRange, Award, Bell, User, TrendingUp, Settings, Edit2, Mail, Phone, Calendar } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';
import ProfilePictureManager from '../components/profile/ProfilePictureManager.jsx';
import ProfileEditModal from '../components/profile/ProfileEditModal.jsx';
import { updateProfileSuccess } from '../features/auth/authSlice.js';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState({ donations: [], bookings: [], events: [], membership: null, financials: null });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donRes, bookRes, evtRes, memRes, finRes, profRes] = await Promise.all([
          api.get('/donations/history'),
          api.get('/poojas/my-bookings'),
          api.get('/events/my-events'),
          api.get('/memberships/status'),
          api.get('/admin/financials'),
          api.get('/users/profile')
        ]);
        setData({
          donations: donRes.data.data || [],
          bookings: bookRes.data.data || [],
          events: evtRes.data.data || [],
          membership: memRes.data.data,
          financials: finRes.data.data
        });
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

  const totalDonated = data.donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'My Profile', icon: Settings },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'bookings', label: 'Pooja Bookings', icon: CalendarClock },
    { id: 'events', label: 'Events', icon: CalendarRange },
    { id: 'membership', label: 'Membership', icon: Award },
    { id: 'finance', label: 'Financial Statement', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-100 dark:border-slate-800/80 p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg">
          <ProfilePictureManager currentUser={user} />
          <div className="text-center md:text-left space-y-1">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.name?.split(' ')[0]}! 🙏</h1>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-saffron-700 dark:text-amber-400 rounded-lg hover:scale-105 active:scale-95 transition-all"
                title="Edit Details"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              <span className="inline-block bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                {user?.role}
              </span>
              {user?.phone && (
                <span className="inline-block bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs px-3 py-1 rounded-full">
                  {user.phone}
                </span>
              )}
            </div>
          </div>
          <div className="md:ml-auto flex flex-wrap gap-3 justify-center">
            <div className="bg-amber-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-xl font-extrabold text-saffron-700">₹{totalDonated.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500">Total Donated</div>
            </div>
            <div className="bg-amber-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-xl font-extrabold text-saffron-700">{data.bookings.length}</div>
              <div className="text-[10px] text-gray-500">Pooja Bookings</div>
            </div>
            <div className="bg-amber-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl text-center">
              <div className="text-xl font-extrabold text-saffron-700">{data.events.length}</div>
              <div className="text-[10px] text-gray-500">Event Registrations</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                activeSection === id
                  ? 'bg-saffron-600 text-white border-saffron-600'
                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:border-amber-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800/80 p-6 shadow-lg min-h-64">
          {loading ? (
            <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Quick Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-amber-50 dark:bg-slate-800 rounded-2xl space-y-2">
                      <h4 className="text-sm font-bold text-maroon-900 dark:text-amber-400">Membership Status</h4>
                      {data.membership?.status === 'active' ? (
                        <div className="space-y-1 text-xs text-gray-600 dark:text-slate-300">
                          <div><strong>Plan:</strong> {data.membership.plan}</div>
                          <div><strong>Valid Until:</strong> {data.membership.endDate ? new Date(data.membership.endDate).toLocaleDateString() : 'Lifetime'}</div>
                          <span className="inline-block mt-1 bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full text-[9px]">ACTIVE</span>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 space-y-2">
                          <p>No active membership.</p>
                          <Link to="/membership" className="inline-block text-saffron-600 font-bold hover:underline">Get a Membership →</Link>
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-amber-50 dark:bg-slate-800 rounded-2xl space-y-2">
                      <h4 className="text-sm font-bold text-maroon-900 dark:text-amber-400">Recent Activity</h4>
                      {data.donations.length === 0 && data.bookings.length === 0 ? (
                        <p className="text-xs text-gray-500">No recent activity. Start by donating or booking a pooja!</p>
                      ) : (
                        <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
                          {data.donations.slice(0, 2).map(d => (
                            <li key={d._id} className="flex justify-between">
                              <span>Donation – {d.category}</span>
                              <span className="font-bold text-saffron-700">₹{d.amount}</span>
                            </li>
                          ))}
                          {data.bookings.slice(0, 2).map(b => (
                            <li key={b._id} className="flex justify-between">
                              <span>Pooja – {b.slotId?.poojaType}</span>
                              <span className={`font-bold capitalize ${b.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{b.paymentStatus}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Link to="/donate" className="bg-saffron-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:scale-105 transition">Donate Now</Link>
                    <Link to="/pooja" className="bg-maroon-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:scale-105 transition">Book a Pooja</Link>
                    <Link to="/events" className="bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:scale-105 transition">Browse Events</Link>
                  </div>
                </div>
              )}

              {/* DONATIONS */}
              {activeSection === 'donations' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Donation History</h2>
                    <span className="text-xs text-gray-500">{data.donations.length} total</span>
                  </div>
                  {data.donations.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm space-y-3">
                      <p>No donations found.</p>
                      <Link to="/donate" className="inline-block bg-saffron-600 text-white font-bold px-5 py-2 rounded-xl text-xs">Make a Donation</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.donations.map((d) => (
                        <div key={d._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{d.category} Donation</p>
                            <p className="text-[10px] text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-saffron-700">₹{d.amount}</p>
                            <a href={`http://localhost:5000/api/v1/donations/receipt/${d._id}/file`} target="_blank" rel="noreferrer"
                              className="text-[10px] text-blue-500 hover:underline">Download Receipt</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* POOJA BOOKINGS */}
              {activeSection === 'bookings' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Pooja Booking History</h2>
                  {data.bookings.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm space-y-3">
                      <p>No bookings found.</p>
                      <Link to="/pooja" className="inline-block bg-saffron-600 text-white font-bold px-5 py-2 rounded-xl text-xs">Book a Pooja</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.bookings.map((b) => (
                        <div key={b._id} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{b.slotId?.poojaType}</p>
                            <p className="text-[10px] text-gray-400">
                              {b.slotId?.date ? new Date(b.slotId.date).toLocaleDateString() : 'N/A'} &bull; {b.slotId?.startTime} - {b.slotId?.endTime}
                            </p>
                          </div>
                          <div className="flex gap-3 items-center">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${
                              b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>{b.paymentStatus}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${
                              b.bookingStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>{b.bookingStatus}</span>
                            <span className="text-sm font-bold text-saffron-700">₹{b.amountPaid}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EVENTS */}
              {activeSection === 'events' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">My Event Registrations</h2>
                  {data.events.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm space-y-3">
                      <p>Not registered for any events.</p>
                      <Link to="/events" className="inline-block bg-saffron-600 text-white font-bold px-5 py-2 rounded-xl text-xs">Browse Events</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.events.map((reg) => (
                        <div key={reg._id} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{reg.eventId?.title}</p>
                            <p className="text-[10px] text-gray-400">{reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : 'N/A'} &bull; {reg.eventId?.venue}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg self-start ${
                            reg.status === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>{reg.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MEMBERSHIP */}
              {activeSection === 'membership' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Membership Status</h2>
                  {!data.membership ? (
                    <div className="text-center py-10 text-slate-500 text-sm space-y-3">
                      <p>No membership found.</p>
                      <Link to="/membership" className="inline-block bg-saffron-600 text-white font-bold px-5 py-2 rounded-xl text-xs">View Plans</Link>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-slate-800 p-6 rounded-2xl space-y-3 text-sm text-gray-700 dark:text-slate-300">
                      <div className="flex justify-between"><span className="font-bold">Plan</span><span>{data.membership.plan}</span></div>
                      <div className="flex justify-between"><span className="font-bold">Status</span>
                        <span className={`font-bold ${data.membership.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>{data.membership.status}</span>
                      </div>
                      <div className="flex justify-between"><span className="font-bold">Amount Paid</span><span>₹{data.membership.amountPaid}</span></div>
                      <div className="flex justify-between"><span className="font-bold">Start Date</span><span>{data.membership.startDate ? new Date(data.membership.startDate).toLocaleDateString() : 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="font-bold">Renewal Date</span><span>{data.membership.endDate ? new Date(data.membership.endDate).toLocaleDateString() : 'Lifetime'}</span></div>
                    </div>
                  )}
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
                      <p className="text-[11px] text-emerald-600/80">Includes devotee donations, trusts endowments, and pooja bookings.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-2xl space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">Total Expenses / Outgoings</span>
                      <div className="text-3xl font-extrabold text-rose-800 dark:text-rose-300">₹{(data.financials?.totalExpenses || 0).toLocaleString()}</div>
                      <p className="text-[11px] text-rose-600/80">Includes daily Annadanam, staff salaries, constructions, and social aid.</p>
                    </div>
                  </div>

                  {/* Net Balance */}
                  <div className="p-5 bg-amber-50 dark:bg-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-maroon-900 dark:text-amber-400">Net Surplus / Reserve Balance</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Retained in trust savings account for upcoming major festival celebrations.</p>
                    </div>
                    <div className="text-2xl font-extrabold text-saffron-700">
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
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm flex items-center gap-3">
                          <User className="w-5 h-5 text-saffron-600" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Full Name</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{user?.name}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm flex items-center gap-3">
                          <Mail className="w-5 h-5 text-saffron-600" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Email Address</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{user?.email}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm flex items-center gap-3">
                          <Phone className="w-5 h-5 text-saffron-600" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Phone Number</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{user?.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-850 shadow-sm flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-saffron-600" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Registered On</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
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
