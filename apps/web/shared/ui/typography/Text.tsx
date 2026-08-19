'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const textVariants = cva('leading-relaxed', {
  variants: {
    size: {
      sm: 'text-sm', /* 14px */
      md: 'text-base', /* 16px */
      lg: 'text-lg md:text-lg', /* 18px - standardized for descriptions */
      xl: 'text-xl', /* 24px */
    },
    weight: {
      normal: 'font-normal', /* 400 */
      medium: 'font-medium', /* 500 */
      semibold: 'font-semibold', /* 600 */
      bold: 'font-bold', /* 700 */
    },
    color: {
      default: 'text-text',
      muted: 'text-text-muted',
      light: 'text-text-light',
      inverse: 'text-text-inverse',
      error: 'text-status-error',
      success: 'text-status-success',
      warning: 'text-status-warning',
      info: 'text-status-info',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
    color: 'default',
  },
});

export interface TextProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, weight, color, as = 'p', ...props }, ref) => {
    const Component = as;
    const colorValue = color as 'default' | 'muted' | 'light' | 'inverse' | 'error' | 'success' | 'warning' | 'info' | null | undefined;
    
    // Apply max-width for paragraphs to ensure readable line length (45-75 characters)
    // Only apply if className doesn't already specify a max-width
    const hasMaxWidth = className && /max-w/.test(className);
    const readableWidth = Component === 'p' && !hasMaxWidth ? 'max-w-[65ch]' : '';

    return (
      <Component
        ref={ref}
        className={cn(textVariants({ size, weight, color: colorValue }), readableWidth, className)}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };

