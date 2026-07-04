import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart, CreditCard, QrCode } from 'lucide-react';
import api from '../services/api.js';
import QRCodeModal from '../components/donation/QRCodeModal.jsx';

const DONATION_CATEGORIES = [
  { id: 'General', name: 'General Donation', desc: 'Used for daily temple administration and general maintenance.' },
  { id: 'Annadanam', name: 'Daily Annadanam', desc: 'Sponsor free sanctified meals distributed daily to pilgrims.' },
  { id: 'Development', name: 'Temple Development', desc: 'Supports expansion of the pink sandstone temple corridors.' },
  { id: 'Festival', name: 'Festival Fund', desc: 'Supports hosting Maha Shivratri, Janmashtami, and Diwali.' },
  { id: 'Gau Seva', name: 'Gau Seva Fund', desc: 'Contributes to maintenance of cows in our temple Gaushala.' },
  { id: 'Education', name: 'Education Charity', desc: 'Supports scholarships and free Sanskrit learning programs.' }
];

const PRESET_AMOUNTS = [251, 501, 1001, 2501, 5001];

const Donate = () => {
  const { user } = useSelector((state) => state.auth);

  const [category, setCategory] = useState('General');
  const [amount, setAmount] = useState(501);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [panCard, setPanCard] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const activeAmount = customAmount ? Number(customAmount) : amount;

  const handleInitializeRazorpay = async (e) => {
    e.preventDefault();
    if (activeAmount <= 0) {
      alert("Please specify a valid donation amount.");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const initRes = await api.post('/donations/initialize', {
        amount: activeAmount,
        category,
        donorName: anonymous ? 'Anonymous' : name,
        donorEmail: email,
        donorPhone: phone,
        panCard,
        anonymous
      });

      const { orderId, key } = initRes.data.data;

      // Initialize standard Razorpay checkout overlay
      const options = {
        key: key,
        amount: activeAmount * 100,
        currency: 'INR',
        name: 'BrahamBaba Trust',
        description: `${category} Donation`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/donations/verify', {
              donationId: initRes.data.data.donationId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setSuccessReceipt(verifyRes.data.receiptNumber);
          } catch (err) {
            setErrorMessage('Payment verification failed. Please contact trust office.');
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: '#d97706' // saffron
        }
      };

      // Check if Razorpay script is loaded or mock
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for developer testing if SDK not loaded: mock signature verification callback
        console.warn('Razorpay SDK not loaded. Triggering Developer Mock Flow.');
        setOrderDetails(initRes.data.data);
        setQrOpen(true);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error initializing transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDirectQRVerify = async () => {
    if (!orderDetails) return;
    setLoading(true);
    try {
      const verifyRes = await api.post('/donations/verify', {
        donationId: orderDetails.donationId,
        razorpayOrderId: orderDetails.orderId,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
        razorpaySignature: 'mock_sig_dev_bypass_998877'
      });
      setSuccessReceipt(verifyRes.data.receiptNumber);
      setQrOpen(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error verifying payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-spiritual">
      
      {successReceipt ? (
        <div className="bg-white dark:bg-slate-900 border border-green-200 dark:border-green-950 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-2xl space-y-6">
          <span className="text-5xl text-green-500 font-bold block">✓</span>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Thank You for Your Generosity!</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Your donation of <strong className="text-saffron-600">₹{activeAmount}</strong> has been successfully processed. Receipt number: <strong className="text-saffron-600">{successReceipt}</strong>.
          </p>
          <p className="text-xs text-slate-500">
            A confirmation receipt PDF has been dispatched to your email address: {email}.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSuccessReceipt(null);
                setCustomAmount('');
                setPanCard('');
              }}
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
            >
              Donate Again
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Categories Grid (2 Cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-6 rounded-3xl shadow">
              <h2 className="text-2xl font-bold text-maroon-900 dark:text-amber-500 mb-2">Select Donation Fund</h2>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-6">Choose a category where your contribution will make the biggest difference.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DONATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`text-left p-4 rounded-2xl border transition ${
                      category === cat.id
                        ? 'border-saffron-600 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-gray-200 hover:border-amber-300 dark:border-slate-800'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${category === cat.id ? 'bg-saffron-600' : 'bg-gray-300'}`} />
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-gray-600 dark:text-slate-400 mt-2 line-clamp-2">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Checkout Panel */}
          <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-maroon-900 dark:text-amber-500 border-b border-gray-100 dark:border-slate-800 pb-2">
              Payment Checkout
            </h3>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleInitializeRazorpay} className="space-y-4">
              
              {/* Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 dark:text-slate-400">Select Amount (INR)</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => {
                        setAmount(val);
                        setCustomAmount('');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        amount === val && !customAmount
                          ? 'bg-saffron-600 border-saffron-600 text-white shadow'
                          : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-amber-300'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Value */}
              <div>
                <input
                  type="number"
                  placeholder="Or enter custom amount (e.g. 5000)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                />
              </div>

              <hr className="border-gray-100 dark:border-slate-800" />

              {/* Donor fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={anonymous}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">Mobile Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500">PAN Card (For Section 80G Benefit)</label>
                  <input
                    type="text"
                    value={panCard}
                    onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-saffron-500 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="rounded text-saffron-600"
                  />
                  <label htmlFor="anon" className="text-xs text-gray-600 dark:text-slate-400 font-semibold cursor-pointer">
                    Donate Anonymously
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-102 transition flex items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>{loading ? 'Processing Order...' : `Proceed to Pay ₹${activeAmount}`}</span>
              </button>

            </form>
          </div>

        </div>
      )}

      {/* QR MODAL for local testing */}
      <QRCodeModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        amount={activeAmount}
        category={category}
        onSimulateVerify={handleSimulateDirectQRVerify}
      />

    </div>
  );
};

export default Donate;
export { Donate };
