import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Award, Check, CreditCard, Sparkles } from 'lucide-react';
import api from '../services/api.js';
import Skeleton from '../components/common/Skeleton.jsx';

const PLAN_TIERS = [
  {
    name: 'Regular',
    price: 500,
    period: 'month',
    desc: 'Support basic daily Pujas and food distribution.',
    features: ['Access to notices', 'Email newsletter', 'Digital membership card', 'Invitations to general Pujas']
  },
  {
    name: 'Annual',
    price: 1500,
    period: 'year',
    desc: 'Sustained contribution supporting Gaushala and Sanskrit classes.',
    features: ['All Regular features', 'Prasad home-delivery on festivals', 'Free Pooja slot discount', 'Special seatings during festivals']
  },
  {
    name: 'Lifetime',
    price: 5000,
    period: 'one-time',
    desc: 'Ultimate contribution supporting structural temple building projects.',
    features: ['All Annual features', 'Garbhagriha entry pass', 'Name engraved on sponsor wall', 'Annual trustee meeting invite', 'Personalized family archana slot']
  }
];

const Membership = () => {
  const { user } = useSelector((state) => state.auth);

  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMembershipStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/memberships/status');
      setActivePlan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipStatus();
  }, [user]);

  const handleSubscribe = async (planName) => {
    if (!user) {
      alert("Please log in to purchase a membership.");
      return;
    }

    setPurchaseLoading(true);
    setErrorMsg('');
    try {
      const initRes = await api.post('/memberships/join', { plan: planName });
      const { orderId, key, amount } = initRes.data.data;

      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'BrahamBaba Trust',
        description: `Membership plan: ${planName}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/memberships/verify', {
              membershipId: initRes.data.data.membershipId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            setSuccessPlan(verifyRes.data.membership);
            fetchMembershipStatus();
          } catch (err) {
            setErrorMsg('Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
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
        // Mock fallback verification
        console.warn('Razorpay SDK not loaded. Simulating mock membership verification.');
        const verifyRes = await api.post('/memberships/verify', {
          membershipId: initRes.data.data.membershipId,
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_member_${Math.random().toString(36).substring(2, 9)}`,
          razorpaySignature: 'mock_sig_dev_bypass_998877'
        });
        setSuccessPlan(verifyRes.data.membership);
        fetchMembershipStatus();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error processing purchase.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-spiritual">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
          Devotional Covenant
        </span>
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
          Membership Plans
        </h1>
        <p className="max-w-xl mx-auto text-sm text-gray-600 dark:text-slate-400">
          Partner with BrahamBaba Trust. Support our social initiatives and receive divine privileges.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold max-w-md mx-auto text-center">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-3xl" />)}
        </div>
      ) : activePlan && activePlan.status === 'active' ? (
        // Active Membership display card!
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-2xl space-y-6">
          <div className="bg-spiritual-gradient p-6 rounded-2xl text-white text-left relative overflow-hidden shadow-lg border border-amber-300/20">
            <div className="absolute top-2 right-2 text-amber-300 opacity-20">
              <Award className="w-32 h-32" />
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg tracking-wide">BrahamBaba Devotee Card</h4>
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {activePlan.plan} Plan
                  </span>
                </div>
                <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[9px] text-amber-200 uppercase">Member Name</div>
                  <strong className="text-sm font-semibold">{user?.name}</strong>
                </div>
                <div>
                  <div className="text-[9px] text-amber-200 uppercase">Card Serial</div>
                  <strong className="text-sm font-mono uppercase">{activePlan._id.substring(18)}</strong>
                </div>
                <div>
                  <div className="text-[9px] text-amber-200 uppercase">Registered Date</div>
                  <strong>{new Date(activePlan.startDate).toLocaleDateString()}</strong>
                </div>
                <div>
                  <div className="text-[9px] text-amber-200 uppercase">Renewal Date</div>
                  <strong>{activePlan.endDate ? new Date(activePlan.endDate).toLocaleDateString() : 'Lifetime'}</strong>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-white">You Are An Active Member</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your generous monthly or annual contributions sustain the Daily Annadanam kitchen and shrine worships.
          </p>
        </div>
      ) : (
        // Standard Plan selector cards
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-lg flex flex-col justify-between space-y-6 hover-lift relative"
            >
              {tier.name === 'Lifetime' && (
                <span className="absolute top-4 right-4 bg-saffron-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-400">{tier.name} Member</h3>
                  <p className="text-xs text-gray-500 mt-1">{tier.desc}</p>
                </div>

                <div className="py-2 border-y border-gray-100 dark:border-slate-800 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">₹{tier.price}</span>
                  <span className="text-xs text-gray-500">/ {tier.period}</span>
                </div>

                <ul className="space-y-2 text-xs text-gray-600 dark:text-slate-400">
                  {tier.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-saffron-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(tier.name)}
                disabled={purchaseLoading}
                className="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Join Plan</span>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Membership;
export { Membership };
