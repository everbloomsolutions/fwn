'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Crumb {
  label: string;
  href?: string;
}

export function AdminBreadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm text-text-muted', className)}
    >
      <Link href="/admin/inventory" className="inline-flex items-center gap-1 hover:text-primary">
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Admin</span>
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-text">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
