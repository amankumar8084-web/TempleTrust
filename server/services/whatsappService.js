import { logger } from '../config/db.js';

export const sendWhatsApp = async (to, message) => {
  logger.info(`[WhatsApp Notification] To: ${to} | Message: ${message}`);
  // In production, integrate Twilio WhatsApp API:
  // const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  //   to: `whatsapp:${to}`
  // });
  return { success: true };
};
