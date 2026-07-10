import type { ReactNode } from 'react';

interface ActivityItem {
  id: string | number;
  icon: ReactNode;
  iconBg?: string;
  title: string;
  description?: string;
  timestamp: string;
}

interface AdminActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  className?: string;
  emptyMessage?: string;
}

export function AdminActivityFeed({ items, title = 'Recent Activity', className = '', emptyMessage = 'No recent activity' }: AdminActivityFeedProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${item.iconBg || 'bg-slate-100 text-slate-500'}`}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
