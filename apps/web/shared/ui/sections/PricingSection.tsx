/**
 * Pricing Section Component
 * Pricing table with multiple tiers
 */

'use client';

import { HTMLAttributes } from 'react';
import { Container, Section, SectionHeader, Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Text } from '@/shared/ui';
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

export interface PricingSectionProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  tiers: PricingTier[];
  columns?: 1 | 2 | 3 | 4;
}

export function PricingSection({
  title,
  description,
  tiers,
  columns = 3,
  className,
  ...props
}: PricingSectionProps) {
  return (
    <Section className={cn('bg-surface', className)} {...props}>
      <Container maxWidth="xl">
        <SectionHeader title={title} description={description} />
        <motion.div
          variants={{}}
          initial="hidden"
          animate="visible"
        >
          <div className={cn(
            'grid gap-6',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'md:grid-cols-2',
            columns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
            columns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
          )}>
            {tiers.map((tier, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={cn(
                  'h-full flex flex-col',
                  tier.popular && 'border-2 border-primary shadow-lg'
                )}>
                  {tier.popular && (
                    <div className="bg-primary text-text-inverse text-center py-1 text-sm font-semibold">
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
                      <Text size="sm" color="muted" className="mt-2">
                        {tier.description}
                      </Text>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-status-success flex-shrink-0 mt-0.5" />
                          <Text size="sm">{feature}</Text>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={tier.cta.href} className="w-full">
                      <Button 
                        variant={tier.popular ? 'primary' : 'outline'} 
                        className="w-full"
                      >
                        {tier.cta.label}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

