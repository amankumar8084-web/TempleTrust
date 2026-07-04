import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';

const PoojaBooking = () => {
  const { user } = useSelector((state) => state.auth);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Devotee details
  const [devoteeName, setDevoteeName] = useState(user?.name || '');
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const res = await api.get(`/poojas/slots?date=${date}`);
        setSlots(res.data.data);
      } catch (err) {
        setErrorMessage('Failed to load slots.');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [date]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to book a pooja.");
      return;
    }
    if (!selectedSlot) return;

    setBookingLoading(true);
    setErrorMessage('');
    try {
      const initRes = await api.post('/poojas/book', {
        slotId: selectedSlot._id,
        devoteeName,
        gotra,
        nakshatra
      });

      const { orderId, key } = initRes.data.data;

      const options = {
        key: key,
        amount: selectedSlot.price * 100,
        currency: 'INR',
        name: 'BrahamBaba Trust',
        description: `Pooja Booking: ${selectedSlot.poojaType}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/poojas/verify', {
              bookingId: initRes.data.data.bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setSuccessBooking(verifyRes.data.booking);
            // Refresh slots
            const slotsRes = await api.get(`/poojas/slots?date=${date}`);
            setSlots(slotsRes.data.data);
          } catch (err) {
            setErrorMessage('Payment verification failed.');
          }
        },
        prefill: {
          name: devoteeName,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#d97706'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock payment verification bypass
        console.warn('Razorpay SDK not loaded. Simulating mock booking verification.');
        const verifyRes = await api.post('/poojas/verify', {
          bookingId: initRes.data.data.bookingId,
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_booking_${Math.random().toString(36).substring(2, 9)}`,
          razorpaySignature: 'mock_sig_dev_bypass_998877'
        });
        setSuccessBooking(verifyRes.data.booking);
        
        // Refresh slots
        const slotsRes = await api.get(`/poojas/slots?date=${date}`);
        setSlots(slotsRes.data.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error processing booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-spiritual">
      
      {successBooking ? (
        <div className="bg-white dark:bg-slate-900 border border-green-200 dark:border-green-950 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-2xl space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Pooja Slot Confirmed!</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Dear <strong className="text-saffron-600">{successBooking.devoteeName}</strong>, your slot booking has been confirmed.
          </p>
          <div className="bg-amber-50 dark:bg-slate-800 p-4 rounded-2xl text-xs space-y-2 text-left text-amber-900 dark:text-amber-300">
            <div><strong>Pooja Type:</strong> {selectedSlot?.poojaType}</div>
            <div><strong>Date:</strong> {new Date(date).toLocaleDateString()}</div>
            <div><strong>Time Slot:</strong> {selectedSlot?.startTime} - {selectedSlot?.endTime}</div>
            <div><strong>Gotra:</strong> {successBooking.gotra || 'N/A'}</div>
            <div><strong>Nakshatra:</strong> {successBooking.nakshatra || 'N/A'}</div>
          </div>
          <p className="text-[10px] text-slate-500">
            A confirmation schedule email was dispatched. Please reach the shrine 15 minutes in advance.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSuccessBooking(null);
                setSelectedSlot(null);
                setGotra('');
                setNakshatra('');
              }}
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
            >
              Book Another Pooja
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Calendar and Slots Listing */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-6 rounded-3xl shadow flex flex-col md:flex-row gap-4 justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-maroon-900 dark:text-amber-500">Pooja Booking System</h2>
                <p className="text-xs text-gray-600 dark:text-slate-400">Select Date to inspect available Aarti and Pooja sessions.</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-saffron-600" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-saffron-500 dark:text-white"
                />
              </div>
            </div>

            {/* Slots Cards */}
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-200 text-center text-slate-500">
                No slots configured for this date.
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => {
                  const isFull = slot.bookedCount >= slot.maxCapacity;
                  const isCurrentSelection = selectedSlot?._id === slot._id;
                  return (
                    <button
                      key={slot._id}
                      disabled={isFull}
                      onClick={() => setSelectedSlot(slot)}
                      className={`w-full text-left p-4 rounded-2xl border transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        isFull
                          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed dark:bg-slate-950 dark:border-slate-900'
                          : isCurrentSelection
                          ? 'border-saffron-600 bg-amber-50/50 dark:bg-amber-950/20'
                          : 'border-gray-200 dark:border-slate-800 hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isCurrentSelection ? 'bg-saffron-600' : 'bg-gray-300'}`} />
                          {slot.poojaType}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0">
                        <div className="text-left md:text-right">
                          <div className="text-[10px] text-gray-500">Availability</div>
                          <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                            {isFull ? 'Housefull' : `${slot.maxCapacity - slot.bookedCount} Slots left`}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500">Fare Price</div>
                          <span className="text-saffron-700 dark:text-amber-400 font-extrabold text-sm">₹{slot.price}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Devotee Details Form */}
          <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-maroon-900 dark:text-amber-500 border-b border-gray-100 dark:border-slate-800 pb-2">
              Devotee Information
            </h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">
                {errorMessage}
              </div>
            )}

            {!user ? (
              <div className="text-center p-6 space-y-3">
                <p className="text-xs text-slate-500">Please register or log in to secure pooja reservations.</p>
                <a href="/login" className="inline-block bg-saffron-600 text-white font-bold px-6 py-2 rounded-xl text-xs shadow">
                  Login / Signup
                </a>
              </div>
            ) : !selectedSlot ? (
              <p className="text-xs text-slate-500 text-center py-10">Select a Pooja slot from the list to proceed.</p>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="bg-amber-50 dark:bg-slate-800 p-3 rounded-xl border border-amber-200/50 text-xs text-amber-900 dark:text-amber-300">
                  <strong>Selected:</strong> {selectedSlot.poojaType}<br />
                  <strong>Timing:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}<br />
                  <strong>Price:</strong> ₹{selectedSlot.price}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500">Devotee Name</label>
                  <input
                    type="text"
                    required
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500">Gotra (Gothram)</label>
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="e.g. Kashyapa"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500">Nakshatra (Star)</label>
                  <input
                    type="text"
                    value={nakshatra}
                    onChange={(e) => setNakshatra(e.target.value)}
                    placeholder="e.g. Rohini"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-102 transition flex items-center justify-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span>{bookingLoading ? 'Processing...' : `Confirm & Pay ₹${selectedSlot.price}`}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default PoojaBooking;
export { PoojaBooking };
