/**
 * Theme Presets
 * Universal theme presets for popular design systems
 */

import { defaultPreset } from './default';
import { googlePreset } from './google';
import { facebookPreset } from './facebook';
import { linkedinPreset } from './linkedin';
import { twitterPreset } from './twitter';
import { githubPreset } from './github';

export { defaultPreset, googlePreset, facebookPreset, linkedinPreset, twitterPreset, githubPreset };

export type ThemePreset = typeof defaultPreset;

export const presets = {
  default: defaultPreset,
  google: googlePreset,
  facebook: facebookPreset,
  linkedin: linkedinPreset,
  twitter: twitterPreset,
  github: githubPreset,
} as const;

export type PresetName = keyof typeof presets;

