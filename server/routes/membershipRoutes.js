import express from 'express';
import {
  joinMembership,
  verifyMembershipPayment,
  getMembershipStatus,
  adminGetMemberships
} from '../controllers/membershipController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/join', protect, joinMembership);
router.post('/verify', protect, verifyMembershipPayment);
router.get('/status', protect, getMembershipStatus);

// Admin / Trustee routes
router.get('/admin/all', protect, restrictTo('Admin', 'Super Admin', 'Staff', 'Trustee'), adminGetMemberships);

export default router;
