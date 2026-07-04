import express from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getAuditLogs,
  getContactMessages,
  submitContactMessage,
  replyContactMessage,
  getSystemSettings,
  updateSystemSettings,
  getTempleContent,
  updateTempleContent,
  getRoles,
  getFinancials
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly readable CMS data & Contact Message Form Submissions
router.get('/content', getTempleContent);
router.post('/contact-messages', submitContactMessage);

// Stats & Dashboard Info
router.get('/stats', protect, restrictTo('Admin', 'Super Admin', 'Trustee'), getDashboardStats);

// User lists & role updates
router.get('/users', protect, restrictTo('Admin', 'Super Admin'), getUsers);
router.put('/users/:id/role', protect, restrictTo('Super Admin'), updateUserRole);
router.get('/roles', protect, restrictTo('Super Admin'), getRoles);

// Audit Trails (Super Admin exclusive)
router.get('/audit-logs', protect, restrictTo('Super Admin'), getAuditLogs);

// Contact Messages Admin Management
router.get('/contact-messages', protect, restrictTo('Admin', 'Super Admin', 'Staff'), getContactMessages);
router.put('/contact-messages/:id/reply', protect, restrictTo('Admin', 'Super Admin', 'Staff'), replyContactMessage);

// Settings
router.get('/settings', protect, restrictTo('Admin', 'Super Admin'), getSystemSettings);
router.put('/settings', protect, restrictTo('Admin', 'Super Admin'), updateSystemSettings);

// CMS Content update
router.put('/content', protect, restrictTo('Admin', 'Super Admin'), updateTempleContent);

// Financial summary for logged in users
router.get('/financials', protect, getFinancials);

export default router;
