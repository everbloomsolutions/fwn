'use client';

import { ReactNode } from 'react';
import { Heading } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';
import { AdminBreadcrumbs, Crumb } from '@/modules/admin/components/AdminBreadcrumbs';

interface PageHeaderProps {
  title: string;
  crumbs?: Crumb[];
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, crumbs, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        {crumbs && <AdminBreadcrumbs items={crumbs} className="mb-2" />}
        <Heading level="h1" size="compact" balance>
          {title}
        </Heading>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
