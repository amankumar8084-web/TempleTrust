import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/layout/AdminSidebar.jsx';
import { Plus, Trash2, Edit3, Users } from 'lucide-react';
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
      fetchEvents();
    } catch (err) { alert(err.response?.data?.message || 'Error deleting event.'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 font-spiritual">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white">Events Manager</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Create and manage temple events and festivals</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
            <Plus className="h-3.5 w-3.5" /> New Event
          </button>
        </div>

        {msg && <div className="p-3 bg-amber-50 text-amber-700 text-xs rounded-xl font-bold border border-amber-200">{msg}</div>}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-6 rounded-2xl shadow space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-white">Create New Event</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Event Title', key: 'title', type: 'text' },
                { label: 'Venue', key: 'venue', type: 'text' },
                { label: 'Date', key: 'date', type: 'date' },
                { label: 'Time', key: 'time', type: 'text' },
                { label: 'Registration Limit', key: 'registrationLimit', type: 'number' },
                { label: 'Fees (0 = Free)', key: 'fees', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-gray-500">{label}</label>
                  <input type={type} required={['title', 'venue', 'date', 'time'].includes(key)} value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500">Description</label>
              <textarea rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-5 py-2 rounded-xl">
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-bold px-5 py-2 rounded-xl">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? [1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />) :
            events.length === 0 ? <p className="text-slate-500 text-sm col-span-3 text-center py-10">No events found. Create one!</p> :
            events.map((event) => (
              <div key={event._id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-2xl shadow hover-lift space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2">{event.title}</h3>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handleDelete(event._id)} className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-2">{event.description}</p>
                <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-2 text-[10px]">
                  <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    {new Date(event.date).toLocaleDateString()} • {event.time}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3" />{event.registeredCount}/{event.registrationLimit}
                  </span>
                  <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
                    {event.fees === 0 ? 'Free' : `₹${event.fees}`}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default EventsManager;
