import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
  className?: string;
}

export function AdminPageHeader({ title, subtitle, actions, backTo, className = '' }: AdminPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={`admin-page-header ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
