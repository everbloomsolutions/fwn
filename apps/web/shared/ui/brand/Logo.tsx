/**
 * Logo Component
 * Reusable logo component with support for light/dark modes and sizing
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { useColorMode } from '@/shared/core/theme/hooks/useColorMode';

export interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

// Logo dimensions: 112.03x60.51 (aspect ratio ~1.85:1)
// Size mappings maintain aspect ratio
const sizeMap = {
  sm: { width: 75, height: 40 }, // ~1.88:1
  md: { width: 112, height: 60 }, // ~1.87:1 (actual dimensions)
  lg: { width: 150, height: 81 }, // ~1.85:1
};

export function Logo({
  variant = 'auto',
  size = 'md',
  href,
  className,
}: LogoProps) {
  const { resolvedMode, mounted } = useColorMode();
  
  // Memoize logo source and key to ensure proper updates
  const { logoSrc, logoKey } = useMemo(() => {
    let src = '/logo.svg'; // Default to light logo
    let key = `logo-${variant}`;
    
    if (variant === 'auto') {
      // Auto mode: use dark logo in dark theme, light logo in light theme
      if (mounted) {
        // When mounted, use the resolved mode
        src = resolvedMode === 'dark' ? '/logo-dark.svg' : '/logo.svg';
        key = `logo-auto-${resolvedMode}`;
      } else {
        // Before mount, default to light logo to avoid hydration mismatch
        src = '/logo.svg';
        key = 'logo-auto-unmounted';
      }
    } else if (variant === 'dark') {
      src = '/logo-dark.svg';
      key = 'logo-dark';
    } else {
      // variant === 'light' or explicit light
      src = '/logo.svg';
      key = 'logo-light';
    }
    
    return { logoSrc: src, logoKey: key };
  }, [variant, resolvedMode, mounted]);

  const dimensions = sizeMap[size];
  
  // Force complete remount when theme changes by using key
  const logoImage = (
    <Image
      key={logoKey}
      src={logoSrc}
      alt="Foodworld Naturals"
      width={dimensions.width}
      height={dimensions.height}
      priority
      className="object-contain"
      style={{ width: 'auto', height: 'auto', maxHeight: '48px', maxWidth: '100%' }}
      aria-label="Foodworld Naturals Home"
    />
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className={cn('inline-flex items-center', className)}
        aria-label="Navigate to home"
      >
        {logoImage}
      </Link>
    );
  }

  return <div className={cn('inline-flex items-center', className)}>{logoImage}</div>;
}

