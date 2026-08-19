/**
 * Feature Component
 * Individual feature card with icon, title, and description
 * Enhanced with image support, links, and hover effects
 */

'use client';

import { HTMLAttributes } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Text } from '@/shared/ui';
import { MotionDiv } from '@/shared/ui/components/motion/MotionDiv';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface FeatureProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  image?: string; // Image support
  imageAlt?: string;
  title: string;
  description: string;
  iconColor?: string;
  href?: string; // Link support
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'slide'; // Hover effects
  iconVariant?: 'solid' | 'outline' | 'gradient'; // Icon variants
}

const hoverEffectClasses = {
  lift: 'hover:-translate-y-2 transition-transform duration-300',
  scale: 'hover:scale-105 transition-transform duration-300',
  glow: 'hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-300',
  slide: 'hover:translate-x-2 transition-transform duration-300',
};

const iconVariantClasses = {
  solid: 'bg-primary text-white',
  outline: 'bg-transparent border-2 border-primary text-primary',
  gradient: 'bg-gradient-to-br from-primary to-accent text-white',
};

export function Feature({
  icon: Icon,
  image,
  imageAlt,
  title,
  description,
  iconColor = 'text-primary',
  href,
  hoverEffect = 'lift',
  iconVariant = 'solid',
  className,
  ...props
}: FeatureProps) {
  const content = (
    <MotionDiv variant="scale">
      <Card 
        className={cn(
          'h-full',
          hoverEffectClasses[hoverEffect],
          href && 'cursor-pointer',
          className
        )} 
        enableHover={!!href}
        {...props}
      >
        {image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
        <CardHeader>
          {(Icon || !image) && (
            <div className={cn(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
              iconVariant === 'solid' && iconColor 
                ? (iconColor === 'text-status-success' 
                    ? 'bg-status-success/10' 
                    : iconColor === 'text-primary'
                      ? 'bg-primary/10'
                      : iconColor === 'text-accent'
                        ? 'bg-accent/10'
                        : 'bg-primary/10')
                : iconVariantClasses[iconVariant]
            )}>
              {Icon && (
                <Icon className={cn(
                  'h-6 w-6 transition-colors',
                  iconVariant === 'solid' && iconColor 
                    ? iconColor // Apply iconColor directly to icon - CSS variables handle dark/light mode automatically
                    : iconVariant === 'outline' 
                      ? 'text-primary' 
                      : iconVariant === 'gradient'
                        ? 'text-white'
                        : 'text-white'
                )} />
              )}
            </div>
          )}
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text color="muted">{description}</Text>
        </CardContent>
      </Card>
    </MotionDiv>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
