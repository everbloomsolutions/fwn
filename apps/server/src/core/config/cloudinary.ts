import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';
import { logger } from '../middleware/logger';

let isInitialized = false;

export const initializeCloudinary = (): void => {
  if (isInitialized) {
    return;
  }

  try {
    // Check if Cloudinary credentials are provided
    if (!config.cloudinary?.cloudName || !config.cloudinary?.apiKey || !config.cloudinary?.apiSecret) {
      logger.warn('Cloudinary credentials not provided. Image uploads will be disabled.');
      return;
    }

    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });

    isInitialized = true;
    logger.info('Cloudinary initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Cloudinary:', error);
    isInitialized = false;
  }
};

export const getCloudinary = (): typeof cloudinary | null => {
  if (!isInitialized) {
    initializeCloudinary();
  }
  return isInitialized ? cloudinary : null;
};

export const isCloudinaryInitialized = (): boolean => {
  return isInitialized;
};

