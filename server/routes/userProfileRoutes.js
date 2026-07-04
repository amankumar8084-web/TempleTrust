import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  changeProfilePicture,
  removeProfilePicture
} from '../controllers/userProfileController.js';

// Multer memory storage (file buffer kept in memory)
const storage = multer.memoryStorage();

// File filter – accept only image types
const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'), false);
  }
};

// Limits – max file size 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

const router = express.Router();

// Get user profile – protected
router.get('/profile', protect, getProfile);

// Update user profile (name, phone) – protected
router.put('/profile', protect, updateProfile);

// Change profile picture – protected, expects multipart/form-data with field 'avatar'
router.post('/change', protect, upload.single('avatar'), changeProfilePicture);

// Remove profile picture – protected, resets to default avatar
router.delete('/remove', protect, removeProfilePicture);

export default router;
