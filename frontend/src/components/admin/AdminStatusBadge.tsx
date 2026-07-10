import type { ReactNode } from 'react';

interface AdminStatusBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

const variants: Record<string, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-50 text-slate-500 border-slate-100',
};

const dots: Record<string, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-300',
};

const statusMap: Record<string, string> = {
  APPLIED: 'info',
  SCREENING: 'warning',
  INTERVIEW: 'warning',
  INTERVIEW_SCHEDULED: 'warning',
  OFFER: 'success',
  HIRED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
  ACTIVE: 'success',
  DRAFT: 'default',
  CLOSED: 'neutral',
  PUBLISHED: 'success',
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
  PASSED: 'success',
  SCHEDULED: 'info',
  CANCELLED: 'neutral',
  NEW: 'info',
  REVIEWING: 'warning',
  SHORTLISTED: 'info',
};

export function AdminStatusBadge({ children, variant, className = '' }: AdminStatusBadgeProps) {
  const label = typeof children === 'string' ? children : '';
  const resolvedVariant = variant || statusMap[label] || 'default';
  const variantClasses = variants[resolvedVariant] || variants.default;
  const dotClass = dots[resolvedVariant] || dots.default;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border ${variantClasses} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {children}
    </span>
  );
}
