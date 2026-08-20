/**
 * Stats Section Component
 * Display statistics/metrics in a visually appealing grid
 */

'use client';

import { HTMLAttributes } from 'react';
import { Container, Section, SectionHeader, Card, CardContent, Text } from '@/shared/ui';
import { staggerContainer } from '@/shared/core/theme/utils/motion';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { LucideIcon } from 'lucide-react';

export interface Stat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

export interface StatsSectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  stats: Stat[];
  columns?: 1 | 2 | 3 | 4;
  animate?: boolean;
  showIcons?: boolean;
}

export function StatsSection({
  title,
  description,
  stats,
  columns = 3,
  animate = true,
  showIcons = true,
  className,
  ...props
}: StatsSectionProps) {
  const colorClasses = {
    primary: 'text-primary',
    accent: 'text-accent',
    success: 'text-status-success',
    warning: 'text-status-warning',
    info: 'text-status-info',
  };

  return (
    <Section padding="sm" className={cn('bg-surface', className)} {...props}>
      <Container maxWidth="xl">
        {title && (
          <SectionHeader title={title} description={description} />
        )}
        {!title && description && (
          <div className="mb-6 text-center">
            <Text size="lg" color="muted" className="max-w-2xl mx-auto">
              {description}
            </Text>
          </div>
        )}
        <motion.div
          variants={animate ? staggerContainer : undefined}
          initial={animate ? 'hidden' : undefined}
          animate={animate ? 'visible' : undefined}
        >
          <div className={cn(
            'grid gap-4',
            columns === 1 && 'grid-cols-1',
            columns === 2 && 'md:grid-cols-2',
            columns === 3 && 'md:grid-cols-2 lg:grid-cols-3',
            columns === 4 && 'md:grid-cols-2 lg:grid-cols-4'
          )}>
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={animate ? {
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  } : undefined}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    enableHover
                    className="text-center bg-surface/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      {showIcons && StatIcon && (
                        <div className={cn(
                          'flex justify-center mb-4',
                          colorClasses[stat.color || 'primary']
                        )}>
                          <StatIcon className="h-8 w-8" />
                        </div>
                      )}
                      <Text className={cn(
                        'text-3xl font-bold mb-1',
                        colorClasses[stat.color || 'primary']
                      )}>
                        {stat.value}
                      </Text>
                      <Text size="sm" className="font-medium text-text-muted">
                        {stat.label}
                      </Text>
                      {stat.description && (
                        <Text size="sm" className="text-text-muted">
                          {stat.description}
                        </Text>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}

