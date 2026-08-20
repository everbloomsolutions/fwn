'use client';

import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  className?: string;
}

export function DataTable<T>({ columns, rows, keyExtractor, className }: DataTableProps<T>) {
  return (
    <div className={cn('hidden overflow-hidden rounded-2xl border border-border sm:block', className)}>
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-left font-medium text-text-muted', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-border/50 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 align-top', col.className)}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
