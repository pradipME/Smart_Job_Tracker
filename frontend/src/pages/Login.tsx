import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { Briefcase } from 'lucide-react';

export default function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background)] p-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-violet-500/[0.08] dark:from-blue-500/[0.12] dark:via-transparent dark:to-violet-500/[0.12]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl" />

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25 mb-5">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1.5">
            Sign in to your JobTrack account
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow-lg">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
