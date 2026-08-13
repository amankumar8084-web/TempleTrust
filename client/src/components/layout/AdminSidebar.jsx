import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  HeartHandshake,
  IndianRupee,
  CalendarClock,
  CalendarRange,
  ShieldCheck,
  Users,
  Megaphone,
  Image,
  Settings as SettingsIcon,
  Edit3,
  History,
  Mail,
  Home,
  X
} from 'lucide-react';

const AdminSidebar = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === 'Super Admin';

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Donations', path: '/admin/donations', icon: HeartHandshake },
    { name: 'Financials', path: '/admin/financials', icon: IndianRupee },
    { name: 'Pooja Bookings', path: '/admin/bookings', icon: CalendarClock },
    { name: 'Events', path: '/admin/events', icon: CalendarRange },
    { name: 'Volunteers', path: '/admin/volunteers', icon: ShieldCheck },
    { name: 'Memberships', path: '/admin/memberships', icon: Users },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Contacts', path: '/admin/contacts', icon: Mail },
    { name: 'Temple CMS', path: '/admin/content', icon: Edit3 },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  if (isSuperAdmin) {
    menuItems.push({ name: 'Audit Logs', path: '/admin/audit-logs', icon: History });
  }

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 font-spiritual overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>BrahamBaba</span>
            <span className="text-[9px] bg-saffron-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">Admin</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Role: {user?.role}</p>
        </div>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/admin'}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive
                  ? 'bg-saffron-600 text-white shadow-lg'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pt-2 pb-4 border-t border-slate-800 shrink-0">
        <NavLink
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 hover:text-white text-slate-400 transition"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Back to Site</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
export { AdminSidebar };
