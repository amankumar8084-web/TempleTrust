import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB, { logger } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import poojaRoutes from './routes/poojaRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import membershipRoutes from './routes/membershipRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';

// Initialize env config
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins for dev/testing, configure strictly in production
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(mongoSanitize());

// Logger Middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
app.use(globalLimiter);

// API Route Registration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/poojas', poojaRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/users', userProfileRoutes);

// Serve uploaded avatars statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fallback route 404 handler
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
