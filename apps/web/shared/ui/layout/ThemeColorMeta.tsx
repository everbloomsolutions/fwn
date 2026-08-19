/**
 * Theme Color Meta Component
 * Dynamically updates theme-color meta tag for mobile browsers
 */

'use client';

import { useEffect } from 'react';
import { useColorMode } from '@/shared/core/theme/hooks/useColorMode';

export function ThemeColorMeta() {
  const { resolvedMode, mounted } = useColorMode();

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;

    // Get theme color based on resolved mode
    const themeColor = resolvedMode === 'dark' 
      ? '#111827' // bg color for dark mode
      : '#ffffff'; // bg color for light mode

    // Find or create theme-color meta tag
    let metaTag = document.querySelector('meta[name="theme-color"]');
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute('content', themeColor);
  }, [resolvedMode, mounted]);

  return null;
}

