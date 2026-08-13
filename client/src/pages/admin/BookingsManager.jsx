import React, { useState } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import { RefreshCcw } from 'lucide-react';
import Skeleton from '../../components/common/Skeleton.jsx';
import { useBookings } from '../../hooks/queries/useQueries.js';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../hooks/queries/queryKeys.js';

const payColor = (s) => s === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
const bookColor = (s) => ({ confirmed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-700');

const BookingsManager = () => {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: loading, refetch } = useBookings();

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.bookingStatus === filter || b.paymentStatus === filter);

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Pooja Bookings</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Monitor all pooja slot bookings and payments</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'confirmed', 'pending', 'cancelled', 'paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold capitalize border transition ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                }`}>{f}</button>
          ))}
          <button onClick={() => refetch()} className="p-2 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-800 transition" title="Refresh">
            <RefreshCcw className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />) :
          filtered.length === 0 ? <p className="text-center text-slate-400 text-sm py-10">No bookings found.</p> :
            filtered.map((b) => (
              <div key={b._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-800 dark:text-white">{b.userId?.name || 'N/A'}</p>
                    <p className="text-xs text-amber-700 font-semibold">{b.slotId?.poojaType || '—'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {b.slotId?.date ? new Date(b.slotId.date).toLocaleDateString() : '—'} · {b.slotId?.startTime || ''}
                    </p>
                  </div>
                  <p className="font-extrabold text-amber-600 shrink-0">₹{b.amountPaid}</p>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${payColor(b.paymentStatus)}`}>{b.paymentStatus}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${bookColor(b.bookingStatus)}`}>{b.bookingStatus}</span>
                  {b.gotra && <span className="text-[9px] text-gray-400">{b.gotra}</span>}
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
                  <td className="px-4 py-3 font-extrabold text-amber-700">₹{b.amountPaid}</td>
                  <td className="px-4 py-3"><span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${payColor(b.paymentStatus)}`}>{b.paymentStatus}</span></td>
                  <td className="px-4 py-3"><span className={`font-bold px-2 py-0.5 rounded-full text-[9px] capitalize ${bookColor(b.bookingStatus)}`}>{b.bookingStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default BookingsManager;
