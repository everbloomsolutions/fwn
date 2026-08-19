/**
 * Template hook
 * Simple template management for theme variants
 */

'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { PresetName } from '../presets';

export type TemplateType = PresetName;

interface TemplateContextValue {
  template: TemplateType;
  setTemplate: (template: TemplateType) => void;
}

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

const TEMPLATE_STORAGE_KEY = 'theme-template';

export function TemplateProvider({
  children,
  defaultTemplate = 'default',
}: {
  children: ReactNode;
  defaultTemplate?: TemplateType;
}) {
  const [template, setTemplateState] = useState<TemplateType>(defaultTemplate);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY) as TemplateType | null;
    if (stored) {
      setTemplateState(stored);
    }
  }, []);

  const setTemplate = (newTemplate: TemplateType) => {
    setTemplateState(newTemplate);
    if (mounted) {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, newTemplate);
    }
  };

  return (
    <TemplateContext.Provider value={{ template, setTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}

