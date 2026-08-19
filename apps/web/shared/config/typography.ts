/**
 * Centralized Typography Configuration
 * Single source of truth for typography sizes and styles
 * 
 * This file centralizes all typography definitions that are used across components.
 * The Heading and Text components should import from here.
 */

export const typography = {
  // Heading sizes - responsive scale
  heading: {
//    h1: 'text-3xl sm:text-4xl md:text-5xl',
    h1: 'text-2xl sm:text-3xl md:text-4xl',
    h2: 'text-2xl sm:text-3xl md:text-4xl',
    h3: 'text-xl sm:text-2xl md:text-3xl',
    h4: 'text-lg sm:text-xl md:text-2xl',
    h5: 'text-base sm:text-lg md:text-xl',
    h6: 'text-sm sm:text-base md:text-lg',
  },
  
  // Compact heading sizes (for smaller spaces)
  headingCompact: {
    h1: 'text-2xl sm:text-3xl md:text-4xl',
    h2: 'text-xl sm:text-2xl md:text-3xl',
    h3: 'text-lg sm:text-xl md:text-2xl',
    h4: 'text-base sm:text-lg md:text-xl',
    h5: 'text-sm sm:text-base md:text-lg',
    h6: 'text-xs sm:text-sm md:text-base',
  },
  
  // Text sizes
  text: {
    // Body text (default)
    body: 'text-base',
    // Large body text (descriptions)
    bodyLarge: 'text-base md:text-lg',
    // Description text
    description: 'text-lg',
    // Small text (captions, labels)
    small: 'text-sm',
  },
  
  // Line heights
  lineHeight: {
    // Body text line height
    body: 'leading-relaxed',
    // Heading line height
    heading: 'leading-tight',
    // Normal line height
    normal: 'leading-normal',
  },
  
  // Font weights
  weight: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
} as const;

export type TypographyConfig = typeof typography;

