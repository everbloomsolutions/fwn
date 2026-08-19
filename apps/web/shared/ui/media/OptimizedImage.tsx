'use client';

import Image from 'next/image';
import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface OptimizedImageProps
  extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallback?: string;
  priority?: boolean;
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, src, alt, fallback, priority = false, ...props }, ref) => {
    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        className={cn('object-cover', className)}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        {...props}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };

