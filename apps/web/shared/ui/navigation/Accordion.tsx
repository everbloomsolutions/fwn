'use client';

import { ReactNode, createContext, useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  allowMultiple?: boolean;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within Accordion');
  }
  return context;
}

export interface AccordionProps {
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  allowMultiple?: boolean;
  children: ReactNode;
  className?: string;
}

export function Accordion({
  defaultValue,
  value,
  onValueChange,
  allowMultiple = false,
  children,
  className,
}: AccordionProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (allowMultiple ? [] : '')
  );

  const currentValue = isControlled ? value : internalValue;
  const openItems = new Set(
    Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : []
  );

  const toggleItem = (itemValue: string) => {
    let newValue: string | string[];

    if (allowMultiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      if (openItems.has(itemValue)) {
        newValue = currentArray.filter((v) => v !== itemValue);
      } else {
        newValue = [...currentArray, itemValue];
      }
    } else {
      newValue = openItems.has(itemValue) ? '' : itemValue;
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className={cn('w-full', className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={cn('border-b border-border last:border-b-0', className)} data-accordion-item={value}>
      {children}
    </div>
  );
}

export interface AccordionTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({
  value,
  children,
  className,
}: AccordionTriggerProps) {
  const { openItems, toggleItem } = useAccordionContext();
  const isOpen = openItems.has(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        'flex w-full items-center justify-between py-4 text-left font-medium text-text transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 text-text-muted transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

export interface AccordionContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ value, children, className }: AccordionContentProps) {
  const { openItems } = useAccordionContext();
  const isOpen = openItems.has(value);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id={`accordion-content-${value}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={cn('pb-4 pt-0 text-sm text-text-muted', className)}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

