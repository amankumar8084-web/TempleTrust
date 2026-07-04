import User from '../models/User.js';
import { logger } from '../config/db.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face';

// Helper to delete previous Cloudinary image if it exists
const deletePreviousCloudinaryImage = async (avatarUrl) => {
  try {
    if (!avatarUrl || avatarUrl.includes('unsplash.com')) return;

    // Match Cloudinary URLs — handles both folder/filename and plain filename patterns
    const matches = avatarUrl.match(
      /\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp|gif|avif)$/i
    );
    if (matches && matches[1]) {
      const publicId = matches[1];
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Deleted previous Cloudinary image: ${publicId}`);
    }
  } catch (err) {
    logger.warn(`Failed to delete previous Cloudinary image: ${err.message}`);
  }
};

// ── GET /api/v1/users/profile ──────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    return res.json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar,
        role: user.role?.name || 'Devotee',
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Error fetching profile: ${error.message}`);
    return next(error);
  }
};

// ── PUT /api/v1/users/profile ──────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Only allow updating name and phone
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    logger.info(`User ${userId} updated profile`);
    return res.json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar,
        role: user.role?.name || 'Devotee'
      }
    });
  } catch (error) {
    logger.error(`Error updating profile: ${error.message}`);
    return next(error);
  }
};

// ── POST /api/v1/users/change ──────────────────────────────────────────────────
export const changeProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }
    const userId = req.user?.id || req.body.userId;
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Delete old Cloudinary avatar if it's not the default placeholder
    await deletePreviousCloudinaryImage(user.avatar);

    // Upload new file buffer to Cloudinary with optimized transforms
    const cloudResult = await uploadToCloudinary(req.file.buffer, 'avatars');
    const avatarUrl = cloudResult.secure_url;

    // Update user record
    user.avatar = avatarUrl;
    await user.save();

    logger.info(`User ${userId} updated avatar to ${avatarUrl}`);
    return res.json({
      status: 'success',
      avatar: avatarUrl,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: avatarUrl,
        role: user.role?.name || 'Devotee'
      }
    });
  } catch (error) {
    logger.error(`Error updating avatar: ${error.message}`);
    return next(error);
  }
};

// ── DELETE /api/v1/users/remove ────────────────────────────────────────────────
export const removeProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Delete current Cloudinary avatar if present
    await deletePreviousCloudinaryImage(user.avatar);

    user.avatar = DEFAULT_AVATAR;
    await user.save();

    logger.info(`User ${userId} removed avatar, reset to default`);
    return res.json({
      status: 'success',
      avatar: DEFAULT_AVATAR,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: DEFAULT_AVATAR,
        role: user.role?.name || 'Devotee'
      }
    });
  } catch (error) {
    logger.error(`Error removing avatar: ${error.message}`);
    return next(error);
  }
};
