/**
 * Testimonial Component
 * Individual testimonial card
 */

'use client';

import { HTMLAttributes } from 'react';
import { Card, CardContent, Text, Heading } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { cn } from '@/shared/utils/cn';

export interface TestimonialProps extends HTMLAttributes<HTMLDivElement> {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

export function Testimonial({
  quote,
  author,
  role,
  company,
  avatar,
  className,
  ...props
}: TestimonialProps) {
  return (
    <MotionDiv variant="fade">
      <Card className={cn('h-full', className)} {...props}>
        <CardContent className="p-6">
          <Text size="lg" className="mb-6 italic">
            &quot;{quote}&quot;
          </Text>
          <div className="flex items-center gap-4">
            {avatar && (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">{author[0]}</span>
              </div>
            )}
            <div>
              <Heading level="h4" className="text-sm font-semibold mb-1">
                {author}
              </Heading>
              {(role || company) && (
                <Text size="sm" color="muted">
                  {role && company ? `${role} at ${company}` : role || company}
                </Text>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}

