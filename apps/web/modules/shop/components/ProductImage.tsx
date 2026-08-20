'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/shared/utils/cn';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop';

export function ProductImage({
  src,
  alt,
  fill,
  className,
  sizes,
  width,
  height,
  priority,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const imageSrc = error || !src ? PLACEHOLDER : src;

  return fill ? (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
      unoptimized={imageSrc.startsWith('https://images.unsplash.com')}
    />
  ) : (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 600}
      height={height || 400}
      className={cn('object-cover', className)}
      priority={priority}
      onError={() => setError(true)}
      unoptimized={imageSrc.startsWith('https://images.unsplash.com')}
    />
  );
}
