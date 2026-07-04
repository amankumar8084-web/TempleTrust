import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Phone, User, KeyRound, Eye, EyeOff } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../features/auth/authSlice.js';
import api from '../services/api.js';

const TABS = ['Login', 'Register', 'OTP Login'];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('Login');
  const [showPassword, setShowPassword] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(authStart());
    try {
      const res = await api.post('/auth/login', loginForm);
      dispatch(authSuccess({ user: res.data.data, token: res.data.token }));
      redirectByRole(res.data.data.role);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      dispatch(authFailure(msg));
      setLocalError(msg);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(authStart());
    try {
      const res = await api.post('/auth/register', registerForm);
      dispatch(authSuccess({ user: res.data.data, token: res.data.token }));
      redirectByRole(res.data.data.role);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      dispatch(authFailure(msg));
      setLocalError(msg);
    }
  };

  const handleSendOTP = async () => {
    if (!otpEmail) { setLocalError('Please enter your email.'); return; }
    setLocalError('');
    setOtpLoading(true);
    try {
      await api.post('/auth/send-otp', { email: otpEmail });
      setOtpSent(true);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(authStart());
    try {
      const res = await api.post('/auth/verify-otp', { email: otpEmail, otp });
      dispatch(authSuccess({ user: res.data.data, token: res.data.token }));
      redirectByRole(res.data.data.role);
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed.';
      dispatch(authFailure(msg));
      setLocalError(msg);
    }
  };

  const redirectByRole = (role) => {
    if (['Admin', 'Super Admin', 'Staff', 'Trustee'].includes(role)) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const inputClass = "w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-500 dark:text-white pl-10";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-maroon-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 font-spiritual">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold bg-spiritual-gradient bg-clip-text text-transparent">BrahamBaba</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">Temple Trust Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-100 dark:border-slate-800/80 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-slate-800">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setLocalError(''); setOtpSent(false); }}
                className={`flex-1 py-3.5 text-xs font-bold transition border-b-2 ${activeTab === tab
                    ? 'border-saffron-600 text-saffron-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10'
                    : 'border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                  }`}
              >{tab}</button>
            ))}
          </div>

          <div className="p-8 space-y-5">
            {(localError || error) && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 text-xs rounded-xl font-bold border border-red-200 dark:border-red-900/40">
                {localError || error}
              </div>
            )}

            {/* LOGIN TAB */}
            {activeTab === 'Login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" placeholder="Email Address" required value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputClass} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-saffron-600 cursor-pointer hover:underline" onClick={() => setActiveTab('OTP Login')}>
                    Forgot Password? Login with OTP →
                  </span>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition">
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                <p className="text-center text-[10px] text-gray-500">
                  No account?{' '}
                  <button type="button" onClick={() => setActiveTab('Register')} className="text-saffron-600 font-bold hover:underline">
                    Register Here
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER TAB */}
            {activeTab === 'Register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Full Name" required value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} className={inputClass} />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" placeholder="Email Address" required value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className={inputClass} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" placeholder="Mobile Phone" value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} className={inputClass} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password (min. 6 chars)" required
                    value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* OTP LOGIN TAB */}
            {activeTab === 'OTP Login' && (
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" placeholder="Enter your Email Address" value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)} disabled={otpSent} className={inputClass} />
                </div>
                {!otpSent ? (
                  <button onClick={handleSendOTP} disabled={otpLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow transition">
                    {otpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
                  </button>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <p className="text-[10px] text-green-600 font-bold text-center">
                      OTP sent to {otpEmail}. Check your inbox (check Dev console logs too).
                    </p>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input type="text" placeholder="Enter 6-digit OTP" required value={otp}
                        onChange={(e) => setOtp(e.target.value)} maxLength={6} className={inputClass} />
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition">
                      {loading ? 'Verifying...' : 'Verify OTP & Login'}
                    </button>
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                      className="w-full text-xs text-gray-500 hover:text-gray-700 underline">
                      Change Email
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
        <p className="text-center text-[10px] text-slate-400">
          <strong>Demo:</strong> amankumar8084227421@gmail.com / superadmin123
        </p>
      </div>
    </div>
  );
};

export default Login;
export { Login };
