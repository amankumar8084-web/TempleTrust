import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import { logger } from '../config/db.js';

// Validate required SMTP environment variables
const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    logger.error(`Missing required environment variable ${key} for email service`);
    throw new Error(`Email service configuration error: ${key} is not set`);
  }
}

// Initialize transporter using real SMTP credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
logger.info('SMTP Email Transporter initialized with credentials from .env');

// Send email utility
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"BrahamBaba Temple Trust" <nirogdhamalawat@gmail.com>',
      to,
      subject,
      html,
      attachments
    });
    logger.info(`Email sent successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};
