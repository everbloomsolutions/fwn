/**
 * Typography Utility Helpers
 * 
 * Provides type-safe utility functions for accessing typography values
 * in TypeScript code.
 * 
 * SOURCE OF TRUTH: front-end/styles/theme.css (CSS variables)
 * TypeScript source: shared/brand/typography.ts
 * 
 * These utilities provide convenient access to typography values
 * while maintaining type safety and consistency.
 */

import { brandTypography } from '@/shared/brand';

/**
 * Typography utility functions
 */
export const typography = {
  /**
   * Get font size value by key
   * @param size - Font size key (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)
   * @returns Font size value (e.g., '0.75rem')
   */
  getFontSize: (size: keyof typeof brandTypography.fontSizes): string => {
    return brandTypography.fontSizes[size];
  },

  /**
   * Get font weight value by key
   * @param weight - Font weight key (normal, medium, semibold, bold)
   * @returns Font weight value (e.g., 400)
   */
  getFontWeight: (weight: keyof typeof brandTypography.fontWeights): number => {
    return brandTypography.fontWeights[weight];
  },

  /**
   * Get line height value by key
   * @param height - Line height key (none, tight, snug, normal, relaxed, loose)
   * @returns Line height value (e.g., 1.5)
   */
  getLineHeight: (height: keyof typeof brandTypography.lineHeights): number => {
    return brandTypography.lineHeights[height];
  },

  /**
   * Get letter spacing value by key
   * @param spacing - Letter spacing key (tighter, tight, normal, wide, wider, widest)
   * @returns Letter spacing value (e.g., '-0.025em')
   */
  getLetterSpacing: (spacing: keyof typeof brandTypography.letterSpacing): string => {
    return brandTypography.letterSpacing[spacing];
  },

  /**
   * Get font family value by key
   * @param family - Font family key (sans, mono)
   * @returns Font family value (e.g., "'Inter', sans-serif")
   */
  getFontFamily: (family: keyof typeof brandTypography.fonts): string => {
    return brandTypography.fonts[family];
  },
} as const;

/**
 * Direct access to typography values
 * Use these for direct property access when needed
 */
export const fontSizes = brandTypography.fontSizes;
export const fontWeights = brandTypography.fontWeights;
export const lineHeights = brandTypography.lineHeights;
export const letterSpacing = brandTypography.letterSpacing;
export const fonts = brandTypography.fonts;

/**
 * Type exports for use in component props
 */
export type FontSize = keyof typeof brandTypography.fontSizes;
export type FontWeight = keyof typeof brandTypography.fontWeights;
export type LineHeight = keyof typeof brandTypography.lineHeights;
export type LetterSpacing = keyof typeof brandTypography.letterSpacing;
export type FontFamily = keyof typeof brandTypography.fonts;

