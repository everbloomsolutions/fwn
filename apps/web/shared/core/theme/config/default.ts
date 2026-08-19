/**
 * Default theme configuration
 * Base theme with light mode values
 */

import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { transitions } from '../tokens/transitions';

export const defaultTheme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  transitions,
} as const;

export type DefaultTheme = typeof defaultTheme;

