/**
 * Google Theme Preset
 * Blue primary (#4285F4), clean minimal design
 */

export const googlePreset = {
  light: {
    primary: {
      DEFAULT: '#4285F4',
      hover: '#3367D6',
      light: '#E8F0FE',
    },
    accent: {
      DEFAULT: '#34A853',
      hover: '#2E7D32',
      light: '#E8F5E9',
    },
    text: {
      DEFAULT: '#202124',
      muted: '#5F6368',
      light: '#80868B',
      inverse: '#ffffff',
    },
    surface: {
      DEFAULT: '#ffffff',
      hover: '#F8F9FA',
    },
    bg: {
      DEFAULT: '#ffffff',
      muted: '#F8F9FA',
    },
    border: '#DADCE0',
    status: {
      success: '#34A853',
      warning: '#FBBC04',
      error: '#EA4335',
      info: '#4285F4',
    },
  },
  dark: {
    primary: {
      DEFAULT: '#8AB4F8',
      hover: '#4285F4',
      light: '#1A73E8',
    },
    accent: {
      DEFAULT: '#81C995',
      hover: '#34A853',
      light: '#137333',
    },
    text: {
      DEFAULT: '#E8EAED',
      muted: '#9AA0A6',
      light: '#80868B',
      inverse: '#202124',
    },
    surface: {
      DEFAULT: '#202124',
      hover: '#303134',
    },
    bg: {
      DEFAULT: '#171717',
      muted: '#202124',
    },
    border: '#3C4043',
    status: {
      success: '#81C995',
      warning: '#FDD663',
      error: '#F28B82',
      info: '#8AB4F8',
    },
  },
} as const;

