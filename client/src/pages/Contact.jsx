import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import api from '../services/api.js';

const FAQ_ITEMS = [
  { q: "What are the temple opening hours?", a: "The temple opens at 5:30 AM for Mangala Aarti and closes at 8:30 PM after Shayan Aarti. Afternoon closure is from 12:15 PM to 4:30 PM." },
  { q: "How do I book a Pooja slot?", a: "Visit the Pooja Booking section, select your preferred date, choose an available slot type (Archana, Abhishekam, etc.), fill in your Gotra and Nakshatra details, and make payment online." },
  { q: "Are donations tax-deductible?", a: "Yes. BrahamBaba Devotee Trust is registered under Section 80G of the Income Tax Act. All donations are eligible for 50% tax exemption. A tax receipt PDF is auto-sent to your email." },
  { q: "How can I register as a volunteer?", a: "Visit the Volunteer Registration page, select your skills and availability, and submit. Our team will review and approve within 3-5 working days." },
  { q: "What membership plans are available?", a: "We offer Regular (monthly), Annual (yearly), and Lifetime membership plans with varying levels of benefits and privileges." },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/contact-messages', form);
      setSuccess('Your message has been sent successfully! We will contact you within 24 hours.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-spiritual">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">Get In Touch</span>
        <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">Contact Us</h1>
        <p className="max-w-xl mx-auto text-sm text-gray-600 dark:text-slate-400">Reach out to the temple office for inquiries, spiritual guidance, or event information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-8 rounded-3xl shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-400">Send a Message</h3>
          {success && <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl font-bold">{success}</div>}
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', required: true },
              { label: 'Email Address', name: 'email', type: 'email', required: true },
              { label: 'Phone Number', name: 'phone', type: 'text', required: false },
            ].map(({ label, name, type, required }) => (
              <div key={name}>
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
                <input type={type} name={name} required={required} value={form[name]} onChange={handleChange}
                  className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-saffron-500 dark:text-white" />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Your Message</label>
              <textarea name="message" rows={5} required value={form.message} onChange={handleChange}
                placeholder="How can we help you today?"
                className="mt-1 w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-saffron-500 dark:text-white resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition">
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-6 rounded-3xl shadow space-y-4">
            <h3 className="text-lg font-bold text-maroon-900 dark:text-amber-400">Temple Office Details</h3>
            {[
              { icon: MapPin, text: 'BrahamBaba Temple Complex, Highway 2, Spiritual Valley, Pin - 302001' },
              { icon: Phone, text: '+91-9876543210' },
              { icon: Mail, text: 'info@brahambaba.org' },
              { icon: Clock, text: 'Office Hours: Mon–Sat, 9:00 AM to 6:00 PM' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-slate-300">
                <Icon className="h-5 w-5 text-saffron-600 shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Google Maps Embed */}
          <div className="rounded-3xl overflow-hidden border border-amber-100 dark:border-slate-800/80 shadow">
            <iframe
              title="Temple Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.123456789!2d75.7873154!3d26.9124336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU0JzQ0LjgiTiA3NcKwNDcnMTQuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-maroon-900 dark:text-amber-500 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center font-semibold text-sm text-gray-800 dark:text-white hover:bg-amber-50/50 dark:hover:bg-slate-800/50 transition"
              >
                <span>{item.q}</span>
                <span className="text-saffron-600 font-bold text-lg">{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4 text-xs text-gray-600 dark:text-slate-400 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
export { Contact };
