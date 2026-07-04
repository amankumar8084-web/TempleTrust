import express from 'express';
import {
  getAnnouncements,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice
} from '../controllers/announcementController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAnnouncements);

// Admin routes
router.post('/admin', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminCreateNotice);
router.put('/admin/:id', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminUpdateNotice);
router.delete('/admin/:id', protect, restrictTo('Admin', 'Super Admin'), adminDeleteNotice);

export default router;
