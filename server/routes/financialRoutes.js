import express from 'express';
import {
    createFinancialRecord,
    getFinancialRecords,
    getFinancialSummary,
    updateFinancialRecord,
    deleteFinancialRecord,
    exportFinancialRecords,
    getPublicFinancialSummary,
    getPublicFinancialRecords,
    exportPublicFinancialRecords
} from '../controllers/financialController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public routes (any logged-in user) ────────────────────────────────────
router.get('/public-summary', protect, getPublicFinancialSummary);
router.get('/public', protect, getPublicFinancialRecords);
router.get('/public-export', protect, exportPublicFinancialRecords);

// ── Admin-only routes ─────────────────────────────────────────────────────
router.use(protect, restrictTo('Admin', 'Super Admin', 'Trustee'));

router.get('/summary', getFinancialSummary);
router.get('/export', exportFinancialRecords);
router.route('/')
    .get(getFinancialRecords)
    .post(createFinancialRecord);
router.route('/:id')
    .put(updateFinancialRecord)
    .delete(deleteFinancialRecord);

export default router;
