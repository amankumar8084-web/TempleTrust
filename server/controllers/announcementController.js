import Announcement from '../models/Announcement.js';
import { NotFoundError } from '../utils/customErrors.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    // Fetch notices that are published, and either have no expiration or expiration in the future
    const notices = await Announcement.find({
      publishDate: { $lte: now },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: now } }
      ]
    }).sort({ isPinned: -1, publishDate: -1 });

    res.status(200).json({
      status: 'success',
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

// Admin Operations
export const adminCreateNotice = async (req, res, next) => {
  try {
    const { title, content, category, isPinned, publishDate, expiryDate } = req.body;

    const notice = await Announcement.create({
      title,
      content,
      category,
      isPinned: isPinned || false,
      publishDate: publishDate || new Date(),
      expiryDate: expiryDate || null
    });

    res.status(201).json({
      status: 'success',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await Announcement.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!notice) {
      return next(new NotFoundError('Notice not found.'));
    }
    res.status(200).json({
      status: 'success',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await Announcement.findByIdAndDelete(id);
    if (!notice) {
      return next(new NotFoundError('Notice not found.'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Notice deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
