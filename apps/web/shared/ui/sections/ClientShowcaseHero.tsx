'use client';

import { HTMLAttributes, useState } from 'react';
import { Client } from '@/shared/types/client.types';
import dynamic from 'next/dynamic';
import { ClientCarousel } from './ClientCarousel';
import { ClientImageGallery } from './ClientImageGallery';
import { Container, Heading, Text } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { DEFAULT_MAP_STYLE, type MapboxStyle } from '@/shared/config/mapbox';

const MapboxMap = dynamic(() => import('@/shared/ui/maps/MapboxMap').then((m) => m.MapboxMap), { ssr: false });

export interface ClientShowcaseHeroProps extends HTMLAttributes<HTMLElement> {
  clients: Client[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  mapStyle?: MapboxStyle | string;
}

export function ClientShowcaseHero({
  clients,
  autoPlay = true,
  autoPlayInterval = 5000,
  mapStyle = DEFAULT_MAP_STYLE,
  className,
  ...props
}: ClientShowcaseHeroProps) {
  const [selectedClientIndex, setSelectedClientIndex] = useState(0);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
  const [expandedClientIndex, setExpandedClientIndex] = useState<number | null>(null);

  const selectedClient = clients[selectedClientIndex];

  const handleClientSelect = (clientId: string) => {
    const index = clients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      setSelectedClientIndex(index);
    }
  };

  const handleImageClick = (clientIndex: number, imageIndex: number) => {
    setExpandedClientIndex(clientIndex);
    setExpandedImageIndex(imageIndex);
  };

  const handleCloseGallery = () => {
    setExpandedImageIndex(null);
    setExpandedClientIndex(null);
  };

  const handleImageExpand = (imageIndex: number) => {
    if (expandedClientIndex !== null) {
      setExpandedImageIndex(imageIndex);
    }
  };

  return (
    <section
      className={cn('py-8 sm:py-12 lg:py-16 bg-bg', className)}
      {...props}
    >
      {/* Header */}
      <Container maxWidth="xl">
        <div className="text-center mb-8">
          <Heading level="h2" className="mb-4">
            Our Clients Across South India
          </Heading>
          <Text className="text-text-muted max-w-2xl mx-auto">
            Explore our successful projects and client locations across South India
          </Text>
        </div>
      </Container>

      {/* Main Content: Map (75%) + Carousel (25%) - Full Width */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative mb-8 rounded-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8">
          {/* Map Section - 75% of height */}
          <div className="relative h-[450px] lg:h-[600px]">
            <MapboxMap
              clients={clients}
              selectedClientId={selectedClient?.id}
              onClientSelect={handleClientSelect}
              mapStyle={mapStyle}
              className="h-full"
            />
            {/* Client Name and Location Overlay on Map */}
            {selectedClient && (
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-border max-w-md">
                  <h3 className="text-2xl font-bold text-text mb-1">{selectedClient.name}</h3>
                  <p className="text-base font-semibold text-text-muted">
                    {selectedClient.location.address}, {selectedClient.location.city}
                  </p>
                </div>
              </div>
            )}
            {/* Overlay Gradient at bottom for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none" />
          </div>

          {/* Carousel Section - Bottom 25% */}
          <div className="relative bg-bg p-4 lg:p-6 w-full">
            <ClientCarousel
              clients={clients}
              selectedIndex={selectedClientIndex}
              onSelect={setSelectedClientIndex}
              autoPlay={autoPlay}
              autoPlayInterval={autoPlayInterval}
              onImageClick={handleImageClick}
            />
          </div>
        </div>

        {/* Inline Image Gallery - Full Width */}
        {expandedClientIndex !== null && expandedImageIndex !== null && (
          <div className="mt-8 w-full px-4 sm:px-6 lg:px-8">
            <ClientImageGallery
              images={clients[expandedClientIndex].images}
              isExpanded={true}
              expandedIndex={expandedImageIndex}
              onExpand={handleImageExpand}
              onClose={handleCloseGallery}
              clientName={clients[expandedClientIndex].name}
            />
          </div>
        )}
      </div>
    </section>
  );
}

