/**
 * CTA (Call-to-Action) Section Component
 * Prominent call-to-action section
 */

'use client';

import { HTMLAttributes } from 'react';
import { Container, Button, Heading, Text } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';

export interface CTAProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  variant?: 'primary' | 'accent' | 'dark';
}

export function CTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'primary',
  className,
  ...props
}: CTAProps) {
  const variantClasses = {
    primary: 'bg-primary text-text-inverse',
    accent: 'bg-accent text-text-inverse',
    dark: 'bg-surface text-text',
  };

  const isDark = variant === 'dark';

  return (
    <section
      className={cn('py-20', variantClasses[variant], className)}
      {...props}
    >
      <Container maxWidth="xl">
        <MotionDiv variant="fade" className="text-center">
          <Heading level="h2" className={cn('mb-4 mx-auto', isDark ? 'text-text' : 'text-text-inverse')}>
            {title}
          </Heading>
          {description && (
            <Text size="lg" className={cn('mb-8 mx-auto max-w-2xl', isDark ? 'text-text/90' : 'text-text-inverse/90')}>
              {description}
            </Text>
          )}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
            <Link href={primaryAction.href}>
              <Button size="lg" variant="secondary">
                {primaryAction.label}
              </Button>
            </Link>
            {secondaryAction && (
              <Link href={secondaryAction.href}>
                <Button size="lg" variant="outline" className={cn('hover:bg-text/10', isDark ? 'border-text text-text' : 'border-text-inverse text-text-inverse hover:bg-text-inverse/10')}>
                  {secondaryAction.label}
                </Button>
              </Link>
            )}
          </div>
        </MotionDiv>
      </Container>
    </section>
  );
}

