import { useDashboard } from '../../hooks/useDashboard';
import { Card, CardContent } from '../../components/ui/Card';
import { useJobs } from '../../hooks/useJobs';
import { Briefcase, Send, Calendar, Award, XCircle, ArrowUpRight, TrendingUp, Users, Clock } from 'lucide-react';
import type { JobApplication } from '../../types';

interface StatCardConfig {
  key: keyof import('../../types').DashboardResponse;
  label: string;
  icon: typeof Briefcase;
  gradient: string;
  shadow: string;
}

const statCards: StatCardConfig[] = [
  { key: 'totalJobs', label: 'Total Applications', icon: Briefcase, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
  { key: 'applied', label: 'Applied', icon: Send, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
  { key: 'interview', label: 'Interviews', icon: Calendar, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
  { key: 'offer', label: 'Offers', icon: Award, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20' },
];

const STATUS_ICONS: Record<string, typeof Send> = {
  APPLIED: Send,
  INTERVIEW: Calendar,
  OFFER: Award,
  REJECTED: XCircle,
};

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPLIED: 'bg-amber-500',
    INTERVIEW: 'bg-violet-500',
    OFFER: 'bg-emerald-500',
    REJECTED: 'bg-red-500',
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${colors[status] || 'bg-gray-500'}`} />;
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-[var(--muted)]" />
      <div className="space-y-2">
        <div className="h-7 w-16 rounded bg-[var(--muted)]" />
        <div className="h-3 w-24 rounded bg-[var(--muted)]" />
      </div>
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 animate-pulse">
      <div className="h-5 w-32 rounded bg-[var(--muted)]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--muted)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 rounded bg-[var(--muted)]" />
              <div className="h-3 w-1/2 rounded bg-[var(--muted)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionBar({ label, value, max, color, bg }: { label: string; value: number; max: number; color: string; bg: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">{label}</span>
        <span className={`font-semibold ${color}`}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${bg}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

function RecentActivity({ jobs }: { jobs: JobApplication[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <h3 className="text-sm font-semibold">Recent Activity</h3>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]/50" />
        </div>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">No recent applications</p>
          ) : (
            jobs.slice(0, 5).map((job, idx) => {
              const Icon = STATUS_ICONS[job.status] || Send;
              return (
                <div
                  key={job.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 transition-colors hover:bg-[var(--accent)]/50 group cursor-pointer"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] group-hover:bg-[var(--secondary)] transition-colors">
                    <Icon className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{job.jobTitle}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        job.status === 'APPLIED' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        job.status === 'INTERVIEW' ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' :
                        job.status === 'OFFER' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        <StatusDot status={job.status} />
                        {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                      {job.company}
                      {job.appliedDate && <span> &middot; {new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CandidateDashboard() {
  const { data, isLoading, isError } = useDashboard();
  const { data: jobsData } = useJobs(0, 5);
  const jobs = jobsData?.content || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-4 w-28 rounded bg-[var(--muted)] animate-pulse mb-2" />
          <div className="h-8 w-52 rounded bg-[var(--muted)] animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivitySkeleton />
          <RecentActivitySkeleton />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <XCircle className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Failed to load dashboard</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(data.totalJobs, data.applied, data.interview, data.offer, data.rejected, 1);
  const offerRate = data.totalJobs > 0 ? Math.round((data.offer / data.totalJobs) * 100) : 0;
  const interviewRate = data.totalJobs > 0 ? Math.round((data.interview / data.totalJobs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero welcome */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">Good morning</p>
          <div className="flex items-center gap-3 mt-0.5">
            <h2 className="heading-2">Your Dashboard</h2>
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium border border-blue-500/20">
              Active
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span><span className="font-semibold text-emerald-500">{offerRate}%</span> offer rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-500" />
            <span><span className="font-semibold text-blue-500">{interviewRate}%</span> interview rate</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const value = data[stat.key] ?? 0;
          return (
            <div
              key={stat.key}
              className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover card-shadow"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} ${stat.shadow}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]/30 group-hover:text-[var(--muted-foreground)] transition-colors" />
              </div>
              <p className="heading-1">{value}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity jobs={jobs} />

        {/* Distribution */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold">Application Distribution</h3>
            </div>
            <div className="space-y-4">
              <DistributionBar label="Applied" value={data.applied} max={maxValue} color="text-amber-500" bg="bg-amber-500" />
              <DistributionBar label="Interview" value={data.interview} max={maxValue} color="text-violet-500" bg="bg-violet-500" />
              <DistributionBar label="Offer" value={data.offer} max={maxValue} color="text-emerald-500" bg="bg-emerald-500" />
              <DistributionBar label="Rejected" value={data.rejected} max={maxValue} color="text-red-500" bg="bg-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
