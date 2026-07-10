import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`flex h-10 w-full rounded-xl border bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 ${error ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' : 'border-[var(--border)]'} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
