/**
 * Cloudinary utility functions
 * Helper functions for Cloudinary image operations
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'gif';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  transformation?: string;
}

/**
 * Build Cloudinary URL with transformations
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryOptions = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (!cloudName) {
    // Return original URL if Cloudinary is not configured
    return publicId;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    transformation,
  } = options;

  const transformations: string[] = [];

  if (transformation) {
    transformations.push(transformation);
  } else {
    if (width || height) {
      transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_${crop}`);
      if (gravity !== 'auto') {
        transformations.push(`g_${gravity}`);
      }
    }
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
  }

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';

  return `${baseUrl}/${transformString}${publicId}`;
}

/**
 * Get optimized image URL for property images
 */
export function getPropertyImageUrl(
  imageUrl: string,
  width: number = 800,
  height: number = 600
): string {
  // If it's already a Cloudinary URL, optimize it
  if (imageUrl.includes('cloudinary.com')) {
    return buildCloudinaryUrl(imageUrl, {
      width,
      height,
      crop: 'fill',
      quality: 80,
      format: 'auto',
    });
  }

  // Otherwise return as-is (could be external URL or local)
  return imageUrl;
}

/**
 * Get thumbnail URL for property images
 */
export function getPropertyThumbnailUrl(imageUrl: string): string {
  return getPropertyImageUrl(imageUrl, 300, 200);
}

