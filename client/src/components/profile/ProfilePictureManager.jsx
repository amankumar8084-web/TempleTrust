import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Camera, Trash2, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api.js';
import { updateProfileSuccess } from '../../features/auth/authSlice.js';

const ProfilePictureManager = ({ currentUser }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Modals state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

  const validateFile = (file) => {
    if (!file) return false;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only image files (JPG, JPEG, PNG, WEBP, GIF) are allowed.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB.');
      return false;
    }
    setError('');
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setupFilePreview(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setupFilePreview(file);
      }
    }
  };

  const setupFilePreview = (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowPreviewModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(10);
    setError('');

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      // Simulate progress updates for smoother UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 150);

      const res = await api.post('/users/change', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Save updated avatar in state
      dispatch(updateProfileSuccess(res.data.data || { avatar: res.data.avatar }));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closePreviewModal();
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    setError('');
    try {
      const res = await api.delete('/users/remove');
      dispatch(updateProfileSuccess(res.data.data || { avatar: res.data.avatar }));
      setShowRemoveConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove image.');
    } finally {
      setUploading(false);
    }
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadProgress(0);
    setError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const isDefaultAvatar = currentUser?.avatar?.includes('unsplash.com') || !currentUser?.avatar;

  return (
    <div className="relative flex flex-col items-center">
      {/* Drag & Drop Overlay Container */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative group rounded-full p-1 transition-all duration-300 ${
          dragActive 
            ? 'bg-saffron-500 scale-105 shadow-xl shadow-saffron-500/20' 
            : 'bg-gradient-to-tr from-saffron-500 to-maroon-600 hover:shadow-lg'
        }`}
      >
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-inner flex items-center justify-center">
          
          {/* Progress Ring Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-slate-950/70 z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-saffron-500 animate-spin" />
              <span className="text-[10px] text-white font-bold mt-1.5">{uploadProgress}%</span>
            </div>
          )}

          {/* Current Avatar */}
          <img 
            src={currentUser?.avatar} 
            alt={currentUser?.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover Overlay with Camera Icon */}
          <div 
            onClick={triggerFileInput}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer z-10 text-white"
          >
            <Camera className="w-7 h-7 mb-1 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">Change Photo</span>
          </div>

          {/* Invisible File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Remove Button Tag (If not using default placeholder) */}
        {!isDefaultAvatar && !uploading && (
          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="absolute -bottom-1 -right-1 p-2 bg-red-600 text-white hover:bg-red-700 hover:scale-110 active:scale-95 rounded-full border-2 border-white dark:border-slate-900 shadow-md transition-all z-20"
            title="Remove Profile Picture"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Helper Text below Image */}
      <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-spiritual italic">
        Drag & drop image here or click avatar
      </span>

      {/* Error Message Toast */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Previews & Modals */}
      <AnimatePresence>
        {/* IMAGE PREVIEW MODAL */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">Profile Photo Preview</h3>
                <button 
                  onClick={closePreviewModal} 
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 transition"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="my-6 flex justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-amber-200 dark:border-slate-800 shadow-lg">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-2.5 rounded-xl border border-red-200 dark:border-red-900/40">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={closePreviewModal}
                  className="flex-1 px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || success}
                  className="flex-1 px-4 py-2 text-xs font-bold bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl shadow transition flex items-center justify-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Success!
                    </>
                  ) : (
                    'Set Profile Photo'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 dark:border-slate-800/80"
            >
              <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Remove Profile Photo?</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete your profile photo? This will revert your avatar to the default illustration.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl transition"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow transition flex items-center gap-1.5"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePictureManager;
