'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Client } from '@/shared/types/client.types';
import { getMapboxAccessToken, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, DEFAULT_MAP_STYLE, type MapboxStyle } from '@/shared/config/mapbox';
import { cn } from '@/shared/utils/cn';
import { logger } from '@/shared/utils/logger';

export interface MapboxMapProps {
  clients: Client[];
  selectedClientId?: string;
  onClientSelect: (clientId: string) => void;
  mapStyle?: MapboxStyle | string;
  className?: string;
  onMarkerPosition?: (position: { x: number; y: number } | null) => void;
}

export function MapboxMap({
  clients,
  selectedClientId,
  onClientSelect,
  mapStyle = DEFAULT_MAP_STYLE,
  className,
  onMarkerPosition,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
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
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Apply custom colors to map features
      if (map.current) {
        try {
          const style = map.current.getStyle();
          if (!style || !style.layers) return;

          // Light colors for highlighting
          const waterColor = '#93c5fd'; // light blue
          const greenColor = '#86efac'; // light green
          const purpleColor = '#c4b5fd'; // light purple

          // Iterate through all layers and apply colors based on layer properties
          style.layers.forEach((layer: any) => {
            const layerId = layer.id;
            const sourceLayer = layer['source-layer'];
            const layerType = layer.type;

            // Skip if layer doesn't support fill-color
            if (layerType !== 'fill' && layerType !== 'line') return;

            try {
              // Water bodies - light blue
              if (
                layerId.toLowerCase().includes('water') ||
                sourceLayer?.toLowerCase().includes('water') ||
                layerId.toLowerCase().includes('waterway')
              ) {
                if (layerType === 'fill') {
                  map.current?.setPaintProperty(layerId, 'fill-color', waterColor);
                } else if (layerType === 'line') {
                  map.current?.setPaintProperty(layerId, 'line-color', waterColor);
                }
              }
              // Forests, parks, fields, natural areas - light green
              else if (
                layerId.toLowerCase().includes('park') ||
                layerId.toLowerCase().includes('forest') ||
                layerId.toLowerCase().includes('landcover') ||
                layerId.toLowerCase().includes('landuse') ||
                sourceLayer?.toLowerCase().includes('park') ||
                sourceLayer?.toLowerCase().includes('landcover') ||
                sourceLayer?.toLowerCase().includes('landuse')
              ) {
                // Only apply green to natural/vegetation areas, not all landuse
                if (
                  !layerId.toLowerCase().includes('building') &&
                  !layerId.toLowerCase().includes('settlement') &&
                  !sourceLayer?.toLowerCase().includes('building')
                ) {
                  if (layerType === 'fill') {
                    map.current?.setPaintProperty(layerId, 'fill-color', greenColor);
                  }
                }
              }
              // Urban areas, buildings, settlements - light purple
              else if (
                layerId.toLowerCase().includes('building') ||
                layerId.toLowerCase().includes('settlement') ||
                layerId.toLowerCase().includes('urban') ||
                sourceLayer?.toLowerCase().includes('building') ||
                sourceLayer?.toLowerCase().includes('settlement')
              ) {
                if (layerType === 'fill') {
                  map.current?.setPaintProperty(layerId, 'fill-color', purpleColor);
                }
              }
            } catch (err) {
              // Skip layers that don't support the property
            }
          });
        } catch (error) {
          // Silently fail if layers don't exist (different map styles have different layers)
          logger.debug('Could not apply custom colors to all map layers:', error);
        }
      }
    });

    map.current.on('error', (e) => {
      logger.error('Mapbox error:', e);
      setError('Failed to load map');
    });

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      
      // Cleanup map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapStyle]);

  // Create markers for clients - only show selected client
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Only show the selected client, or first client if none selected
    const clientToShow = selectedClientId 
      ? clients.find((c) => c.id === selectedClientId)
      : clients[0];

    if (!clientToShow) return;

    // Create marker for the single client
    const el = document.createElement('div');
    el.className = cn('mapbox-marker', 'mapbox-marker-active');
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#2563eb';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.2s ease';

    // Create marker
    const marker = new mapboxgl.Marker(el)
      .setLngLat([clientToShow.location.coordinates.lng, clientToShow.location.coordinates.lat])
      .addTo(map.current!);

    // Add click handler
    el.addEventListener('click', () => {
      onClientSelect(clientToShow.id);
    });

    // Calculate and report marker position
    const updateMarkerPosition = () => {
      if (map.current && onMarkerPosition && mapContainer.current) {
        const point = map.current.project([
          clientToShow.location.coordinates.lng,
          clientToShow.location.coordinates.lat
        ]);
        // point is already relative to map container
        onMarkerPosition({
          x: point.x,
          y: point.y,
        });
      }
    };

    // Update position on map move/zoom
    const onMove = () => {
      // Use requestAnimationFrame to ensure map has finished moving
      requestAnimationFrame(updateMarkerPosition);
    };
    map.current.on('move', onMove);
    map.current.on('zoom', onMove);
    
    // Initial position after a short delay to ensure map is ready
    setTimeout(updateMarkerPosition, 100);

    markersRef.current.push(marker);

    return () => {
      if (map.current) {
        map.current.off('move', onMove);
        map.current.off('zoom', onMove);
      }
    };
  }, [clients, selectedClientId, isLoaded, onClientSelect, onMarkerPosition]);

  // Fly to selected client
  useEffect(() => {
    if (!map.current || !isLoaded || !selectedClientId) return;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    if (!selectedClient) return;

    map.current.flyTo({
      center: [selectedClient.location.coordinates.lng, selectedClient.location.coordinates.lat],
      zoom: 12,
      duration: 1000,
    });
  }, [selectedClientId, clients, isLoaded]);

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
    <div className={cn('mapbox-wrapper w-full h-full relative', className)}>
      <div ref={mapContainer} className="mapbox-container w-full h-full" />
    </div>
  );
}

