/**
 * Color palette tokens
 * Centralized color definitions for the design system
 */

export const colors = {
  primary: {
    DEFAULT: '#3b82f6',
    hover: '#2563eb',
    light: '#dbeafe',
  },
  accent: {
    DEFAULT: '#8b5cf6',
    hover: '#7c3aed',
    light: '#ede9fe',
  },
  text: {
    DEFAULT: '#1f2937',
    muted: '#6b7280',
    light: '#9ca3af',
    inverse: '#ffffff',
  },
  surface: {
    DEFAULT: '#ffffff',
    hover: '#f9fafb',
  },
  bg: {
    DEFAULT: '#ffffff',
    muted: '#f9fafb',
  },
  border: '#e5e7eb',
  status: {
    success: '#059669', // WCAG AA compliant (4.5:1 contrast)
    successLight: '#d1fae5', // Light variant for backgrounds
    warning: '#d97706', // WCAG AA compliant (4.5:1 contrast)
    warningLight: '#fef3c7', // Light variant for backgrounds
    error: '#dc2626', // WCAG AA compliant (4.5:1 contrast)
    errorLight: '#fee2e2', // Light variant for backgrounds
    info: '#2563eb', // WCAG AA compliant (4.5:1 contrast)
    infoLight: '#dbeafe', // Light variant for backgrounds
  },
} as const;

export const darkColors = {
  primary: {
    DEFAULT: '#60a5fa',
    hover: '#3b82f6',
    light: '#1e3a8a',
  },
  accent: {
    DEFAULT: '#a78bfa',
    hover: '#8b5cf6',
    light: '#4c1d95',
  },
  text: {
    DEFAULT: '#f9fafb',
    muted: '#9ca3af',
    light: '#6b7280',
    inverse: '#1f2937',
  },
  surface: {
    DEFAULT: '#1f2937',
    hover: '#374151',
  },
  bg: {
    DEFAULT: '#111827',
    muted: '#1f2937',
  },
  border: '#374151',
  status: {
    success: '#10b981', // Good contrast on dark backgrounds
    successLight: '#064e3b', // Dark variant for backgrounds
    warning: '#f59e0b', // Good contrast on dark backgrounds
    warningLight: '#78350f', // Dark variant for backgrounds
    error: '#f87171', // Good contrast on dark backgrounds
    errorLight: '#7f1d1d', // Dark variant for backgrounds
    info: '#60a5fa', // Good contrast on dark backgrounds
    infoLight: '#1e3a8a', // Dark variant for backgrounds
  },
} as const;

export type ColorToken = typeof colors;
export type DarkColorToken = typeof darkColors;

