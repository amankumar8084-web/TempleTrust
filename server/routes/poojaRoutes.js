import express from 'express';
import {
  getPoojaSlots,
  bookPooja,
  verifyBookingPayment,
  getMyBookings,
  adminGetBookings,
  adminCreateSlot,
  adminRescheduleBooking,
  adminCancelBooking
} from '../controllers/poojaController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { validateBooking } from '../middleware/validator.js';

const router = express.Router();

// Devotee / Visitor endpoints
router.get('/slots', getPoojaSlots);
router.post('/book', protect, validateBooking, bookPooja);
router.post('/verify', protect, verifyBookingPayment);
router.get('/my-bookings', protect, getMyBookings);

// Admin endpoints
router.get('/admin/bookings', protect, restrictTo('Admin', 'Super Admin', 'Staff', 'Trustee'), adminGetBookings);
router.post('/admin/slots', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminCreateSlot);
router.put('/admin/bookings/:id/reschedule', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminRescheduleBooking);
router.delete('/admin/bookings/:id', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminCancelBooking);

export default router;
