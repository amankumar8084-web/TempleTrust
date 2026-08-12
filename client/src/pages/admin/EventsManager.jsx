import React, { useState, useEffect } from 'react';
import AdminPageLayout from '../../components/layout/AdminPageLayout.jsx';
import { Plus, Trash2, Users, CalendarRange } from 'lucide-react';
import api from '../../services/api.js';
import Skeleton from '../../components/common/Skeleton.jsx';

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', venue: '', registrationLimit: 100, fees: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await api.post('/events/admin', form);
      setMsg('Event created successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', date: '', time: '', venue: '', registrationLimit: 100, fees: 0 });
      fetchEvents();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error creating event.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/admin/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Error deleting event.'); }
  };

  return (
    <AdminPageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800 dark:text-white">Events Manager</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Create and manage temple events and festivals</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition w-full sm:w-auto justify-center"
        >
          <Plus className="h-3.5 w-3.5" /> New Event
        </button>
      </div>

      {msg && <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl font-bold border border-amber-200">{msg}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-white">Create New Event</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Event Title', key: 'title', type: 'text', span: 2 },
              { label: 'Venue', key: 'venue', type: 'text' },
              { label: 'Date', key: 'date', type: 'date' },
              { label: 'Time', key: 'time', type: 'text', placeholder: 'e.g. 6:00 AM' },
              { label: 'Registration Limit', key: 'registrationLimit', type: 'number' },
              { label: 'Fees (₹, 0 = Free)', key: 'fees', type: 'number' },
            ].map(({ label, key, type, span, placeholder }) => (
              <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
                <input
                  type={type}
                  required={['title', 'venue', 'date', 'time'].includes(key)}
                  placeholder={placeholder || ''}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
            <textarea rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the event..."
              className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white resize-none" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" disabled={submitting}
              className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition">
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm font-bold px-5 py-2.5 rounded-xl transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />) :
          events.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <CalendarRange className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No events yet. Create one using the button above.</p>
            </div>
          ) :
            events.map((event) => (
              <div key={event._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-4 rounded-2xl shadow hover:-translate-y-0.5 hover:shadow-md transition-all space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2 flex-1">{event.title}</h3>
                  <button onClick={() => handleDelete(event._id)}
                    className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2">{event.description}</p>
                <div className="flex flex-wrap gap-1.5 text-[10px] pt-1.5 border-t border-gray-100 dark:border-slate-800">
                  <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    {new Date(event.date).toLocaleDateString()} · {event.time}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Users className="h-2.5 w-2.5" />{event.registeredCount || 0}/{event.registrationLimit}
                  </span>
                  <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
                    {event.fees === 0 ? 'Free' : `₹${event.fees}`}
                  </span>
                </div>
              </div>
            ))
        }
      </div>
    </AdminPageLayout>
  );
};

export default EventsManager;
