import Gallery from '../models/Gallery.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { BadRequestError, NotFoundError } from '../utils/customErrors.js';

export const getGallery = async (req, res, next) => {
  try {
    const { category, type, album, page = 1, limit = 12 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (album) filter.album = album;

    const skipIndex = (page - 1) * limit;

    const total = await Gallery.countDocuments(filter);
    const media = await Gallery.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      total,
      page: Number(page),
      limit: Number(limit),
      data: media
    });
  } catch (error) {
    next(error);
  }
};

export const adminUploadMedia = async (req, res, next) => {
  try {
    const { title, type, category, album, directUrl } = req.body;

    let mediaUrl = directUrl;

    // Handle physical file upload if provided
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'gallery');
      mediaUrl = uploadResult.secure_url;
    }

    if (!mediaUrl) {
      return next(new BadRequestError('Media file or direct URL is required.'));
    }

    const item = await Gallery.create({
      title,
      type: type || 'photo',
      url: mediaUrl,
      album: album || 'General',
      category: category || 'Darshan'
    });

    res.status(201).json({
      status: 'success',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findByIdAndDelete(id);
    if (!item) {
      return next(new NotFoundError('Media item not found.'));
    }
    res.status(200).json({
      status: 'success',
      message: 'Media deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
