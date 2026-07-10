import type { ReactNode } from 'react';

interface AdminFormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminFormSection({ title, icon, children, className = '' }: AdminFormSectionProps) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}
