import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t-4 border-saffron-600 font-spiritual">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white tracking-wide">BrahamBaba</h3>
          <p className="text-sm text-slate-400">
            Sustaining sacred Vedic traditions and spreading divine compassion through daily Annadanam and charitable social services since 1978.
          </p>
          <div className="text-xs text-slate-500">
            Registered 80G Charity | Section 12A Compliant
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-saffron-500 pb-2 inline-block">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-amber-400 transition">About the Temple</Link></li>
            <li><Link to="/donate" className="hover:text-amber-400 transition">Online Donations</Link></li>
            <li><Link to="/pooja" className="hover:text-amber-400 transition">Book a Pooja Slot</Link></li>
            <li><Link to="/events" className="hover:text-amber-400 transition">Upcoming Festivals</Link></li>
            <li><Link to="/gallery" className="hover:text-amber-400 transition">Photo Gallery</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-saffron-500 pb-2 inline-block">
            Get Involved
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/volunteer-register" className="hover:text-amber-400 transition">Register as Volunteer</Link></li>
            <li><Link to="/membership" className="hover:text-amber-400 transition">Join Membership Plan</Link></li>
            <li><Link to="/announcements" className="hover:text-amber-400 transition">Notice Board Alerts</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition">Help & FAQs</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-saffron-500 pb-2 inline-block">
            Contact Office
          </h4>
          <p className="text-sm text-slate-400 mb-2">
            BrahamBaba Temple Complex,<br />
            Highway 2, Spiritual Valley, Pin - 302001
          </p>
          <p className="text-sm text-slate-400 mb-1">
            <strong>Phone:</strong> +91-9876543210
          </p>
          <p className="text-sm text-slate-400">
            <strong>Email:</strong> info@brahambaba.org
          </p>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} BrahamBaba Devotee Trust. All Rights Reserved. Designed for maximum spiritual transparency.
      </div>
    </footer>
  );
};

export default Footer;
export { Footer };
