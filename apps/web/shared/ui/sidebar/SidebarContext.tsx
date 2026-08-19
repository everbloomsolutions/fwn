'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return default values when not within provider (for public pages)
    return {
      isOpen: false,
      isMobile: false,
      toggle: () => {},
      open: () => {},
      close: () => {},
    };
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On mobile, sidebar should be closed by default
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Load preference from localStorage (desktop only)
    if (typeof window !== 'undefined' && !isMobile) {
      const saved = localStorage.getItem('sidebar-open');
      if (saved !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(saved === 'true');
      }
    }
  }, [isMobile]);

  const toggle = () => {
    setIsOpen((prev) => {
      const newValue = !prev;
      // Save preference (desktop only)
      if (typeof window !== 'undefined' && !isMobile) {
        localStorage.setItem('sidebar-open', String(newValue));
      }
      return newValue;
    });
  };

  const open = () => {
    setIsOpen(true);
    if (typeof window !== 'undefined' && !isMobile) {
      localStorage.setItem('sidebar-open', 'true');
    }
  };

  const close = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined' && !isMobile) {
      localStorage.setItem('sidebar-open', 'false');
    }
  };

  return (
    <SidebarContext.Provider value={{ isOpen, isMobile, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

