'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const headingVariants = cva('font-bold leading-tight tracking-tight', {
  variants: {
    level: {
      h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[-0.02em]',
      h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-[-0.015em]',
      h3: 'text-lg sm:text-xl md:text-2xl leading-snug tracking-[-0.01em] font-semibold',
      h4: 'text-base sm:text-lg md:text-xl leading-snug tracking-normal font-semibold',
      h5: 'text-sm sm:text-base md:text-lg leading-normal tracking-normal font-medium',
      h6: 'text-xs sm:text-sm md:text-base leading-normal tracking-normal font-medium',
    },
    size: {
      default: '',
      compact: '',
    },
  },
  compoundVariants: [
    {
      level: 'h1',
      size: 'compact',
      class: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    },
    {
      level: 'h2',
      size: 'compact',
      class: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
    },
    {
      level: 'h3',
      size: 'compact',
      class: 'text-base sm:text-lg md:text-xl lg:text-2xl',
    },
    {
      level: 'h4',
      size: 'compact',
      class: 'text-sm sm:text-base md:text-lg lg:text-xl',
    },
    {
      level: 'h5',
      size: 'compact',
      class: 'text-xs sm:text-sm md:text-base lg:text-lg',
    },
    {
      level: 'h6',
      size: 'compact',
      class: 'text-xs sm:text-sm md:text-base',
    },
  ],
  defaultVariants: {
    level: 'h1',
    size: 'default',
  },
});

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'default' | 'compact';
  balance?: boolean;
  lineClamp?: 1 | 2 | 3;
}

const clampClasses: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, as, size = 'default', balance, lineClamp, ...props }, ref) => {
    const headingLevel = (level || as || 'h1') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const Component = (as || headingLevel) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    return (
      <Component
        ref={ref}
        className={cn(
          headingVariants({ level: headingLevel, size }),
          balance && 'text-balance',
          lineClamp && clampClasses[lineClamp],
          className
        )}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

export { Heading, headingVariants };
