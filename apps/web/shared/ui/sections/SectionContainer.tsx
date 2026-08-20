/**
 * Section Container Component
 * Standardized wrapper for sections with consistent spacing and styling
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  background?: 'default' | 'muted' | 'gradient' | 'primary' | 'accent';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  as?: 'section' | 'div';
}

const paddingClasses = {
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
  none: '',
};

const backgroundClasses = {
  default: 'bg-bg',
  muted: 'bg-bg-muted',
  gradient: 'bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10',
  primary: 'bg-primary text-text-inverse',
  accent: 'bg-accent text-text-inverse',
};

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  ({ 
    padding = 'md', 
    background = 'default',
    maxWidth,
    as: Component = 'section',
    className,
    children,
    ...props 
  }, ref) => {
    return (
      <Component
        ref={ref as never}
        className={cn(
          paddingClasses[padding],
          backgroundClasses[background],
          maxWidth && maxWidthClasses[maxWidth],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

SectionContainer.displayName = 'SectionContainer';

