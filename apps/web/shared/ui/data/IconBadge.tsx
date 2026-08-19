'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const iconBadgeVariants = cva(
  'flex items-center justify-center rounded-lg transition-colors',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
      color: {
        primary: 'bg-primary/10 text-primary',
        accent: 'bg-accent/10 text-accent',
        success: 'bg-status-success/10 text-status-success',
        error: 'bg-status-error/10 text-status-error',
        warning: 'bg-status-warning/10 text-status-warning',
        info: 'bg-status-info/10 text-status-info',
        muted: 'bg-surface-hover text-text-muted',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

export interface IconBadgeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof iconBadgeVariants> {
  children: ReactNode;
}

export function IconBadge({
  className,
  size,
  color,
  children,
  ...props
}: IconBadgeProps) {
  return (
    <div
      className={cn(iconBadgeVariants({ size, color }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

