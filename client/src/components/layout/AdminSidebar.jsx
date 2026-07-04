import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  HeartHandshake, 
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
  Home
} from 'lucide-react';

const AdminSidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === 'Super Admin';

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Donations', path: '/admin/donations', icon: HeartHandshake },
    { name: 'Pooja Bookings', path: '/admin/bookings', icon: CalendarClock },
    { name: 'Events Manager', path: '/admin/events', icon: CalendarRange },
    { name: 'Volunteers', path: '/admin/volunteers', icon: ShieldCheck },
    { name: 'Memberships', path: '/admin/memberships', icon: Users },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Media Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Contact Inquiries', path: '/admin/contacts', icon: Mail },
    { name: 'CMS Temple Info', path: '/admin/content', icon: Edit3 },
    { name: 'System Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  // Super Admin exclusive
  if (isSuperAdmin) {
    menuItems.push({ name: 'Audit Logs', path: '/admin/audit-logs', icon: History });
  }

  return (
    <div className="w-64 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col border-r border-slate-800 font-spiritual">
      <div className="mb-8 pt-2">
        <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <span>BrahamBaba</span>
          <span className="text-[9px] bg-saffron-600 text-white font-bold px-1 py-0.5 rounded uppercase">Admin</span>
        </h3>
        <p className="text-[10px] text-slate-500 mt-1">Role: {user?.role}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-saffron-600 text-white shadow-lg'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 hover:text-white transition"
        >
          <Home className="h-4 w-4" />
          <span>Back to Site</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
export { AdminSidebar };
