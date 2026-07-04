import express from 'express';
import {
  initializeDonation,
  verifyDonation,
  getMyDonations,
  downloadReceiptFile,
  exportDonationReport
} from '../controllers/donationController.js';
import { protect, optionalProtect, restrictTo } from '../middleware/authMiddleware.js';
import { validateDonation } from '../middleware/validator.js';

const router = express.Router();

router.post('/initialize', optionalProtect, validateDonation, initializeDonation);
router.post('/verify', optionalProtect, verifyDonation);
router.get('/history', protect, getMyDonations);
router.get('/receipt/:id/file', optionalProtect, downloadReceiptFile);
router.get('/export', protect, restrictTo('Admin', 'Super Admin', 'Trustee'), exportDonationReport);

export default router;
