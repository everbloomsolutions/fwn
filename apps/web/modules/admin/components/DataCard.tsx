'use client';

import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface Field<T> {
  label: string;
  value: (row: T) => ReactNode;
}

interface DataCardProps<T> {
  rows: T[];
  keyExtractor: (row: T) => string;
  fields: Field<T>[];
  actions?: (row: T) => ReactNode;
  className?: string;
}

export function DataCard<T>({ rows, keyExtractor, fields, actions, className }: DataCardProps<T>) {
  return (
    <div className={cn('space-y-3 sm:hidden', className)}>
      {rows.map((row) => (
        <div key={keyExtractor(row)} className="rounded-2xl border border-border bg-surface p-4">
          <div className="grid gap-2">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4">
                <span className="text-xs font-medium text-text-muted">{field.label}</span>
                <span className="text-right text-sm text-text">{field.value(row)}</span>
              </div>
            ))}
          </div>
          {actions && <div className="mt-4 flex items-center justify-end gap-2">{actions(row)}</div>}
        </div>
      ))}
    </div>
  );
}
