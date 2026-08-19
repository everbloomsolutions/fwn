'use client';

import { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  mobileLabel?: string;
}

export interface ResponsiveTableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  mobileCardClassName?: string;
  onRowClick?: (row: T) => void;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  className,
  mobileCardClassName,
  onRowClick,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn('w-full border-collapse', className)}>
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-text',
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const key = keyExtractor(row);
              return (
                <tr
                  key={key}
                  className={cn(
                    'border-b border-border hover:bg-surface-hover transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => {
                    const content = column.accessor
                      ? column.accessor(row)
                      : (row[column.key] as ReactNode);
                    return (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-text',
                          column.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((row) => {
          const key = keyExtractor(row);
          return (
            <div
              key={key}
              className={cn(
                'rounded-lg border border-border bg-surface p-4 shadow-sm',
                onRowClick && 'cursor-pointer hover:shadow-md transition-shadow',
                mobileCardClassName
              )}
              onClick={() => onRowClick?.(row)}
            >
              <div className="space-y-3">
                {columns.map((column) => {
                  const content = column.accessor
                    ? column.accessor(row)
                    : (row[column.key] as ReactNode);
                  const label = column.mobileLabel || column.header;
                  
                  return (
                    <div key={column.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <dt className="text-sm font-medium text-text-light">
                        {label}:
                      </dt>
                      <dd className={cn('text-sm text-text', column.className)}>
                        {content}
                      </dd>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

