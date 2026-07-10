import { useParams, useNavigate } from 'react-router-dom';
import { useJob } from '../hooks/useJobs';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { ArrowLeft, Building2, MapPin, Calendar, Pencil, StickyNote, Send, Award, XCircle } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'APPLIED', label: 'Applied', icon: Send, color: 'text-amber-500', bg: 'bg-amber-500/10', line: 'bg-amber-500/30' },
  { key: 'INTERVIEW', label: 'Interview', icon: Calendar, color: 'text-violet-500', bg: 'bg-violet-500/10', line: 'bg-violet-500/30' },
  { key: 'OFFER', label: 'Offer', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', line: 'bg-emerald-500/30' },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', line: 'bg-red-500/30' },
];

function Timeline({ currentStatus }: { currentStatus: string }) {
  const statusIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div className="flex items-start justify-between px-2">
      {STATUS_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isPast = index < statusIndex;
        const isCurrent = index === statusIndex;

        const iconColor = isRejected
          ? 'text-red-500 bg-red-500/10'
          : isPast || isCurrent
            ? `${step.color} ${step.bg}`
            : 'text-[var(--muted-foreground)] bg-[var(--muted)]';

        return (
          <div key={step.key} className="flex flex-col items-center relative flex-1">
            <div className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${iconColor} ${
              isCurrent && !isRejected ? 'ring-2 ring-offset-2 ring-offset-[var(--card)] ring-amber-500 shadow-lg' : ''
            }`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <p className={`text-[11px] font-medium mt-2.5 whitespace-nowrap ${isPast || isCurrent ? step.color : 'text-[var(--muted-foreground)]'}`}>
              {step.label}
            </p>
            {index < STATUS_STEPS.length - 1 && (
              <div className={`absolute top-5 left-[calc(50%+22px)] right-0 h-0.5 -translate-y-1/2 ${
                isRejected
                  ? 'bg-red-500/20'
                  : isPast
                    ? 'bg-amber-500'
                    : 'bg-[var(--border)]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading, isError } = useJob(id ? Number(id) : null);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[var(--muted)] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-6 w-40 rounded bg-[var(--muted)] animate-pulse" />
            <div className="h-3.5 w-56 rounded bg-[var(--muted)] animate-pulse" />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-5 card-shadow">
          <div className="h-12 w-full rounded-lg bg-[var(--muted)] animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 rounded bg-[var(--muted)] animate-pulse" />
                <div className="h-5 w-32 rounded bg-[var(--muted)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Building2 className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Application not found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">The job you are looking for does not exist</p>
        </div>
        <Button onClick={() => navigate('/applications')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    APPLIED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    INTERVIEW: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    OFFER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  const statusDots: Record<string, string> = {
    APPLIED: 'bg-amber-500',
    INTERVIEW: 'bg-violet-500',
    OFFER: 'bg-emerald-500',
    REJECTED: 'bg-red-500',
  };

  const infoRows = [
    { icon: Building2, label: 'Company', value: job.company },
    { icon: MapPin, label: 'Location', value: job.location || 'Not specified' },
    { icon: Calendar, label: 'Applied', value: formatDate(job.appliedDate) },
    { icon: Calendar, label: 'Interview', value: formatDate(job.interviewDate) },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/applications')}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="heading-2">{job.company}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusColors[job.status] || statusColors.APPLIED}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusDots[job.status] || statusDots.APPLIED}`} />
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{job.jobTitle}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/applications/${id}/edit`)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow">
        <Timeline currentStatus={job.status} />
      </div>

      {/* Info grid */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
        <h3 className="text-sm font-semibold mb-4">Application Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {infoRows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] border border-[var(--border)]">
                  <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">{row.label}</p>
                  <p className="text-sm font-medium mt-0.5 truncate">{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {job.notes && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
              <StickyNote className="h-3.5 w-3.5 text-white" />
            </div>
            <h3 className="text-sm font-semibold">Notes</h3>
          </div>
          <div className="rounded-xl bg-[var(--muted)] p-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{job.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
