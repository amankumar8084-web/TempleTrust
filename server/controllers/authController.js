import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import AuditLog from '../models/AuditLog.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import { sendEmail } from '../services/emailService.js';
import { logger } from '../config/db.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/customErrors.js';

// Cookie options (Must be sameSite: 'none' and secure: true for cross-origin backend/frontend deployments)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new BadRequestError('User already exists with this email.'));
    }

    // Assign default role 'Devotee'
    const devoteeRole = await Role.findOne({ name: 'Devotee' });
    if (!devoteeRole) {
      return next(new NotFoundError('Default Devotee role not found. Run seed script.'));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: devoteeRole._id,
      status: 'active'
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTPOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'USER_REGISTER',
      details: `User registered successfully: ${user.email}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      status: 'success',
      token: accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'Devotee',
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user || !(await user.matchPassword(password))) {
      return next(new UnauthorizedError('Invalid email or password.'));
    }

    if (user.status !== 'active') {
      return next(new UnauthorizedError('Your account has been suspended or is pending approval.'));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);

    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      details: `User logged in: ${user.email}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      status: 'success',
      token: accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name || 'Devotee',
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    res.clearCookie('refreshToken');
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const rToken = req.cookies.refreshToken;
    if (!rToken) {
      return next(new UnauthorizedError('Refresh token not found. Please log in.'));
    }

    const decoded = jwt.verify(rToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).populate('role');
    if (!user || user.refreshToken !== rToken) {
      return next(new UnauthorizedError('Invalid refresh token. Please log in again.'));
    }

    const accessToken = generateAccessToken(user._id);
    res.status(200).json({
      status: 'success',
      token: accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new BadRequestError('Email address is required.'));
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists (auto-signup via OTP)
      const devoteeRole = await Role.findOne({ name: 'Devotee' });
      const tempPassword = Math.random().toString(36).slice(-8);
      user = await User.create({
        name: email.split('@')[0],
        email,
        phone: '',
        role: devoteeRole._id,
        status: 'active',
        isVerified: false,
        password: tempPassword
      });
    }

    // Generate 6 digit numeric code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'Your BrahamBaba Authentication OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #d97706; margin-top: 0;">BrahamBaba Trust</h2>
          <p>You requested a verification code to access your account. Please use the following One-Time Password (OTP):</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 15px; background-color: #fef3c7; color: #b45309; text-align: center; border-radius: 6px; margin: 20px 0;">
            ${otp}
          </div>
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#d97706;">Your One-Time Password (OTP)</h2>
          <p>Hello ${email},</p>
          <p>Your verification code is <strong style="font-size: 24px;">${otp}</strong>. It is valid for 10 minutes.</p>
          <p>If you did not request this code, you can ignore this email.</p>
          <hr style="margin-top:20px; border-top:1px solid #e5e7eb;"/>
          <p style="font-size:12px; color:#6b7280;">BrahamBaba Trust</p>
        </div>`
    });
    // Log for debugging (optional)
    logger.info(`[OTP EMAIL SENT] to ${email}`);

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully to your email.'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new BadRequestError('Email and OTP are required.'));
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires').populate('role');
    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      return next(new BadRequestError('Invalid or expired OTP.'));
    }

    // Clear OTP fields & verify user
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      token: accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name || 'Devotee',
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// Simulated direct Google OAuth Login for easy testing
export const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    if (!email || !googleId) {
      return next(new BadRequestError('Email and Google ID are required.'));
    }

    let user = await User.findOne({ email }).populate('role');

    if (!user) {
      const devoteeRole = await Role.findOne({ name: 'Devotee' });
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face',
        role: devoteeRole._id,
        isVerified: true,
        status: 'active'
      });
      // reload populate
      await user.populate('role');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      token: accessToken,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role?.name || 'Devotee',
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};
