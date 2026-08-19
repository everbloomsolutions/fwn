'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import { Button } from '@/shared/ui/buttons/Button';
import { cn } from '@/shared/utils/cn';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';

interface MobileMenuProps {
  links: ReadonlyArray<{ href: string; label: string }>;
  authLinks?: React.ReactNode;
}

export function MobileMenu({ links, authLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Trap focus within menu when open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

    menu.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => menu.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Use shared body scroll lock hook
  useBodyScrollLock(isOpen);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="md:hidden" // Standardized: hidden on md (768px) and above
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <nav
            ref={menuRef}
            id="mobile-menu"
            className="fixed inset-y-0 right-0 z-50 w-72 bg-surface/95 backdrop-blur-md shadow-2xl md:hidden animate-in slide-in-from-right duration-300"
            aria-label="Mobile navigation"
            role="navigation"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <h2 className="text-lg font-bold text-text">
                  Menu
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="hover:bg-surface-hover rounded-lg"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                  {links.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            'block rounded-lg px-4 py-3 text-lg font-medium transition-all duration-200',
                            isActive
                              ? 'bg-primary text-white shadow-md'
                              : 'text-text hover:bg-surface-hover hover:translate-x-1'
                          )}
                          onClick={() => setIsOpen(false)}
                          style={{
                            animation: `fadeInRight 0.3s ease-out ${index * 0.05}s both`
                          }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {authLinks && (
                <div className="border-t border-border p-4 bg-surface-hover/50">
                  <div className="space-y-2">{authLinks}</div>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

