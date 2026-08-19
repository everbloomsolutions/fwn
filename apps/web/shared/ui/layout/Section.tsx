'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, padding = 'md', ...props }, ref) => {
    const paddingClasses = {
      sm: 'py-4',
      md: 'py-8',
      lg: 'py-12',
      xl: 'py-20',
    };

    return (
      <section
        ref={ref}
        className={cn(paddingClasses[padding], className)}
        {...props}
      />
    );
  }
);

Section.displayName = 'Section';

export { Section };

