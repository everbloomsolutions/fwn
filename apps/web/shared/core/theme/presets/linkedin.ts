/**
 * LinkedIn Theme Preset
 * Blue primary (#0A66C2), professional palette
 */

export const linkedinPreset = {
  light: {
    primary: {
      DEFAULT: '#0A66C2',
      hover: '#004182',
      light: '#E7F1FC',
    },
    accent: {
      DEFAULT: '#0077B5',
      hover: '#005885',
      light: '#E6F2F8',
    },
    text: {
      DEFAULT: '#000000',
      muted: '#666666',
      light: '#999999',
      inverse: '#ffffff',
    },
    surface: {
      DEFAULT: '#ffffff',
      hover: '#F3F2EF',
    },
    bg: {
      DEFAULT: '#F3F2EF',
      muted: '#E9E5DF',
    },
    border: '#D0CEC9',
    status: {
      success: '#057642',
      warning: '#E37A00',
      error: '#C8102E',
      info: '#0A66C2',
    },
  },
  dark: {
    primary: {
      DEFAULT: '#70B5F9',
      hover: '#0A66C2',
      light: '#004182',
    },
    accent: {
      DEFAULT: '#5BA3D4',
      hover: '#0077B5',
      light: '#005885',
    },
    text: {
      DEFAULT: '#FFFFFF',
      muted: '#B3B3B3',
      light: '#999999',
      inverse: '#000000',
    },
    surface: {
      DEFAULT: '#1D1F23',
      hover: '#2D2F33',
    },
    bg: {
      DEFAULT: '#0D0D0D',
      muted: '#1D1F23',
    },
    border: '#3D3F43',
    status: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#70B5F9',
    },
  },
} as const;

