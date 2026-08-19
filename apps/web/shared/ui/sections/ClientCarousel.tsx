'use client';

import { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Client } from '@/shared/types/client.types';
import { ClientCard } from './ClientCard';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/shared/ui/buttons/Button';
import { cn } from '@/shared/utils/cn';

export interface ClientCarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  clients: Client[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onImageClick: (clientIndex: number, imageIndex: number) => void;
}

export function ClientCarousel({
  clients,
  selectedIndex,
  onSelect,
  autoPlay = true,
  autoPlayInterval = 5000,
  onImageClick,
  className,
  ...props
}: ClientCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoPlay || isPaused || isHovered) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      onSelect((selectedIndex + 1) % clients.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, isPaused, isHovered, selectedIndex, clients.length, autoPlayInterval, onSelect]);

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : clients.length - 1;
    onSelect(newIndex);
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % clients.length;
    onSelect(newIndex);
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            aria-label="Previous client"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            aria-label="Next client"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseToggle}
            aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>

        {/* Indicator Dots */}
        <div className="flex items-center gap-2">
          {clients.map((_, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === selectedIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-gray-400 hover:bg-gray-500'
              )}
              aria-label={`Go to client ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Client Card */}
      <div className="transition-all duration-500 ease-in-out">
        <ClientCard
          client={clients[selectedIndex]}
          isActive={true}
          onImageClick={(imageIndex) => onImageClick(selectedIndex, imageIndex)}
          autoCycleInterval={4000}
        />
      </div>

      {/* Client Counter */}
      <div className="mt-4 text-center text-sm text-text-muted">
        {selectedIndex + 1} of {clients.length}
      </div>
    </div>
  );
}

