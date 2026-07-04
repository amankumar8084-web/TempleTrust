import Razorpay from 'razorpay';
import crypto from 'crypto';
import { logger } from './db.js';

const isMock = !process.env.RAZORPAY_KEY_ID || 
               process.env.RAZORPAY_KEY_ID === 'rzp_test_mockkeyid123';

let razorpay = null;

if (!isMock) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  logger.info('Razorpay configured successfully.');
} else {
  logger.warn('Razorpay keys not set. Running payments in MOCK mode.');
}

export const createRazorpayOrder = async (amount, currency = 'INR') => {
  if (isMock) {
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: mockOrderId,
      amount: amount * 100, // Razorpay works in paise
      currency,
      status: 'created',
      receipt: `receipt_${Date.now()}`
    };
  }

  return await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: `receipt_${Date.now()}`
  });
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  if (isMock) {
    // In mock mode, if signature starts with 'mock', it's valid
    return signature && signature.startsWith('mock_sig');
  }

  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generated === signature;
};

export default razorpay;
export { isMock as isRazorpayMock };
