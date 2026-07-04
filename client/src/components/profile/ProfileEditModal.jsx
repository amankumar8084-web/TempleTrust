import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, User, Phone, Loader2, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api.js';
import { updateProfileSuccess } from '../../features/auth/authSlice.js';

const ProfileEditModal = ({ isOpen, onClose, currentUser }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.phone.trim() && !/^\+?[0-9\s\-]{10,15}$/.test(formData.phone.trim())) {
      setError('Please provide a valid phone number (10-15 digits)');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone
      });

      // Update Redux state and localStorage
      dispatch(updateProfileSuccess(res.data.data));

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-gray-800 dark:text-white">Edit Profile Details</h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-2.5 rounded-xl border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-slate-400">Email Address (Cannot be changed)</label>
            <div className="w-full bg-gray-50 dark:bg-slate-855/50 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-slate-500 cursor-not-allowed select-none">
              {currentUser?.email}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-500 dark:text-white pl-10"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="tel" 
                placeholder="Phone Number (e.g. +919876543210)" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-500 dark:text-white pl-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-bold bg-gray-105 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-4 py-2.5 text-xs font-bold bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl shadow transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileEditModal;
