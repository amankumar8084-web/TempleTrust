import { logger } from '../config/db.js';

export const sendSMS = async (to, message) => {
  logger.info(`[SMS Notification] To: ${to} | Message: ${message}`);
  // In production, integrate Twilio or local gateway:
  // const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body: message, to, from: process.env.TWILIO_PHONE_NUMBER });
  return { success: true };
};
