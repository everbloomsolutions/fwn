/**
 * Theme hook
 * Combines color mode and template support
 */

'use client';

import { useColorMode } from './useColorMode';
import { useTemplate } from './useTemplate';

export function useTheme() {
  const colorMode = useColorMode();
  const template = useTemplate();

  return {
    ...colorMode,
    template: template.template,
    setTemplate: template.setTemplate,
  };
}

