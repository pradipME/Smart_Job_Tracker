import { forwardRef, memo, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 shadow-lg shadow-blue-500/20',
  secondary:
    'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)] active:bg-[var(--muted)] shadow-sm',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-800 shadow-lg shadow-red-500/20',
  ghost:
    'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] active:bg-[var(--muted)]',
  outline:
    'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] active:bg-[var(--muted)]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const ButtonInner = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

ButtonInner.displayName = 'Button';

export const Button = memo(ButtonInner);
