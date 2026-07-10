import { useNavigate } from 'react-router-dom';
import { useMyAssessments } from '../../hooks/useCandidateAssessments';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, Play, ArrowRight,
} from 'lucide-react';
import type { AttemptResponse } from '../../types';

const ATTEMPT_STYLES: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  ASSIGNED: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Not Started' },
  IN_PROGRESS: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'In Progress' },
  COMPLETED: { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed' },
  TIMEOUT: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Timed Out' },
};

function getDeadlineStatus(deadline: string | null): { expired: boolean; label: string } {
  if (!deadline) return { expired: false, label: 'No deadline' };
  const d = new Date(deadline);
  const now = new Date();
  if (d < now) return { expired: true, label: 'Deadline passed' };
  const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { expired: false, label: days === 0 ? 'Due today' : `${days} days left` };
}

function AssessmentCard({ attempt }: { attempt: AttemptResponse }) {
  const navigate = useNavigate();
  const style = ATTEMPT_STYLES[attempt.status] || ATTEMPT_STYLES.ASSIGNED;
  const deadline = getDeadlineStatus(attempt.deadline);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover card-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">{attempt.assessmentTitle}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{style.label}
            </span>
          </div>
          {attempt.assessmentDescription && (
            <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">{attempt.assessmentDescription}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{attempt.duration} min</span>
            <span className="flex items-center gap-1"><ClipboardList className="h-3 w-3" />{attempt.totalMarks} marks</span>
            {deadline.expired ? (
              <span className="flex items-center gap-1 text-red-500"><AlertCircle className="h-3 w-3" />{deadline.label}</span>
            ) : (
              <span className="flex items-center gap-1">{deadline.label}</span>
            )}
          </div>
        </div>
      </div>

      {attempt.status === 'COMPLETED' || attempt.status === 'TIMEOUT' ? (
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${attempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
              {attempt.score}/{attempt.totalMarks} ({attempt.percentage?.toFixed(0)}%)
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${attempt.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
              {attempt.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {attempt.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/assessments/${attempt.id}/result`)}>
            View Result <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      ) : attempt.status === 'ASSIGNED' ? (
        <div className="mt-4 pt-3 border-t border-[var(--border)]">
          <Button size="sm" className="w-full" onClick={() => navigate(`/assessments/${attempt.id}/attempt`)} disabled={deadline.expired}>
            <Play className="h-3.5 w-3.5" />Start Assessment
          </Button>
        </div>
      ) : attempt.status === 'IN_PROGRESS' ? (
        <div className="mt-4 pt-3 border-t border-[var(--border)]">
          <Button size="sm" className="w-full" variant="secondary" onClick={() => navigate(`/assessments/${attempt.id}/attempt`)}>
            <Play className="h-3.5 w-3.5" />Continue Assessment
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default function AssessmentList() {
  const { data: attempts, isLoading, isError } = useMyAssessments();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h2 className="heading-2">My Assessments</h2><p className="text-xs text-[var(--muted-foreground)] mt-0.5">Upcoming and completed assessments</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <ClipboardList className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold">Failed to load assessments</p>
      </div>
    );
  }

  const pending = attempts?.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS') || [];
  const completed = attempts?.filter(a => a.status === 'COMPLETED' || a.status === 'TIMEOUT') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-2">My Assessments</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Upcoming and completed assessments</p>
      </div>

      {(!attempts || attempts.length === 0) ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <EmptyState icon={<ClipboardList className="h-7 w-7" />}
            title="No assessments assigned"
            description="When a recruiter assigns you an assessment, it will appear here." />
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Active Assessments ({pending.length})</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {pending.map(a => <AssessmentCard key={a.id} attempt={a} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Completed ({completed.length})</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {completed.map(a => <AssessmentCard key={a.id} attempt={a} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
