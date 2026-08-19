'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/navigation/Accordion';
import { usePathname } from 'next/navigation';
import { NavigationItem } from '@/shared/config/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { isActiveRoute } from '@/shared/utils/routeDetection';

interface SidebarSectionProps {
  item: NavigationItem;
  value: string;
  defaultOpen?: boolean;
  onItemClick?: () => void;
}

export function SidebarSection({ item, value, defaultOpen, onItemClick }: SidebarSectionProps) {
  const pathname = usePathname();
  
  // Check if any child is active using shared utility
  const hasActiveChild = item.children?.some(
    (child) => child.href && isActiveRoute(pathname, child.href)
  );

  // Default to open if has active child
  const shouldDefaultOpen = defaultOpen || hasActiveChild;

  if (!item.children || item.children.length === 0) {
    return null;
  }

  const Icon = item.icon;

  return (
    <Accordion defaultValue={shouldDefaultOpen ? [value] : []} allowMultiple={false}>
      <AccordionItem value={value}>
        <AccordionTrigger value={value} className="px-3 py-2">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-5 w-5 text-text-muted" />}
            <span className="text-sm font-semibold text-text">{item.label}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent value={value}>
          <div className="space-y-1 pl-8">
            {item.children.map((child) => (
              <SidebarNavItem
                key={child.href || child.label}
                href={child.href || '#'}
                icon={child.icon}
                label={child.label}
                badge={child.badge}
                external={child.external}
                onClick={onItemClick}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

