import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Inbox } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortDirection,
  onSort,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription,
  emptyIcon,
  onRowClick,
  className = '',
}: AdminDataTableProps<T>) {
  if (loading) {
    return (
      <div className="admin-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-t border-slate-100">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="admin-table">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            {emptyIcon || <Inbox className="h-6 w-6" />}
          </div>
          <h3 className="text-sm font-semibold text-slate-700">{emptyTitle}</h3>
          {emptyDescription && (
            <p className="mt-1 text-xs text-slate-400 max-w-xs">{emptyDescription}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:text-slate-700 transition-colors' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-300">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`border-t border-slate-100 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-slate-700 ${col.className || ''}`}>
                    {col.render ? col.render(item) : (item as any)[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
