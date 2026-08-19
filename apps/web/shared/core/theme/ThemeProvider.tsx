/**
 * Theme Provider
 * Manages color mode and CSS variable injection
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { useColorMode, setColorModeTemplate } from './hooks/useColorMode';
import { TemplateProvider, useTemplate } from './hooks/useTemplate';
import { generateLightCSSVars, generateDarkCSSVars } from './utils/cssVar';
import type { PresetName } from './presets';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTemplate?: PresetName;
}

function ThemeInjector({ children }: { children: ReactNode }) {
  const { resolvedMode, mounted } = useColorMode();
  const { template } = useTemplate();

  // Update the template reference in useColorMode when it changes
  useEffect(() => {
    setColorModeTemplate(template);
  }, [template]);

  useEffect(() => {
    if (!mounted) return;

    // Generate CSS variables based on resolved color mode and preset
    const cssVars = resolvedMode === 'dark' 
      ? generateDarkCSSVars(template) 
      : generateLightCSSVars(template);

    // Apply to document root
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedMode);
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [resolvedMode, mounted, template]);

  // Prevent flash of unstyled content
  useEffect(() => {
    if (!mounted) {
      const stored = localStorage.getItem('color-mode');
      let initialMode: 'light' | 'dark';
      if (stored === 'system' || !stored) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialMode = prefersDark ? 'dark' : 'light';
      } else {
        initialMode = stored as 'light' | 'dark';
      }
      document.documentElement.setAttribute('data-theme', initialMode);
    }
  }, [mounted]);

  return <>{children}</>;
}

export function ThemeProvider({ children, defaultTemplate = 'default' }: ThemeProviderProps) {
  return (
    <TemplateProvider defaultTemplate={defaultTemplate}>
      <ThemeInjector>{children}</ThemeInjector>
    </TemplateProvider>
  );
}
