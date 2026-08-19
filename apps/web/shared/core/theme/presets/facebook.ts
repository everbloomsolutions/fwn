/**
 * Facebook Theme Preset
 * Blue primary (#1877F2), social-friendly palette
 */

export const facebookPreset = {
  light: {
    primary: {
      DEFAULT: '#1877F2',
      hover: '#166FE5',
      light: '#E7F3FF',
    },
    accent: {
      DEFAULT: '#42B72A',
      hover: '#36A420',
      light: '#E6F7E0',
    },
    text: {
      DEFAULT: '#050505',
      muted: '#65676B',
      light: '#8A8D91',
      inverse: '#ffffff',
    },
    surface: {
      DEFAULT: '#ffffff',
      hover: '#F2F3F5',
    },
    bg: {
      DEFAULT: '#F0F2F5',
      muted: '#E4E6EB',
    },
    border: '#CCD0D5',
    status: {
      success: '#42B72A',
      warning: '#F7B928',
      error: '#F02849',
      info: '#1877F2',
    },
  },
  dark: {
    primary: {
      DEFAULT: '#4599FF',
      hover: '#1877F2',
      light: '#0866FF',
    },
    accent: {
      DEFAULT: '#6BCB77',
      hover: '#42B72A',
      light: '#2D7A3D',
    },
    text: {
      DEFAULT: '#E4E6EB',
      muted: '#B0B3B8',
      light: '#8A8D91',
      inverse: '#050505',
    },
    surface: {
      DEFAULT: '#242526',
      hover: '#3A3B3C',
    },
    bg: {
      DEFAULT: '#18191A',
      muted: '#242526',
    },
    border: '#3A3B3C',
    status: {
      success: '#6BCB77',
      warning: '#FFC107',
      error: '#F02849',
      info: '#4599FF',
    },
  },
} as const;

