'use client';

import { HTMLAttributes, useState, useEffect, useRef } from 'react';
import { Client } from '@/shared/types/client.types';
import { Text } from '@/shared/ui';
import { Calendar, Wrench } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import Image from 'next/image';

export interface ClientCardProps extends HTMLAttributes<HTMLDivElement> {
  client: Client;
  isActive: boolean;
  onImageClick: (imageIndex: number) => void;
  autoCycleInterval?: number;
}

export function ClientCard({ 
  client, 
  isActive, 
  onImageClick, 
  autoCycleInterval = 3000,
  className, 
  ...props 
}: ClientCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through images
  const primaryImage = client.images && client.images.length > 0 
    ? client.images[currentImageIndex] 
    : null;

  // Auto-cycle effect
  useEffect(() => {
    if (!isActive || !client.images || client.images.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % client.images.length);
    }, autoCycleInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, client.images, autoCycleInterval]);

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden transition-all duration-300',
        'h-[300px] lg:h-[350px]',
        isActive
          ? 'shadow-lg border-2 border-primary'
          : 'shadow-md border border-border',
        className
      )}
      {...props}
    >
      {/* Background Gallery Image */}
      {primaryImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={primaryImage}
              alt={`${client.name} - Gallery`}
              fill
              className="object-cover transition-opacity duration-500"
              sizes="100vw"
              priority
            />
          </div>
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/50 to-black/20" />
        </>
      )}

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        {/* Service Type and Date */}
        <div className="flex items-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
            <Wrench className="h-3 w-3" />
            <span className="font-medium">{client.serviceType}</span>
          </div>
          {client.completedDate && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {new Date(client.completedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <Text size="sm" className="text-white/90 mb-4 line-clamp-2">
          {client.description}
        </Text>

        {/* Image Gallery Thumbnails */}
        {client.images && client.images.length > 1 && (
          <div className="flex gap-2 mb-2">
            {client.images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentImageIndex(index);
                }}
                className={cn(
                  'relative w-16 h-16 rounded overflow-hidden border-2 transition-all',
                  index === currentImageIndex
                    ? 'border-white scale-110'
                    : 'border-white/50 hover:border-white/80'
                )}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
            {client.images.length > 4 && (
              <div className="relative w-16 h-16 rounded overflow-hidden border-2 border-white/50 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-medium">+{client.images.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

