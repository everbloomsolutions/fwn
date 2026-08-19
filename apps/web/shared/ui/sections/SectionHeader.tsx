/**
 * Section Header Component
 * Reusable section header with title and description
 */

'use client';

import { HTMLAttributes } from 'react';
import { Heading, Text } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function SectionHeader({
  title,
  description,
  align = 'center',
  headingLevel = 'h2',
  className,
  ...props
}: SectionHeaderProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('mb-6', alignClasses[align], className)} {...props}>
      <Heading level={headingLevel} className="mb-2">
        {title}
      </Heading>
      {description && (
        <Text size="lg" color="muted" className="max-w-2xl mx-auto">
          {description}
        </Text>
      )}
    </div>
  );
}

