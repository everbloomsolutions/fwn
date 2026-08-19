'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getMapboxAccessToken, DEFAULT_MAP_STYLE, type MapboxStyle } from '@/shared/config/mapbox';
import { cn } from '@/shared/utils/cn';
import { logger } from '@/shared/utils/logger';

export interface OfficeLocationMapProps {
  /** Office coordinates [longitude, latitude] */
  coordinates: [number, number];
  /** Office address for popup */
  address?: string;
  /** Map style */
  mapStyle?: MapboxStyle | string;
  /** Zoom level */
  zoom?: number;
  /** Additional CSS classes */
  className?: string;
}

export function OfficeLocationMap({
  coordinates,
  address,
  mapStyle = DEFAULT_MAP_STYLE,
  zoom = 15,
  className,
}: OfficeLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const accessToken = getMapboxAccessToken();
    if (!accessToken) {
      setError('Mapbox access token is not configured');
      return;
    }

    mapboxgl.accessToken = accessToken;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: coordinates,
      zoom: zoom,
      attributionControl: true,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    map.current.on('error', (e) => {
      logger.error('Mapbox error:', e);
      setError('Failed to load map');
    });

    return () => {
      // Cleanup marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      
      // Cleanup map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coordinates, mapStyle, zoom]);

  // Create marker for office location
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Create custom marker element
    const el = document.createElement('div');
    el.className = 'office-location-marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#2563eb';
    el.style.border = '4px solid white';
    el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.2s ease';

    // Create marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map.current!);

    // Add popup if address is provided
    if (address) {
      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
        .setHTML(`<div class="p-2"><p class="font-semibold text-sm">${address}</p></div>`);
      
      marker.setPopup(popup);
      
      // Show popup by default
      marker.togglePopup();
    }

    markerRef.current = marker;
  }, [coordinates, address, isLoaded]);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-bg-muted rounded-md', className)}>
        <div className="text-center p-4">
          <p className="text-text-muted text-sm">{error}</p>
          <p className="text-text-light text-xs mt-2">
            Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('office-location-map-wrapper w-full h-full relative rounded-lg overflow-hidden border border-border', className)}>
      <div ref={mapContainer} className="office-location-map-container w-full h-full" />
    </div>
  );
}

