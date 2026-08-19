/**
 * Twitter/X Theme Preset
 * Black/Blue primary, high contrast
 */

export const twitterPreset = {
  light: {
    primary: {
      DEFAULT: '#1DA1F2',
      hover: '#1A91DA',
      light: '#E1F5FE',
    },
    accent: {
      DEFAULT: '#14171A',
      hover: '#000000',
      light: '#E1E8ED',
    },
    text: {
      DEFAULT: '#14171A',
      muted: '#657786',
      light: '#AAB8C2',
      inverse: '#ffffff',
    },
    surface: {
      DEFAULT: '#ffffff',
      hover: '#F5F8FA',
    },
    bg: {
      DEFAULT: '#ffffff',
      muted: '#F5F8FA',
    },
    border: '#E1E8ED',
    status: {
      success: '#17BF63',
      warning: '#FFAD1F',
      error: '#E0245E',
      info: '#1DA1F2',
    },
  },
  dark: {
    primary: {
      DEFAULT: '#1D9BF0',
      hover: '#1DA1F2',
      light: '#0C4A6E',
    },
    accent: {
      DEFAULT: '#FFFFFF',
      hover: '#E1E8ED',
      light: '#2F3336',
    },
    text: {
      DEFAULT: '#F7F9F9',
      muted: '#8B98A5',
      light: '#71767A',
      inverse: '#000000',
    },
    surface: {
      DEFAULT: '#15202B',
      hover: '#192734',
    },
    bg: {
      DEFAULT: '#000000',
      muted: '#15202B',
    },
    border: '#2F3336',
    status: {
      success: '#00BA7C',
      warning: '#FFD400',
      error: '#F4212E',
      info: '#1D9BF0',
    },
  },
} as const;

