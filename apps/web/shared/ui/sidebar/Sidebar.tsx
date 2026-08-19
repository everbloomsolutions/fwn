'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { navigationConfig, NavigationItem } from '@/shared/config/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarSection } from './SidebarSection';
import { Button, Input } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';

// Helper function to filter navigation items recursively
function filterNavigationItems(
  items: NavigationItem[],
  searchQuery: string
): NavigationItem[] {
  if (!searchQuery.trim()) return items;

  const query = searchQuery.toLowerCase();
  return items
    .map((item) => {
      const matchesLabel = item.label.toLowerCase().includes(query);
      const filteredChildren = item.children
        ? filterNavigationItems(item.children, searchQuery)
        : [];

      // Include item if label matches or has matching children
      if (matchesLabel || filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children,
        } as NavigationItem;
      }
      return null;
    })
    .filter((item): item is NavigationItem => item !== null);
}

export function Sidebar() {
  const { isOpen, isMobile, close } = useSidebar();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      close();
    }
  }, [pathname, isMobile, close]);

  // Use shared body scroll lock hook
  useBodyScrollLock(isMobile && isOpen);

  // Filter navigation items based on debounced search
  const filteredNavigation = useMemo(
    () => filterNavigationItems(navigationConfig, debouncedSearchQuery),
    [debouncedSearchQuery]
  );

  // Keyboard navigation (Ctrl+K / Cmd+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && isOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to close sidebar on mobile
      if (e.key === 'Escape' && isMobile && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isMobile, close]);

  // Focus trap when sidebar is open on mobile
  useEffect(() => {
    if (!isMobile || !isOpen || !navRef.current) return;

    const focusableElements = navRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    navRef.current.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      navRef.current?.removeEventListener('keydown', handleTab);
    };
  }, [isMobile, isOpen]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      {/* Header with close button (mobile only) */}
      {isMobile && (
        <div className="flex h-16 items-center justify-end border-b border-border px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            className="h-8 w-8 p-0"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="border-b border-border px-3 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search navigation... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
            aria-label="Search navigation"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav 
        ref={navRef}
        className="flex-1 overflow-y-auto px-3 py-4" 
        aria-label="Sidebar navigation"
        role="navigation"
        aria-orientation="vertical"
      >
        {filteredNavigation.length > 0 ? (
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              if (item.children && item.children.length > 0) {
                return (
                  <SidebarSection
                    key={item.label}
                    item={item}
                    value={item.label.toLowerCase().replace(/\s+/g, '-')}
                    onItemClick={isMobile ? close : undefined}
                  />
                );
              }

              return (
                <SidebarNavItem
                  key={item.href || item.label}
                  href={item.href || '#'}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  external={item.external}
                  onClick={isMobile ? close : undefined}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="h-8 w-8 text-text-light mb-2" />
            <p className="text-sm text-text-muted">No results found</p>
            <p className="text-xs text-text-light mt-1">Try a different search term</p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with improved animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />
            {/* Sidebar Drawer with improved animations */}
            <motion.aside
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smoother animation
              }}
              className="fixed left-0 top-0 z-50 h-full w-64 shadow-xl will-change-[transform,opacity]"
              role="complementary"
              aria-label="Sidebar"
              aria-modal="true"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop sidebar with improved animations
  return (
    <motion.aside
      animate={{
        width: isOpen ? 256 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier
      }}
      className={cn(
        'hidden md:block h-full overflow-hidden will-change-[width,opacity]',
        isOpen && 'border-r border-border'
      )}
      role="complementary"
      aria-label="Sidebar"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="h-full"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

