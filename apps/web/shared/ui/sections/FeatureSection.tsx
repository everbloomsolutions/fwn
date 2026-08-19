/**
 * Feature Section Component
 * Grid of feature cards with section header
 */

'use client';

import { HTMLAttributes } from 'react';
import { Container, Grid, Section, SectionHeader } from '@/shared/ui';
import { Feature, FeatureProps } from './Feature';
import { staggerContainer } from '@/shared/core/theme/utils/motion';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

export interface FeatureSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  features: Omit<FeatureProps, 'className'>[];
  columns?: 1 | 2 | 3 | 4;
}

export function FeatureSection({
  title,
  description,
  features,
  columns = 3,
  className,
  ...props
}: FeatureSectionProps) {
  return (
    <Section padding="sm" className={cn('bg-surface', className)} {...props}>
      <Container maxWidth="xl">
        <SectionHeader title={title} description={description} />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Grid cols={columns} gap="lg">
            {features.map((feature, index) => (
              <Feature key={index} {...feature} />
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Section>
  );
}

