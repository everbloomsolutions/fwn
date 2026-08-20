'use client';

import { HTMLAttributes, useState, useEffect, useRef } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/shared/ui/buttons/Button';
import { cn } from '@/shared/utils/cn';
import Image from 'next/image';

export interface ClientThumbnailGalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: string[];
  clientName?: string;
  autoPlayInterval?: number;
  onClose?: () => void;
  onImageExpand?: (imageIndex: number) => void;
}

export function ClientThumbnailGallery({
  images,
  clientName = 'Client',
  autoPlayInterval = 3000,
  onClose,
  onImageExpand,
  className,
  ...props
}: ClientThumbnailGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter out empty/invalid images
  const validImages = images.filter((img) => img && img.trim() !== '');

  // Auto-cycle through images
  useEffect(() => {
    if (isExpanded || expandedImageIndex !== null || validImages.length <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isExpanded, expandedImageIndex, validImages.length, autoPlayInterval]);

  const handleImageClick = () => {
    const safeIndex = Math.min(currentIndex, validImages.length - 1);
    setExpandedImageIndex(safeIndex);
    setIsExpanded(true);
    onImageExpand?.(safeIndex);
  };

  const handleCloseExpand = () => {
    setIsExpanded(false);
    setExpandedImageIndex(null);
  };

  if (validImages.length === 0) {
    return null;
  }

  // Ensure currentIndex is within bounds
  const safeCurrentIndex = Math.min(currentIndex, validImages.length - 1);
  const currentImage = validImages[safeCurrentIndex];
  const expandedImage = expandedImageIndex !== null && expandedImageIndex < validImages.length
    ? validImages[expandedImageIndex]
    : null;

  // Don't render if no valid image
  if (!currentImage) {
    return null;
  }

  // Expanded view - full size image
  if (isExpanded && expandedImageIndex !== null && expandedImage) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2',
          className
        )}
        onClick={handleCloseExpand}
        {...props}
      >
        <div
          className="relative w-full h-full max-w-7xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseExpand}
              className="bg-white/90 hover:bg-surface h-8 w-8 p-0"
              aria-label="Close expanded view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="bg-white/90 hover:bg-surface h-8 w-8 p-0"
                aria-label="Close gallery"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="relative w-full h-full">
            <Image
              src={expandedImage}
              alt={`${clientName} - Image ${expandedImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full bg-white/90 text-text text-xs font-medium shadow-sm">
            {expandedImageIndex + 1} / {validImages.length}
          </div>
        </div>
      </div>
    );
  }

  // Simple cycling image view - no thumbnails
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg shadow-xl overflow-hidden',
        'w-[280px] sm:w-[320px]',
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-surface">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text truncate">{clientName}</h3>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-1 flex-shrink-0 h-6 w-6 p-0"
            aria-label="Close gallery"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Cycling Image */}
      <div className="relative h-[240px] sm:h-[280px] bg-bg-muted">
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${clientName} - Image ${safeCurrentIndex + 1}`}
            fill
            className="object-contain cursor-pointer transition-opacity duration-500"
            sizes="320px"
            onClick={handleImageClick}
          />
        )}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-white/90 text-text text-xs font-medium shadow-sm">
          {safeCurrentIndex + 1} / {validImages.length}
        </div>
      </div>
    </div>
  );
}

