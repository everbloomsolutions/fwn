/**
 * Dark mode theme configuration
 * Overrides for dark mode
 */

import { darkColors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { transitions } from '../tokens/transitions';

export const darkTheme = {
  colors: darkColors,
  spacing,
  typography,
  radius,
  shadows,
  transitions,
} as const;

export type DarkTheme = typeof darkTheme;

