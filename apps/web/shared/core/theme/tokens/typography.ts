/**
 * Typography tokens
 * Font families, sizes, weights, and line heights
 * 
 * This file re-exports typography values from shared/brand/typography.ts
 * to maintain backward compatibility with existing imports.
 * 
 * SOURCE OF TRUTH: front-end/styles/theme.css (CSS variables)
 * TypeScript source: shared/brand/typography.ts
 * 
 * Use shared/brand/typography.ts for new code, or import from here for existing code.
 */

import { brandTypography } from '@/shared/brand';

/**
 * Typography tokens - re-exported from shared brand typography
 * Maps brandTypography structure to the expected format for backward compatibility
 */
export const typography = {
  fontFamily: {
    sans: brandTypography.fonts.sans,
    mono: brandTypography.fonts.mono,
  },
  fontSize: brandTypography.fontSizes,
  fontWeight: brandTypography.fontWeights,
  lineHeight: brandTypography.lineHeights,
  letterSpacing: brandTypography.letterSpacing,
} as const;

export type TypographyToken = typeof typography;

