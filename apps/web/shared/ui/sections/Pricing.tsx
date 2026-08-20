/**
 * Pricing Section Component
 * Pricing table with multiple tiers
 */

'use client';

import { HTMLAttributes } from 'react';
import { Container, Section, SectionHeader, Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Text } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { staggerContainer } from '@/shared/core/theme/utils/motion';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { Check } from 'lucide-react';

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta: {
    label: string;
    href: string;
  };
  popular?: boolean;
}

export interface PricingProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  tiers: PricingTier[];
}

export function Pricing({
  title,
  description,
  tiers,
  className,
  ...props
}: PricingProps) {
  return (
    <Section className={cn('bg-surface', className)} {...props}>
      <Container maxWidth="xl">
        <SectionHeader title={title} description={description} />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tiers.map((tier, index) => (
            <MotionDiv key={index} variant="scale">
              <Card className={cn('h-full flex flex-col', tier.popular && 'ring-2 ring-primary')}>
                {tier.popular && (
                  <div className="bg-primary text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-text-muted">/{tier.period}</span>
                    )}
                  </div>
                  {tier.description && (
                    <Text color="muted" className="mt-2">
                      {tier.description}
                    </Text>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <Text size="sm">{feature}</Text>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href={tier.cta.href} className="w-full">
                    <Button variant={tier.popular ? 'primary' : 'outline'} className="w-full" size="lg">
                      {tier.cta.label}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </MotionDiv>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}

