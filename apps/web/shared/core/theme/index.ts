/**
 * Main theme export
 * Centralized theme system with token merging
 */

export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/typography';
export * from './tokens/radius';
export * from './tokens/shadows';
export * from './tokens/transitions';

export * from './config/default';
export * from './config/dark';

export * from './hooks/useTheme';
export * from './hooks/useColorMode';
export * from './hooks/useTemplate';

export * from './utils/cssVar';
export * from './utils/themeMerge';
export * from './utils/motion';
export * from './utils';

export { ThemeProvider } from './ThemeProvider';

