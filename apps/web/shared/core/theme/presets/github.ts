/**
 * GitHub Theme Preset
 * Dark-friendly, developer-focused
 */

export const githubPreset = {
  light: {
    primary: {
      DEFAULT: '#0969DA',
      hover: '#0860CA',
      light: '#DDF4FF',
    },
    accent: {
      DEFAULT: '#8250DF',
      hover: '#6E40C9',
      light: '#EDE7F6',
    },
    text: {
      DEFAULT: '#24292F',
      muted: '#57606A',
      light: '#8C959F',
      inverse: '#ffffff',
    },
    surface: {
      DEFAULT: '#ffffff',
      hover: '#F6F8FA',
    },
    bg: {
      DEFAULT: '#ffffff',
      muted: '#F6F8FA',
    },
    border: '#D0D7DE',
    status: {
      success: '#1A7F37',
      warning: '#9A6700',
      error: '#CF222E',
      info: '#0969DA',
    },
  },
  dark: {
    primary: {
      DEFAULT: '#58A6FF',
      hover: '#0969DA',
      light: '#0C2D6B',
    },
    accent: {
      DEFAULT: '#A371F7',
      hover: '#8250DF',
      light: '#352160',
    },
    text: {
      DEFAULT: '#F0F6FC',
      muted: '#8B949E',
      light: '#6E7681',
      inverse: '#0D1117',
    },
    surface: {
      DEFAULT: '#161B22',
      hover: '#21262D',
    },
    bg: {
      DEFAULT: '#0D1117',
      muted: '#161B22',
    },
    border: '#30363D',
    status: {
      success: '#3FB950',
      warning: '#D29922',
      error: '#F85149',
      info: '#58A6FF',
    },
  },
} as const;

