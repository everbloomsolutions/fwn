'use client';

import { HTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { User } from 'lucide-react';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', shape = 'circle', ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const showImage = src && !imageError;

    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };

    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-md',
    };

    const baseClasses = cn(
      'inline-flex items-center justify-center',
      'bg-surface-hover text-text-muted',
      'border border-border',
      'overflow-hidden',
      'flex-shrink-0',
      sizeClasses[size],
      shapeClasses[shape]
    );

    return (
      <div
        ref={ref}
        className={cn(baseClasses, className)}
        role="img"
        aria-label={alt}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className={cn('w-full h-full object-cover', shapeClasses[shape])}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {fallback ? (
              <span className="font-medium">{fallback.toUpperCase().slice(0, 2)}</span>
            ) : (
              <User className={cn(
                size === 'xs' && 'h-3 w-3',
                size === 'sm' && 'h-4 w-4',
                size === 'md' && 'h-5 w-5',
                size === 'lg' && 'h-6 w-6',
                size === 'xl' && 'h-8 w-8'
              )} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };

