/**
 * CSS variable generation utilities
 * Converts theme tokens to CSS custom properties
 */

import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { transitions } from '../tokens/transitions';
import { presets, type PresetName } from '../presets';

/**
 * Flatten nested object to CSS variable format
 */
function flattenToCSSVars(
  obj: Record<string, unknown>,
  prefix = '',
  result: Record<string, string> = {}
): Record<string, string> {
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const newKey = prefix ? `${prefix}-${key}` : key;
      
      // Handle DEFAULT key specially - use parent key name without DEFAULT suffix
      if (key === 'DEFAULT' && prefix) {
        const defaultValue = (value as Record<string, unknown>).DEFAULT;
        if (typeof defaultValue !== 'undefined') {
          result[`--${prefix}`] = String(defaultValue);
        }
        // Process other keys in the object
        for (const subKey in value) {
          if (subKey !== 'DEFAULT') {
            const subValue = (value as Record<string, unknown>)[subKey];
            if (typeof subValue === 'object' && subValue !== null && !Array.isArray(subValue)) {
              flattenToCSSVars(subValue as Record<string, unknown>, `${prefix}-${subKey}`, result);
            } else {
              result[`--${prefix}-${subKey}`] = String(subValue);
            }
          }
        }
      } else {
        flattenToCSSVars(value as Record<string, unknown>, newKey, result);
      }
    } else {
      // Handle DEFAULT key at leaf level
      if (key === 'DEFAULT' && prefix) {
        result[`--${prefix}`] = String(value);
      } else {
        const newKey = prefix ? `${prefix}-${key}` : key;
        result[`--${newKey}`] = String(value);
      }
    }
  }
  return result;
}

/**
 * Generate CSS variables for light theme
 */
export function generateLightCSSVars(presetName: PresetName = 'default'): Record<string, string> {
  const preset = presets[presetName];
  const presetColors = preset.light;
  
  return {
    ...flattenToCSSVars(presetColors, 'color'),
    ...flattenToCSSVars(spacing, 'space'),
    ...flattenToCSSVars(typography.fontFamily, 'font'),
    ...flattenToCSSVars(typography.fontSize, 'font-size'),
    ...flattenToCSSVars(typography.fontWeight, 'font-weight'),
    ...flattenToCSSVars(typography.lineHeight, 'line-height'),
    ...flattenToCSSVars(typography.letterSpacing, 'letter-spacing'),
    ...flattenToCSSVars(radius, 'radius'),
    ...flattenToCSSVars(shadows, 'shadow'),
    ...flattenToCSSVars(transitions, 'transition'),
  };
}

/**
 * Generate CSS variables for dark theme
 */
export function generateDarkCSSVars(presetName: PresetName = 'default'): Record<string, string> {
  const preset = presets[presetName];
  const presetColors = preset.dark;
  
  return {
    ...flattenToCSSVars(presetColors, 'color'),
    ...flattenToCSSVars(spacing, 'space'),
    ...flattenToCSSVars(typography.fontFamily, 'font'),
    ...flattenToCSSVars(typography.fontSize, 'font-size'),
    ...flattenToCSSVars(typography.fontWeight, 'font-weight'),
    ...flattenToCSSVars(typography.lineHeight, 'line-height'),
    ...flattenToCSSVars(typography.letterSpacing, 'letter-spacing'),
    ...flattenToCSSVars(radius, 'radius'),
    ...flattenToCSSVars(shadows, 'shadow'),
    ...flattenToCSSVars(transitions, 'transition'),
  };
}

/**
 * Convert CSS vars object to CSS string
 */
export function cssVarsToCSSString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

