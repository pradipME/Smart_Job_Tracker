import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; isUp: boolean };
  subtitle?: string;
  className?: string;
}

export function AdminStatCard({ title, value, icon, trend, subtitle, className = '' }: AdminStatCardProps) {
  return (
    <div className={`admin-stat-card group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          {trend.isUp ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className={trend.isUp ? 'text-emerald-600' : 'text-red-600'}>
            {trend.value}%
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
