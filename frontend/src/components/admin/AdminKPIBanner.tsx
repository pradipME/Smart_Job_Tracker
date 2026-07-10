import type { ReactNode } from 'react';

interface KPIItem {
  label: string;
  value: string | number;
  change?: { value: number; positive: boolean };
  icon?: ReactNode;
}

interface AdminKPIBannerProps {
  items: KPIItem[];
  className?: string;
}

export function AdminKPIBanner({ items, className = '' }: AdminKPIBannerProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ${className}`}>
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</p>
            </div>
            {item.icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                {item.icon}
              </div>
            )}
          </div>
          {item.change && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${item.change.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {item.change.positive ? '+' : ''}{item.change.value}%
              </span>
              <span className="text-xs text-slate-400">vs last period</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
