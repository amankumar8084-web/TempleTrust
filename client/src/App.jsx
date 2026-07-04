import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Spinner from './components/common/Spinner.jsx';
import ChatBot from './components/chat/ChatBot.jsx';

// ─── Public Pages ─────────────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Donate = lazy(() => import('./pages/Donate.jsx'));
const PoojaBooking = lazy(() => import('./pages/PoojaBooking.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const Gallery = lazy(() => import('./pages/Gallery.jsx'));
const Announcements = lazy(() => import('./pages/Announcements.jsx'));
const Membership = lazy(() => import('./pages/Membership.jsx'));
const VolunteerRegister = lazy(() => import('./pages/VolunteerRegister.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));

// ─── User Pages ───────────────────────────────────────────────────────────────
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));

// ─── Admin Pages ──────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const DonationsManager = lazy(() => import('./pages/admin/DonationsManager.jsx'));
const EventsManager = lazy(() => import('./pages/admin/EventsManager.jsx'));
const AnnouncementsManager = lazy(() => import('./pages/admin/AnnouncementsManager.jsx'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager.jsx'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager.jsx'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager.jsx'));
const VolunteersManager = lazy(() => import('./pages/admin/VolunteersManager.jsx'));
const MembershipsManager = lazy(() => import('./pages/admin/MembershipsManager.jsx'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager.jsx'));
const BookingsManager = lazy(() => import('./pages/admin/BookingsManager.jsx'));

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ADMIN_ROLES = ['Admin', 'Super Admin', 'Staff', 'Trustee'];

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!ADMIN_ROLES.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Layout for Public Pages ──────────────────────────────────────────────────
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
    <ChatBot />
  </>
);

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>}>
        <Routes>
          {/* ── Auth Routes ───────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Public Routes ─────────────────────────────────────────── */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/donate" element={<PublicLayout><Donate /></PublicLayout>} />
          <Route path="/pooja" element={<PublicLayout><PoojaBooking /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/announcements" element={<PublicLayout><Announcements /></PublicLayout>} />
          <Route path="/membership" element={<PublicLayout><Membership /></PublicLayout>} />
          <Route path="/volunteer" element={<PublicLayout><VolunteerRegister /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

          {/* ── User Dashboard ────────────────────────────────────────── */}
          <Route path="/dashboard" element={<RequireAuth><PublicLayout><UserDashboard /></PublicLayout></RequireAuth>} />

          {/* ── Admin Routes ──────────────────────────────────────────── */}
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/donations" element={<RequireAdmin><DonationsManager /></RequireAdmin>} />
          <Route path="/admin/events" element={<RequireAdmin><EventsManager /></RequireAdmin>} />
          <Route path="/admin/announcements" element={<RequireAdmin><AnnouncementsManager /></RequireAdmin>} />
          <Route path="/admin/gallery" element={<RequireAdmin><GalleryManager /></RequireAdmin>} />
          <Route path="/admin/content" element={<RequireAdmin><ContentManager /></RequireAdmin>} />
          <Route path="/admin/settings" element={<RequireAdmin><SettingsManager /></RequireAdmin>} />
          <Route path="/admin/volunteers" element={<RequireAdmin><VolunteersManager /></RequireAdmin>} />
          <Route path="/admin/memberships" element={<RequireAdmin><MembershipsManager /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><UsersManager /></RequireAdmin>} />
          <Route path="/admin/bookings" element={<RequireAdmin><BookingsManager /></RequireAdmin>} />

          {/* ── 404 Fallback ──────────────────────────────────────────── */}
          <Route path="*" element={
            <PublicLayout>
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-spiritual text-center">
                <h1 className="text-6xl font-extrabold text-saffron-600">404</h1>
                <p className="text-lg text-gray-600 dark:text-slate-400">Page not found</p>
                <a href="/" className="bg-saffron-600 text-white font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition text-sm">
                  Return to Home
                </a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
