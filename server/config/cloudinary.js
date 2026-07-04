import { v2 as cloudinary } from 'cloudinary';
import { logger } from './db.js';

const isMock = !process.env.CLOUDINARY_CLOUD_NAME || 
               process.env.CLOUDINARY_CLOUD_NAME === 'mock';

if (!isMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('Cloudinary configured successfully.');
} else {
  logger.warn('Cloudinary keys not set. Cloudinary integration is running in MOCK mode.');
}

export const uploadToCloudinary = async (fileBuffer, folder = 'temple') => {
  if (isMock) {
    // Return a mock placeholder image
    return {
      secure_url: `https://images.unsplash.com/photo-1609137144814-7fa2536fae7c?w=800&auto=format&fit=crop&q=60`,
      public_id: `mock_public_id_${Date.now()}`
    };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};

export default cloudinary;
