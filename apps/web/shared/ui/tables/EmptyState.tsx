'use client';

import { ReactNode } from 'react';
import { Button } from '@/shared/ui/buttons/Button';
import { cn } from '@/shared/utils/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-text-light" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-2">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-text-muted">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

