import express from 'express';
import multer from 'multer';
import {
    createFinancialRecord,
    getFinancialRecords,
    getFinancialSummary,
    updateFinancialRecord,
    deleteFinancialRecord,
    exportFinancialRecords,
    getPublicFinancialSummary,
    getPublicFinancialRecords,
    exportPublicFinancialRecords,
    uploadFinancialAttachment,
    deleteFinancialAttachment
} from '../controllers/financialController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer: memory storage for image bill attachments
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'), false);
        }
    }
});

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

// Bill image attachment CRUD
router.post('/:id/attachments', upload.single('attachment'), uploadFinancialAttachment);
router.delete('/:id/attachments/:attachmentId', deleteFinancialAttachment);

export default router;

