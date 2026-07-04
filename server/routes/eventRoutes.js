import express from 'express';
import {
  getEvents,
  registerForEvent,
  getMyEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  adminAssignVolunteer
} from '../controllers/eventController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.post('/register', protect, registerForEvent);
router.get('/my-events', protect, getMyEvents);

// Admin / Staff routes
router.post('/admin', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminCreateEvent);
router.put('/admin/:id', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminUpdateEvent);
router.delete('/admin/:id', protect, restrictTo('Admin', 'Super Admin'), adminDeleteEvent);
router.post('/admin/assign-volunteer', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminAssignVolunteer);

export default router;
