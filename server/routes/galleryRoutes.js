import express from 'express';
import multer from 'multer';
import {
  getGallery,
  adminUploadMedia,
  adminDeleteMedia
} from '../controllers/galleryController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', getGallery);

// Admin/Staff management routes
router.post('/admin', protect, restrictTo('Admin', 'Super Admin', 'Staff'), upload.single('file'), adminUploadMedia);
router.delete('/admin/:id', protect, restrictTo('Admin', 'Super Admin'), adminDeleteMedia);

export default router;
