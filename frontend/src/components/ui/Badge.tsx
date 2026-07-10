import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: string;
  className?: string;
}

const BADGE_COLORS: Record<string, string> = {
  APPLIED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  INTERVIEW: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
  OFFER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
};

const BADGE_DOTS: Record<string, string> = {
  APPLIED: 'bg-amber-500',
  INTERVIEW: 'bg-violet-500',
  OFFER: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
};

export function Badge({ children, variant, className = '' }: BadgeProps) {
  const dotColor = variant ? BADGE_DOTS[variant] : 'bg-[var(--muted-foreground)]';
  const colorClass = variant ? BADGE_COLORS[variant] : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-medium ${colorClass} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {children}
    </span>
  );
}
