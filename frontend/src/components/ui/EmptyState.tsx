import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
