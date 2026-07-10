import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyApplications, useWithdraw } from '../../../hooks/useApplications';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Briefcase, Building2, Calendar, Eye, XCircle, ArrowRight,
  Send, Clock, FileText, Users, Award,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  UNDER_REVIEW: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  ASSESSMENT_ASSIGNED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  ASSESSMENT_COMPLETED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  INTERVIEW_SCHEDULED: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  HR_ROUND: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
  SELECTED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  WITHDRAWN: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
};

const STATUS_DOTS: Record<string, string> = {
  APPLIED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-amber-500',
  ASSESSMENT_ASSIGNED: 'bg-purple-500',
  ASSESSMENT_COMPLETED: 'bg-purple-500',
  INTERVIEW_SCHEDULED: 'bg-orange-500',
  HR_ROUND: 'bg-orange-500',
  SELECTED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  ASSESSMENT_ASSIGNED: 'Assessment',
  ASSESSMENT_COMPLETED: 'Assessment Done',
  INTERVIEW_SCHEDULED: 'Interview',
  HR_ROUND: 'HR Round',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-56" />
            </div>
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: applications, isLoading, isError } = useMyApplications();
  const withdrawMutation = useWithdraw();
  const [withdrawTarget, setWithdrawTarget] = useState<number | null>(null);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await withdrawMutation.mutateAsync(withdrawTarget);
      toast('Application withdrawn', 'success');
    } catch {
      toast('Failed to withdraw application', 'error');
    }
    setWithdrawTarget(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="heading-2">My Applications</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Track your job applications</p>
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <Briefcase className="h-7 w-7 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--foreground)]">Failed to load applications</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Please try again</p>
          </div>
        </div>
      ) : !applications || applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
            <Send className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-[var(--foreground)]">No applications yet</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Browse jobs and apply to get started</p>
          </div>
          <Button onClick={() => navigate('/jobs')} className="mt-2">
            Browse Jobs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover card-shadow transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-[var(--border)] overflow-hidden">
                  {app.companyLogoUrl ? (
                    <img src={app.companyLogoUrl} alt={app.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6 text-[var(--muted-foreground)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">{app.companyName}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[app.status] || ''}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[app.status] || 'bg-gray-500'}`} />
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mt-0.5">{app.jobTitle}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied {formatDate(app.appliedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/20 transition-all duration-150 cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {app.status === 'APPLIED' || app.status === 'UNDER_REVIEW' ? (
                    <button
                      onClick={() => setWithdrawTarget(app.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-150 cursor-pointer"
                      title="Withdraw"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={withdrawTarget !== null}
        onClose={() => setWithdrawTarget(null)}
        title="Withdraw Application"
      >
        <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
          Are you sure you want to withdraw this application? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setWithdrawTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleWithdraw} loading={withdrawMutation.isPending}>
            Withdraw
          </Button>
        </div>
      </Modal>
    </div>
  );
}
