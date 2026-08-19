'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({
  items,
  homeHref = '/',
  showHome = true,
  className,
}: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', href: homeHref }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2', className)}>
      <ol className="flex items-center space-x-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center"
            >
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-text-muted flex-shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-semibold text-text flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10"
                  aria-current="page"
                >
                  {index === 0 && showHome ? (
                    <Home className="h-4 w-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-text-muted hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-hover group"
                >
                  {index === 0 && showHome ? (
                    <Home className="h-4 w-4 group-hover:scale-110 transition-transform" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span className="text-text-muted flex items-center gap-1.5 px-2 py-1">
                  {index === 0 && showHome ? (
                    <Home className="h-4 w-4" aria-label="Home" />
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}

