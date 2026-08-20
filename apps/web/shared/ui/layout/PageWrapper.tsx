import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('py-6 sm:py-10', className)}>{children}</div>;
}
