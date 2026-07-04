import express from 'express';
import { sendEmail } from '../services/emailService.js';
import { logger } from '../config/db.js';

const router = express.Router();

// Health check for email service
router.get('/health', (req, res) => {
  const isMock = !process.env.SMTP_USER || process.env.SMTP_USER === 'mock';
  res.json({ status: 'ok', mode: isMock ? 'mock' : 'smtp' });
});

// Direct email send endpoint
router.post('/send', async (req, res) => {
  const { to, subject, html, attachments } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
  }
  try {
    const result = await sendEmail({ to, subject, html, attachments });
    logger.info(`[EMAIL SENT] to ${to} subject "${subject}"`);
    res.json({ status: 'success', data: result });
  } catch (error) {
    logger.error(`Email send failure: ${error.message}`);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
