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

export interface CTASectionProps extends HTMLAttributes<HTMLElement> {
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

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'primary',
  className,
  ...props
}: CTASectionProps) {
  const variantClasses = {
    primary: 'bg-primary text-text-inverse',
    accent: 'bg-accent text-text-inverse',
    dark: 'bg-bg text-text-inverse',
  };

  return (
    <section
      className={cn('py-8 sm:py-12', variantClasses[variant], className)}
      {...props}
    >
      <Container maxWidth="xl">
        <MotionDiv variant="fade" className="text-center">
          <Heading level="h2" className="mb-4 text-text-inverse mx-auto">
            {title}
          </Heading>
          {description && (
            <Text size="lg" className="mb-8 text-text-inverse/90 mx-auto max-w-2xl">
              {description}
            </Text>
          )}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-center">
            <Link href={primaryAction.href} className="inline-block">
              <Button size="lg" variant="secondary">
                {primaryAction.label}
              </Button>
            </Link>
            {secondaryAction && (
              <Link href={secondaryAction.href} className="inline-block">
                <Button size="lg" variant="outline" className="border-text-inverse text-text-inverse hover:bg-text-inverse/10">
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

