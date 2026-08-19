'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { isActiveRoute } from '@/shared/utils/routeDetection';

interface SidebarNavItemProps {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  badge,
  external,
  className,
  onClick,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = isActiveRoute(pathname, href);

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-light text-primary'
          : 'text-text-muted hover:bg-surface-hover hover:text-text',
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-text-inverse">
          {badge}
        </span>
      )}
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className="block">
      {content}
    </Link>
  );
}

