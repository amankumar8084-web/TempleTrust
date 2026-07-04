import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, LogOut, Menu, X, User } from 'lucide-react';
import { toggleDarkMode } from '../../features/theme/themeSlice.js';
import { logoutSuccess } from '../../features/auth/authSlice.js';
import api from '../../services/api.js';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(logoutSuccess());
      navigate('/login');
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangOpen(false);
  };

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.donations'), path: '/donate' },
    { name: t('nav.pooja'), path: '/pooja' },
    { name: t('nav.events'), path: '/events' },
    { name: t('nav.gallery'), path: '/gallery' },
    { name: t('nav.announcements'), path: '/announcements' },
    { name: t('nav.volunteer'), path: '/volunteer-register' },
    { name: t('nav.membership'), path: '/membership' },
    { name: t('nav.contact'), path: '/contact' }
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-spiritual-gradient bg-clip-text text-transparent">
                BrahamBaba
              </span>
              <span className="text-[10px] bg-amber-500 text-white font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline">
                Trust
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-gray-700 hover:text-saffron-600 dark:text-gray-300 dark:hover:text-amber-500 px-3 py-2 rounded-md text-sm font-semibold transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Controls & Profile */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-saffron-600 transition flex items-center gap-1"
                title="Change Language"
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs font-bold uppercase">{i18n.language?.substring(0, 2)}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी' },
                    { code: 'ta', label: 'தமிழ்' },
                    { code: 'te', label: 'తెలుగు' },
                    { code: 'bn', label: 'বাংলা' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-amber-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 ${
                        i18n.language === lang.code ? 'font-bold text-saffron-600' : ''
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-saffron-600 transition"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Profile Dropdown */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Staff' || user.role === 'Trustee' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full border border-amber-200 dark:border-slate-700 transition"
                >
                  <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs font-bold text-saffron-800 dark:text-amber-400">{user.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-maroon-700 transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-spiritual-gradient text-white px-5 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 transition"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 text-gray-700 dark:text-gray-300"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-3 px-4 space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800 text-base font-semibold"
            >
              {item.name}
            </Link>
          ))}
          <hr className="border-gray-100 dark:border-slate-800 my-2" />
          
          {/* Languages in Mobile */}
          <div className="flex flex-wrap gap-2 py-2">
            {['en', 'hi', 'ta', 'te', 'bn'].map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  i18n.language === lang
                    ? 'bg-saffron-600 text-white border-saffron-600'
                    : 'border-gray-200 text-gray-700 dark:text-gray-300 dark:border-slate-700'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <div className="space-y-2 pt-2">
              <Link
                to={user.role === 'Admin' || user.role === 'Super Admin' || user.role === 'Staff' || user.role === 'Trustee' ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 text-sm font-bold text-saffron-800 dark:text-amber-400 flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" /> My Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center bg-red-50 hover:bg-red-100 dark:bg-red-950/20 py-2.5 rounded-xl text-sm font-bold text-red-600 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-spiritual-gradient text-white py-2.5 rounded-xl text-base font-semibold"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export { Navbar };
