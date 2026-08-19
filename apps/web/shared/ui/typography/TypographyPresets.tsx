/**
 * Typography Preset Components
 * Pre-configured typography styles for common use cases
 */

'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';

// Display Text - Large hero/landing text
export interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3';
}

export const Display = forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ className, as: Component = 'h1', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
          'font-bold leading-tight tracking-tight',
          'text-text',
          className
        )}
        {...props}
      />
    );
  }
);
Display.displayName = 'Display';

// Lead Text - Large introductory text
export interface LeadProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'div';
}

export const Lead = forwardRef<HTMLParagraphElement, LeadProps>(
  ({ className, as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-lg sm:text-xl md:text-2xl',
          'font-normal leading-relaxed',
          'text-text-muted',
          className
        )}
        {...props}
      />
    );
  }
);
Lead.displayName = 'Lead';

// Body Text - Standard paragraph text
export interface BodyProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'div' | 'span';
  size?: 'sm' | 'md' | 'lg';
}

export const Body = forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, size = 'md', as: Component = 'p', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size],
          'font-normal leading-relaxed',
          'text-text',
          className
        )}
        {...props}
      />
    );
  }
);
Body.displayName = 'Body';

// Caption Text - Small supporting text
export interface CaptionProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div';
}

export const Caption = forwardRef<HTMLParagraphElement, CaptionProps>(
  ({ className, as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-xs sm:text-sm',
          'font-normal leading-normal',
          'text-text-muted',
          className
        )}
        {...props}
      />
    );
  }
);
Caption.displayName = 'Caption';

// Label Text - Form labels and small headings
export interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  as?: 'label' | 'span' | 'div';
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, as: Component = 'label', required, children, ...props }, ref) => {
    return (
      <Component
        ref={Component === 'label' ? (ref as any) : undefined}
        className={cn(
          'text-sm font-medium leading-normal',
          'text-text',
          'block',
          className
        )}
        {...(props as any)}
      >
        {children}
        {required && <span className="text-status-error ml-1">*</span>}
      </Component>
    );
  }
);
Label.displayName = 'Label';

// Code Text - Inline code
export interface CodeProps extends HTMLAttributes<HTMLElement> {
  as?: 'code' | 'span';
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ className, as: Component = 'code', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'font-mono text-sm',
          'bg-bg-muted px-1.5 py-0.5 rounded',
          'text-text',
          className
        )}
        {...props}
      />
    );
  }
);
Code.displayName = 'Code';

