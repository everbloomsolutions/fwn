/**
 * Client Showcase Section Component
 * Client showcase with map and modal gallery
 */

'use client';

import { HTMLAttributes, useState, useEffect, useRef, useMemo } from 'react';
import { Client } from '@/shared/types/client.types';
import { MapboxMap } from '@/shared/ui/maps/MapboxMap';
import { ClientThumbnailGallery } from './ClientThumbnailGallery';
import { Container, Heading, Text, Badge } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { DEFAULT_MAP_STYLE, type MapboxStyle } from '@/shared/config/mapbox';

export interface ClientShowcaseSectionProps extends HTMLAttributes<HTMLElement> {
  clients: Client[];
  mapStyle?: MapboxStyle | string;
  title?: string;
  description?: string;
}

export function ClientShowcaseSection({
  clients,
  mapStyle = DEFAULT_MAP_STYLE,
  title = 'Our Clients Across South India',
  description = 'Explore our successful projects and client locations across South India',
  className,
  ...props
}: ClientShowcaseSectionProps) {
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(true); // Auto-open gallery
  const [galleryClientIndex, setGalleryClientIndex] = useState<number | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const [mapSize, setMapSize] = useState<{ width: number; height: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const clientCycleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const selectedClient = clients[selectedClientIndex];
  const galleryClient = galleryClientIndex !== null ? clients[galleryClientIndex] : null;

  // Get all clients with images
  const clientsWithImages = useMemo(() => {
    return clients
      .map((client, index) => ({ client, index }))
      .filter(({ client }) => client.images && client.images.length > 0);
  }, [clients]);

  // Initialize with first client with images
  useEffect(() => {
    if (clientsWithImages.length > 0 && !isInitializedRef.current) {
      const firstIndex = clientsWithImages[0].index;
      setSelectedClientIndex(firstIndex);
      setGalleryClientIndex(firstIndex);
      isInitializedRef.current = true;
    }
  }, [clientsWithImages]);

  // Auto-cycle through clients with images (continues even when gallery is closed)
  useEffect(() => {
    if (clientsWithImages.length <= 1) {
      if (clientCycleIntervalRef.current) {
        clearInterval(clientCycleIntervalRef.current);
        clientCycleIntervalRef.current = null;
      }
      return;
    }

    // Cycle through clients every 8 seconds (allowing time for image cycling)
    clientCycleIntervalRef.current = setInterval(() => {
      setSelectedClientIndex((prev) => {
        const currentPos = clientsWithImages.findIndex(({ index }) => index === prev);
        const nextPos = (currentPos + 1) % clientsWithImages.length;
        const nextIndex = clientsWithImages[nextPos].index;
        
        // Always update gallery client index and reopen gallery for next client
        setGalleryClientIndex(nextIndex);
        setIsGalleryOpen(true);
        
        return nextIndex;
      });
    }, 8000);

    return () => {
      if (clientCycleIntervalRef.current) {
        clearInterval(clientCycleIntervalRef.current);
        clientCycleIntervalRef.current = null;
      }
    };
  }, [clientsWithImages]);

  const handleClientSelect = (clientId: string) => {
    const index = clients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      setSelectedClientIndex(index);
      // Open gallery with selected client's images when clicking map marker
      const client = clients[index];
      if (client.images && client.images.length > 0) {
        setGalleryClientIndex(index);
        setIsGalleryOpen(true);
      }
    }
  };

  const handleMarkerPosition = (position: { x: number; y: number } | null) => {
    if (position && mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setMapSize({ width: rect.width, height: rect.height });
      setMarkerPosition({
        x: position.x,
        y: position.y,
      });
    } else {
      setMarkerPosition(null);
    }
  };

  const handleCloseGallery = () => {
    setIsGalleryOpen(false);
    // Keep galleryClientIndex for smooth reopening
    // Map will continue cycling through clients
  };

  const handleImageExpand = () => {
    // Handled by ClientThumbnailGallery component
  };

  return (
    <section
      className={cn('py-4 sm:py-6 lg:py-8 bg-bg', className)}
      {...props}
    >
      {/* Header */}
      <Container maxWidth="xl">
        <div className="text-center mb-4">
          <Heading level="h2" className="mb-2">
            {title}
          </Heading>
          <Text className="text-text-muted max-w-2xl mx-auto">
            {description}
          </Text>
        </div>

      </Container>

      {/* Main Content: Map - Full Width */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative mb-8 rounded-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8">
          {/* Map Section - Full Height */}
          <div ref={mapContainerRef} className="relative h-[500px] lg:h-[700px]">
            <MapboxMap
              clients={clients}
              selectedClientId={selectedClient?.id}
              onClientSelect={handleClientSelect}
              mapStyle={mapStyle}
              className="h-full"
              onMarkerPosition={handleMarkerPosition}
            />
            {/* Client Name and Location Overlay on Map */}
            {selectedClient && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-gray-200 max-w-md">
                  <h3 className="text-2xl font-bold text-text mb-1">
                    {selectedClient.name}
                  </h3>
                  <p className="text-base font-semibold text-text-muted">
                    {selectedClient.location.address}, {selectedClient.location.city}
                  </p>
                  <Badge variant="info" className="mt-2">
                    {selectedClient.serviceType}
                  </Badge>
                  {selectedClient.images && selectedClient.images.length > 0 && (
                    <p className="text-sm text-text-muted mt-2">
                      Click map marker to view {selectedClient.images.length} image{selectedClient.images.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Image Gallery - Positioned beside map marker */}
            {isGalleryOpen && galleryClient && markerPosition && mapSize && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `${Math.min(markerPosition.x + 20, mapSize.width - 340)}px`,
                  top: `${Math.max(10, Math.min(markerPosition.y - 150, mapSize.height - 350))}px`,
                }}
              >
                <div className="pointer-events-auto">
                  <ClientThumbnailGallery
                    images={galleryClient.images}
                    clientName={galleryClient.name}
                    autoPlayInterval={3000}
                    onClose={handleCloseGallery}
                    onImageExpand={handleImageExpand}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

