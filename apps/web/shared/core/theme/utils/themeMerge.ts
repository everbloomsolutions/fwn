/**
 * Theme merging utilities
 * Deep merge theme configurations
 */

/**
 * Deep merge two objects
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T extends Record<string, unknown>>(target: any, source: any): T {
  const output = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      !(sourceValue.constructor && sourceValue.constructor.name === 'Date')
    ) {
      output[key] = deepMerge(
        (target[key] || {}) as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      output[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return output;
}

/**
 * Merge multiple theme configurations
 * Requires at least one theme to be provided
 */
export function mergeThemes<T extends Record<string, unknown>>(
  firstTheme: Partial<T>,
  ...restThemes: Partial<T>[]
): T {
  if (!firstTheme || Object.keys(firstTheme).length === 0) {
    throw new Error('At least one theme must be provided');
  }

  // Use first theme as base, then merge the rest
  return restThemes.reduce(
    (acc, theme) => deepMerge(acc, theme),
    firstTheme as T
  ) as T;
}
