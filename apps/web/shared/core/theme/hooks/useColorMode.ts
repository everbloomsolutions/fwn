/**
 * Color mode hook
 * Manages light/dark/system theme switching
 */

'use client';

import { useEffect, useState } from 'react';
import { generateLightCSSVars, generateDarkCSSVars } from '../utils/cssVar';
import type { PresetName } from '../presets';

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

const COLOR_MODE_STORAGE_KEY = 'color-mode';
const DEFAULT_TEMPLATE: PresetName = 'default';

// Shared template reference for immediate CSS variable updates
let currentTemplate: PresetName = DEFAULT_TEMPLATE;

export function setColorModeTemplate(template: PresetName) {
  currentTemplate = template;
}

function getSystemPreference(): ResolvedColorMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveColorMode(mode: ColorMode): ResolvedColorMode {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

function applyColorMode(mode: ResolvedColorMode) {
  const root = document.documentElement;
  // Set data-theme attribute
  root.setAttribute('data-theme', mode);
  
  // Generate and apply CSS variables immediately for instant visual feedback
  // Use the current template (updated by ThemeProvider via setColorModeTemplate)
  const cssVars = mode === 'dark' 
    ? generateDarkCSSVars(currentTemplate) 
    : generateLightCSSVars(currentTemplate);
  
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function useColorMode() {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [resolvedMode, setResolvedMode] = useState<ResolvedColorMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY) as ColorMode | null;
    const initialMode: ColorMode = stored || 'system';
    const resolved = resolveColorMode(initialMode);
    // Apply immediately
    applyColorMode(resolved);
    // Then set state
    setColorMode(initialMode);
    setResolvedMode(resolved);
  }, []);

  // Listen to system preference changes when mode is 'system'
  useEffect(() => {
    if (colorMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemPreference();
      // Apply immediately
      applyColorMode(resolved);
      // Then update state
      setResolvedMode(resolved);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [colorMode]);

  const updateColorMode = (mode: ColorMode) => {
    const resolved = resolveColorMode(mode);
    // Apply CSS variables immediately (synchronously) before state update
    applyColorMode(resolved);
    // Then update state and localStorage
    setColorMode(mode);
    setResolvedMode(resolved);
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  };

  const toggleColorMode = () => {
    // Simple toggle between light and dark based on current resolved mode
    // If in system mode, toggle to the opposite of current system preference
    if (colorMode === 'system') {
      const currentResolved = resolvedMode;
      updateColorMode(currentResolved === 'dark' ? 'light' : 'dark');
    } else {
      // Toggle between light and dark
      updateColorMode(resolvedMode === 'dark' ? 'light' : 'dark');
    }
  };

  const setLightMode = () => {
    updateColorMode('light');
  };

  const setDarkMode = () => {
    updateColorMode('dark');
  };

  const setSystemMode = () => {
    updateColorMode('system');
  };

  return {
    colorMode,
    resolvedMode,
    mounted,
    toggleColorMode,
    setLightMode,
    setDarkMode,
    setSystemMode,
  };
}

