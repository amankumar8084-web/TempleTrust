import { BadRequestError } from '../utils/customErrors.js';

export const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new BadRequestError('Name, email, and password are required.'));
  }
  if (password.length < 6) {
    return next(new BadRequestError('Password must be at least 6 characters long.'));
  }
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return next(new BadRequestError('Please provide a valid email address.'));
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError('Email and password are required.'));
  }
  next();
};

export const validateDonation = (req, res, next) => {
  const { amount, category, donorName, donorEmail, donorPhone } = req.body;
  if (!amount || !category || !donorName || !donorEmail || !donorPhone) {
    return next(new BadRequestError('Amount, category, name, email, and phone number are required.'));
  }
  if (isNaN(amount) || amount <= 0) {
    return next(new BadRequestError('Amount must be a positive number.'));
  }
  next();
};

export const validateBooking = (req, res, next) => {
  const { slotId, devoteeName } = req.body;
  if (!slotId || !devoteeName) {
    return next(new BadRequestError('Slot ID and devotee name are required.'));
  }
  next();
};
