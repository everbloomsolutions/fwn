/**
 * Testimonial Section Component
 * Grid of testimonials with section header
 */

'use client';

import { HTMLAttributes } from 'react';
import { Container, Grid, Section, SectionHeader } from '@/shared/ui';
import { Testimonial, TestimonialProps } from './Testimonial';
import { staggerContainer } from '@/shared/core/theme/utils/motion';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

export interface TestimonialSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  testimonials: Omit<TestimonialProps, 'className'>[];
  columns?: 1 | 2 | 3;
}

export function TestimonialSection({
  title,
  description,
  testimonials,
  columns = 3,
  className,
  ...props
}: TestimonialSectionProps) {
  return (
    <Section className={cn('bg-bg-muted', className)} {...props}>
      <Container maxWidth="xl">
        <SectionHeader title={title} description={description} />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid cols={columns} gap="lg">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Section>
  );
}

