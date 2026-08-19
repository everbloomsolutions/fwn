import { config } from './index';
import { logger } from '../middleware/logger';

export const getGoogleMapsApiKey = (): string | null => {
  if (!config.googleMaps?.apiKey) {
    logger.warn('Google Maps API key not provided. Geocoding will be disabled.');
    return null;
  }
  return config.googleMaps.apiKey;
};

export const isGoogleMapsConfigured = (): boolean => {
  return config.googleMaps?.apiKey !== undefined && config.googleMaps.apiKey !== '';
};

