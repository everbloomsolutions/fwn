import { Client } from '@googlemaps/google-maps-services-js';
import { getGoogleMapsApiKey, isGoogleMapsConfigured } from '../config/googleMaps';
import { AppError } from '../exceptions/errorHandler';

const client = new Client({});

export interface GeocodeResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  formattedAddress: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Geocode an address to get coordinates
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!isGoogleMapsConfigured()) {
    throw new AppError('Google Maps API is not configured', 500);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new AppError('Google Maps API key is not available', 500);
  }

  try {
    const response = await client.geocode({
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      throw new AppError(`Geocoding failed: ${response.data.status}`, 400);
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    // Extract address components
    const addressComponents = result.address_components || [];
    let city: string | undefined;
    let state: string | undefined;
    let zipCode: string | undefined;
    let country: string | undefined;

    addressComponents.forEach((component) => {
      const types = component.types as string[];
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.short_name;
      }
    });

    return {
      address,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      formattedAddress: result.formatted_address,
      city,
      state,
      zipCode,
      country,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Failed to geocode address';
    throw new AppError(`Geocoding error: ${message}`, 500);
  }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> => {
  if (!isGoogleMapsConfigured()) {
    throw new AppError('Google Maps API is not configured', 500);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new AppError('Google Maps API key is not available', 500);
  }

  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      throw new AppError(`Reverse geocoding failed: ${response.data.status}`, 400);
    }

    const result = response.data.results[0];

    // Extract address components
    const addressComponents = result.address_components || [];
    let city: string | undefined;
    let state: string | undefined;
    let zipCode: string | undefined;
    let country: string | undefined;

    addressComponents.forEach((component) => {
      const types = component.types as string[];
      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.short_name;
      }
    });

    return {
      address: result.formatted_address,
      formattedAddress: result.formatted_address,
      city,
      state,
      zipCode,
      country,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Failed to reverse geocode';
    throw new AppError(`Reverse geocoding error: ${message}`, 500);
  }
};

