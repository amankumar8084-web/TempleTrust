import express from 'express';
import {
  registerAsVolunteer,
  getVolunteerProfile,
  adminGetVolunteers,
  adminApproveVolunteer,
  adminAssignDuty
} from '../controllers/volunteerController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerAsVolunteer);
router.get('/profile', protect, getVolunteerProfile);

// Admin / Staff routes
router.get('/admin/all', protect, restrictTo('Admin', 'Super Admin', 'Staff', 'Trustee'), adminGetVolunteers);
router.put('/admin/:id/approve', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminApproveVolunteer);
router.post('/admin/assign-duty', protect, restrictTo('Admin', 'Super Admin', 'Staff'), adminAssignDuty);

export default router;
