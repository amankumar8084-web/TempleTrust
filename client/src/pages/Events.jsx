import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MapPin, Calendar, Clock } from 'lucide-react';
import Skeleton from '../components/common/Skeleton.jsx';
import { useEvents, useMyEvents } from '../hooks/queries/useQueries.js';
import { useRegisterEvent } from '../hooks/queries/useMutations.js';

const Events = () => {
  const { user } = useSelector((state) => state.auth);

  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: myEvents = [], isLoading: myEventsLoading } = useMyEvents(!!user);
  const loading = eventsLoading || (!!user && myEventsLoading);

  const registeredIds = myEvents.map(r => r.eventId?._id);
  const registerMutation = useRegisterEvent();

  const [msg, setMsg] = useState('');

  const handleRegister = async (eventId) => {
    if (!user) {
      alert("Please log in to register for events.");
      return;
    }
    setMsg('');
    registerMutation.mutate(eventId, {
      onSuccess: () => setMsg('Registered successfully! Confirmation sent.'),
      onError: (err) => setMsg(err.response?.data?.message || 'Failed to register.')
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-spiritual">
      <div className="text-center space-y-3">
        <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
          Festivals & Celebrations
        </span>
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
          Temple Events
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-gray-600 dark:text-slate-400">
          Participate in upcoming Satsangs, Maha Pujas, and community social gatherings. Reserve your entry spots early.
        </p>
      </div>

      {msg && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-bold max-w-md mx-auto text-center">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-3xl" />)}
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-slate-500 py-10">No upcoming events listed at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => {
            const isFull = event.registeredCount >= event.registrationLimit;
            const isRegistered = registeredIds.includes(event._id);
            return (
              <div
                key={event._id}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-lg hover-lift flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-saffron-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {event.fees === 0 ? 'Free Entry' : `₹${event.fees}`}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight">{event.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-3">{event.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-saffron-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-saffron-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-saffron-500" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-semibold text-slate-500">
                      Registered: {event.registeredCount} / {event.registrationLimit}
                    </span>

                    {isRegistered ? (
                      <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200">
                        Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={isFull || registerMutation.isPending}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition ${isFull
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-saffron-600 hover:bg-saffron-700 text-white shadow hover:scale-105'
                          }`}
                      >
                        {isFull ? 'Sold Out' : 'Register Now'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
export { Events };
