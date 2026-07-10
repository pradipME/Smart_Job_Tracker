import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`flex h-10 w-full rounded-xl border bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 appearance-none ${error ? 'border-red-500 focus:ring-red-500/25' : 'border-[var(--border)]'} ${className}`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-red-500 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
