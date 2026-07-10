import { useParams, useNavigate } from 'react-router-dom';
import { useApplication, useWithdraw } from '../../../hooks/useApplications';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useState } from 'react';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Building2, Briefcase, Calendar, FileText,
  Send, Clock, Users, Award, XCircle, CheckCircle,
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'APPLIED', label: 'Applied', icon: Send },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Clock },
  { key: 'ASSESSMENT_ASSIGNED', label: 'Assessment', icon: FileText },
  { key: 'ASSESSMENT_COMPLETED', label: 'Assessment', icon: FileText },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview', icon: Users },
  { key: 'HR_ROUND', label: 'HR Round', icon: Briefcase },
  { key: 'SELECTED', label: 'Selected', icon: Award },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle },
];

const TIMELINE_STEPS = [
  { key: 'APPLIED', label: 'Applied', icon: Send, color: 'text-blue-500', bg: 'bg-blue-500/10', line: 'bg-blue-500/30', dot: 'bg-blue-500' },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', line: 'bg-amber-500/30', dot: 'bg-amber-500' },
  { key: 'ASSESSMENT', label: 'Assessment', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10', line: 'bg-purple-500/30', dot: 'bg-purple-500' },
  { key: 'INTERVIEW', label: 'Interview', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10', line: 'bg-orange-500/30', dot: 'bg-orange-500' },
  { key: 'HR_ROUND', label: 'HR Round', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10', line: 'bg-orange-500/30', dot: 'bg-orange-500' },
  { key: 'SELECTED', label: 'Selected', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', line: 'bg-emerald-500/30', dot: 'bg-emerald-500' },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', line: 'bg-red-500/30', dot: 'bg-red-500' },
];

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  APPLIED: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  UNDER_REVIEW: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  ASSESSMENT_ASSIGNED: { dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  ASSESSMENT_COMPLETED: { dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  INTERVIEW_SCHEDULED: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  HR_ROUND: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  SELECTED: { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  REJECTED: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  WITHDRAWN: { dot: 'bg-gray-500', bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400' },
};

const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  ASSESSMENT_ASSIGNED: 'Assessment Assigned',
  ASSESSMENT_COMPLETED: 'Assessment Completed',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  HR_ROUND: 'HR Round',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getTimelinePosition(status: string): number {
  const terminal = ['SELECTED', 'REJECTED', 'WITHDRAWN'];
  if (terminal.includes(status)) return -1;

  if (status === 'APPLIED') return 0;
  if (status === 'UNDER_REVIEW') return 1;
  if (status === 'ASSESSMENT_ASSIGNED' || status === 'ASSESSMENT_COMPLETED') return 2;
  if (status === 'INTERVIEW_SCHEDULED') return 3;
  if (status === 'HR_ROUND') return 4;
  return -1;
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const appId = id ? Number(id) : null;
  const { data: app, isLoading, isFetched } = useApplication(appId);
  const withdrawMutation = useWithdraw();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdraw = async () => {
    if (!appId) return;
    try {
      await withdrawMutation.mutateAsync(appId);
      toast('Application withdrawn', 'success');
      navigate('/applications');
    } catch {
      toast('Failed to withdraw application', 'error');
    }
    setShowWithdrawModal(false);
  };

  if (isLoading) return <DetailSkeleton />;

  if (isFetched && !app) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Application not found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">The application you are looking for does not exist</p>
        </div>
        <Button onClick={() => navigate('/applications')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    );
  }

  if (!app) return null;

  const colors = STATUS_COLORS[app.status] || STATUS_COLORS.APPLIED;
  const isTerminal = ['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(app.status);
  const pos = getTimelinePosition(app.status);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/applications')}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="heading-2">{app.jobTitle}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {STATUS_LABELS[app.status] || app.status}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{app.companyName}</p>
          </div>
        </div>
        {!isTerminal && (
          <Button variant="destructive" onClick={() => setShowWithdrawModal(true)}>
            <XCircle className="h-4 w-4" />
            Withdraw
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow mb-6">
        <h3 className="text-sm font-semibold mb-5">Application Timeline</h3>
        <div className="flex items-start justify-between px-2">
          {TIMELINE_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isPast = pos >= 0 && index < pos;
            const isCurrent = pos >= 0 && index === pos;
            const isTerminalStep = step.key === 'SELECTED' || step.key === 'REJECTED';

            if (isTerminal && isTerminalStep) {
              const isActiveTerminal = app.status === step.key;
              const iconColor = isActiveTerminal
                ? `${step.color} ${step.bg} ring-2 ring-offset-2 ring-offset-[var(--card)] ${step.key === 'SELECTED' ? 'ring-emerald-500' : 'ring-red-500'}`
                : 'text-[var(--muted-foreground)] bg-[var(--muted)] opacity-30';

              return (
                <div key={step.key} className="flex flex-col items-center relative flex-1">
                  <div className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${iconColor}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <p className={`text-[11px] font-medium mt-2.5 whitespace-nowrap ${isActiveTerminal ? step.color : 'text-[var(--muted-foreground)] opacity-30'}`}>
                    {step.label}
                  </p>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div className="absolute top-5 left-[calc(50%+22px)] right-0 h-0.5 -translate-y-1/2 bg-[var(--border)]" />
                  )}
                </div>
              );
            }

            if (isTerminal && !isTerminalStep) {
              return (
                <div key={step.key} className="flex flex-col items-center relative flex-1">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-[11px] font-medium mt-2.5 whitespace-nowrap text-emerald-500">Complete</p>
                  {index < TIMELINE_STEPS.length - 1 && (
                    <div className="absolute top-5 left-[calc(50%+22px)] right-0 h-0.5 -translate-y-1/2 bg-emerald-500" />
                  )}
                </div>
              );
            }

            const iconColor = isCurrent
              ? `${step.color} ${step.bg} ring-2 ring-offset-2 ring-offset-[var(--card)] ${step.key === 'APPLIED' ? 'ring-blue-500' : step.key === 'UNDER_REVIEW' ? 'ring-amber-500' : 'ring-purple-500'}`
              : isPast
                ? `${step.color} ${step.bg}`
                : 'text-[var(--muted-foreground)] bg-[var(--muted)]';

            return (
              <div key={step.key} className="flex flex-col items-center relative flex-1">
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${iconColor}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className={`text-[11px] font-medium mt-2.5 whitespace-nowrap ${isPast || isCurrent ? step.color : 'text-[var(--muted-foreground)]'}`}>
                  {step.label}
                </p>
                {index < TIMELINE_STEPS.length - 1 && !(index === 4 && isTerminal) && (
                  <div className={`absolute top-5 left-[calc(50%+22px)] right-0 h-0.5 -translate-y-1/2 ${isPast ? step.line : 'bg-[var(--border)]'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
          <h3 className="text-sm font-semibold mb-4">Application Info</h3>
          <div className="space-y-3">
            <InfoRow icon={Building2} label="Company" value={app.companyName} />
            <InfoRow icon={Briefcase} label="Position" value={app.jobTitle} />
            <InfoRow icon={Calendar} label="Applied" value={formatDateTime(app.appliedAt)} />
            <InfoRow icon={Calendar} label="Last Updated" value={formatDateTime(app.updatedAt)} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
          <h3 className="text-sm font-semibold mb-4">Resume</h3>
          {app.resumeUrl ? (
            <div className="flex items-center gap-3 rounded-lg bg-[var(--muted)] p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{app.resumeUrl}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Resume file</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)] italic">No resume provided</p>
          )}
        </div>
      </div>

      {/* Cover Letter */}
      {app.coverLetter && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow mb-6">
          <h3 className="text-sm font-semibold mb-3">Cover Letter</h3>
          <div className="rounded-lg bg-[var(--muted)] p-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{app.coverLetter}</p>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <Modal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Application"
      >
        <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
          Are you sure you want to withdraw your application for <span className="font-semibold text-[var(--foreground)]">{app.jobTitle}</span> at {app.companyName}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleWithdraw} loading={withdrawMutation.isPending}>
            Withdraw
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
        <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
