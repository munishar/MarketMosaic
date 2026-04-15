import React, { useMemo } from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNestedValue } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  emptyMessage?: string;
  rowKey?: (row: T) => string;
}

export function DataTable<T extends object = Record<string, unknown>>({
  columns,
  data,
  isLoading,
  onRowClick,
  page = 1,
  totalPages = 1,
  onPageChange,
  sortField,
  sortOrder,
  onSort,
  emptyMessage = 'No data found',
  rowKey,
}: DataTableProps<T>) {
  const handleSort = (col: Column<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  const rows = useMemo(() => data, [data]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-surface-card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-surface-card p-12 text-center">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                    col.className,
                  )}
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortField === col.key && (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row) : idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50',
                )}
              >
                {columns.map((col) => {
                  const cellValue = getNestedValue(row as unknown as Record<string, unknown>, col.key);
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'whitespace-nowrap px-4 py-3 text-sm text-gray-700',
                        col.className,
                      )}
                    >
                      {col.render ? col.render(cellValue, row) : String(cellValue ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
