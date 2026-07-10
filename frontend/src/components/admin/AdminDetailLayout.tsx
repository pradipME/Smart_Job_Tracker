import type { ReactNode } from 'react';

interface AdminDetailLayoutProps {
  main: ReactNode;
  sidebar: ReactNode;
  className?: string;
}

export function AdminDetailLayout({ main, sidebar, className = '' }: AdminDetailLayoutProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5 items-start ${className}`}>
      <div className="space-y-5 min-w-0">{main}</div>
      <div className="space-y-5">{sidebar}</div>
    </div>
  );
}
