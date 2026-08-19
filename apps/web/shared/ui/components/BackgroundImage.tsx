/**
 * BackgroundImage Component
 * Reusable component for section backgrounds with proper optimization and accessibility
 */

'use client';

import Image from 'next/image';
import { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export interface BackgroundImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  opacity?: number; // 0-100, will be converted to opacity class
  quality?: number; // 75 for patterns, 90 for hero images
  overlay?: 'none' | 'dark' | 'primary' | 'accent' | 'gradient';
  overlayOpacity?: number; // 0-100 for overlay opacity
  priority?: boolean;
  className?: string;
}

const overlayClasses = {
  none: '',
  dark: 'bg-black',
  primary: 'bg-primary',
  accent: 'bg-accent',
  gradient: 'bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20',
};

export function BackgroundImage({
  src,
  alt,
  opacity = 10,
  quality = 75,
  overlay = 'none',
  overlayOpacity = 40,
  priority = false,
  className,
  ...props
}: BackgroundImageProps) {
  // Convert opacity percentage to Tailwind opacity class
  const opacityClass = opacity === 3 ? 'opacity-[0.03]' :
                       opacity === 5 ? 'opacity-[0.05]' :
                       opacity === 10 ? 'opacity-10' :
                       opacity === 40 ? 'opacity-40' :
                       opacity === 50 ? 'opacity-50' :
                       opacity === 60 ? 'opacity-60' :
                       `opacity-[${opacity / 100}]`;

  const overlayOpacityClass = overlayOpacity === 40 ? 'opacity-40' :
                              overlayOpacity === 50 ? 'opacity-50' :
                              overlayOpacity === 60 ? 'opacity-60' :
                              overlayOpacity === 70 ? 'opacity-70' :
                              `opacity-[${overlayOpacity / 100}]`;

  return (
    <div className={cn('absolute inset-0 z-0', className)} {...props}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn('object-cover', opacityClass)}
        sizes="100vw"
        quality={quality}
        priority={priority}
      />
      {overlay !== 'none' && (
        <div
          className={cn(
            'absolute inset-0',
            overlayClasses[overlay],
            overlayOpacityClass
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

