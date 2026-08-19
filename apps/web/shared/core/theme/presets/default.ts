/**
 * Default Theme Preset
 * Current blue/purple palette
 */

export const defaultPreset = {
  light: {
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
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  dark: {
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
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
  },
} as const;

