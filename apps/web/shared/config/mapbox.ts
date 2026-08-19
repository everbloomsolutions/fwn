/**
 * Mapbox Configuration
 * Utilities for managing Mapbox API access and configuration
 */

/**
 * Get Mapbox access token from environment variables
 * @returns Mapbox access token or null if not configured
 */
export function getMapboxAccessToken(): string | null {
  if (typeof window === 'undefined') {
    // Server-side: return null to avoid exposing token
    return null;
  }
  
  return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || null;
}

/**
 * Check if Mapbox is configured
 * @returns true if Mapbox access token is available
 */
export function isMapboxConfigured(): boolean {
  return getMapboxAccessToken() !== null;
}

/**
 * Mapbox style presets
 */
export const MAPBOX_STYLES = {
  LIGHT: 'mapbox://styles/mapbox/light-v11',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
} as const;

export type MapboxStyle = typeof MAPBOX_STYLES[keyof typeof MAPBOX_STYLES];

/**
 * Default map style
 */
export const DEFAULT_MAP_STYLE = MAPBOX_STYLES.LIGHT;

/**
 * Default map center (South India region)
 */
export const DEFAULT_MAP_CENTER: [number, number] = [78.4867, 17.3850]; // Hyderabad

/**
 * Default map zoom level
 */
export const DEFAULT_MAP_ZOOM = 6;

