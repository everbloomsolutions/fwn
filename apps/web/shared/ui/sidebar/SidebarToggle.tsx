'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useSidebar } from './SidebarContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { isInUserArea } from '@/shared/utils/routeDetection';

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();
  
  // Only show in user area using shared utility
  if (!isInUserArea(pathname)) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={cn(
        'fixed z-[60] h-10 w-10 p-0',
        'bg-surface border border-border shadow-md',
        'hover:bg-surface-hover transition-colors',
        // Responsive positioning - vertically centered in 64px navbar
        'left-3 top-[12px]',
        'sm:left-4 sm:top-[12px]',
        'md:left-4 md:top-[12px]'
      )}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-text" />
      ) : (
        <Menu className="h-5 w-5 text-text" />
      )}
    </Button>
  );
}
