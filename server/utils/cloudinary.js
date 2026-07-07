import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
export const uploadImage = async (file, folder = 'ecommerce') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto:good',
      format: 'webp'
    });

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    throw new AppError('Image upload failed', 500);
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, folder = 'ecommerce') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new AppError('Multiple image upload failed', 500);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Delete multiple images
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(id => deleteImage(id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple images:', error);
  }
};

export default cloudinary;