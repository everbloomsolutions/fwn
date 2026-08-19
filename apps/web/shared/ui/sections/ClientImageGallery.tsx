'use client';

import { HTMLAttributes, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/buttons/Button';
import { cn } from '@/shared/utils/cn';
import Image from 'next/image';

export interface ClientImageGalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: string[];
  isExpanded: boolean;
  expandedIndex?: number;
  onExpand: (index: number) => void;
  onClose: () => void;
  clientName?: string;
}

export function ClientImageGallery({
  images,
  isExpanded,
  expandedIndex = 0,
  onExpand,
  onClose,
  clientName = 'Client',
  className,
  ...props
}: ClientImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(expandedIndex);

  useEffect(() => {
    if (expandedIndex !== undefined) {
      setCurrentIndex(expandedIndex);
    }
  }, [expandedIndex]);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    onExpand(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onExpand(newIndex);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    onExpand(index);
  };

  if (!isExpanded || images.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full max-w-full overflow-hidden transition-all duration-500 ease-in-out',
        'border border-gray-200 rounded-lg bg-white shadow-md',
        className
      )}
      {...props}
    >
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-text">Image Gallery</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5 text-text-muted" />
        </button>
      </div>

      {/* Main Expanded Image */}
      <div className="relative w-full aspect-video bg-gray-50">
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5 text-text" />
        </button>

        <div className="relative w-full h-full">
          <Image
            src={images[currentIndex]}
            alt={`${clientName} - Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5 text-text" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 text-text text-sm font-medium shadow-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-primary scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

