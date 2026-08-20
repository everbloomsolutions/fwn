'use client';

import Image from 'next/image';
import { ComponentProps, forwardRef, useState } from 'react';
import { cn } from '@/shared/utils/cn';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop';

export interface OptimizedImageProps
  extends Omit<ComponentProps<typeof Image>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallback?: string;
  priority?: boolean;
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, src, alt, fallback = PLACEHOLDER, priority = false, ...props }, ref) => {
    const [error, setError] = useState(false);
    return (
      <Image
        ref={ref}
        src={error ? fallback : src}
        alt={alt}
        className={cn('object-cover', className)}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        onError={() => setError(true)}
        unoptimized={(error ? fallback : src).startsWith('https://images.unsplash.com')}
        {...props}
      />
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage };

