/**
 * Template hook
 * Simple template management for theme variants
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
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
  const [template, setTemplateState] = useState<TemplateType>(() => {
    if (typeof window === 'undefined') return defaultTemplate;
    return (localStorage.getItem(TEMPLATE_STORAGE_KEY) as TemplateType | null) || defaultTemplate;
  });

  const setTemplate = (newTemplate: TemplateType) => {
    setTemplateState(newTemplate);
    if (typeof window !== 'undefined') {
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

