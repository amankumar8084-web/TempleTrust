import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  sendOTP,
  verifyOTP,
  googleLogin
} from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../middleware/validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);

export default router;
