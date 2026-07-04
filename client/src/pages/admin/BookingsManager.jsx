import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/poojas/admin/all-bookings');
      setBookings(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.bookingStatus === filter || b.paymentStatus === filter);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Pooja Bookings</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Monitor all pooja slot bookings and payments</p>
          </div>
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'cancelled', 'paid'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold capitalize border transition ${
                  filter === f ? 'bg-saffron-600 text-white border-saffron-600' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                }`}>{f}</button>
            ))}
            <button onClick={fetchBookings} className="p-2 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-800">
              <RefreshCcw className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-amber-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                <tr>{['Devotee', 'Pooja Type', 'Date & Time', 'Gotra', 'Amount', 'Payment', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-6"><Skeleton className="h-8 w-full" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">No bookings found.</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-white">{b.userId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-amber-700 font-semibold">{b.slotId?.poojaType || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{b.slotId?.date ? new Date(b.slotId.date).toLocaleDateString() : '—'} {b.slotId?.startTime}</td>
                    <td className="px-4 py-3 text-gray-500">{b.gotra || '—'}</td>
                    <td className="px-4 py-3 font-extrabold text-saffron-700">₹{b.amountPaid}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${
                        b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{b.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${
                        b.bookingStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' : b.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>{b.bookingStatus}</span>
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

export default BookingsManager;
