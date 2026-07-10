import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyInterviews } from '../../hooks/useCandidateInterviews';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  CalendarDays, Clock, Video, MapPin, Phone, Users, ArrowRight,
} from 'lucide-react';
import type { InterviewResponse } from '../../types';

const MODE_ICONS: Record<string, typeof Video> = { ONLINE: Video, OFFLINE: MapPin, PHONE: Phone };
const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  COMPLETED: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  CANCELLED: 'text-red-600 dark:text-red-400 bg-red-500/10',
  NO_SHOW: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
};

export default function InterviewList() {
  const navigate = useNavigate();
  const { data: interviews, isLoading, isError } = useMyInterviews();

  const { upcoming, past } = useMemo(() => {
    if (!interviews) return { upcoming: [], past: [] };
    const now = new Date();
    return {
      upcoming: interviews.filter(i => {
        if (i.status === 'CANCELLED') return false;
        const d = new Date(i.date + 'T' + i.startTime);
        return d >= now || i.status === 'SCHEDULED';
      }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
      past: interviews.filter(i => {
        if (i.status === 'SCHEDULED') return false;
        const d = new Date(i.date + 'T' + i.startTime);
        return d < now;
      }).sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)),
    };
  }, [interviews]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h2 className="heading-2">My Interviews</h2><p className="text-xs text-[var(--muted-foreground)] mt-0.5">Your scheduled and past interviews</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10"><CalendarDays className="h-7 w-7 text-red-500" /></div>
        <p className="text-sm font-semibold">Failed to load interviews</p>
      </div>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="space-y-6">
        <div><h2 className="heading-2">My Interviews</h2><p className="text-xs text-[var(--muted-foreground)] mt-0.5">Your scheduled and past interviews</p></div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <EmptyState icon={<CalendarDays className="h-7 w-7" />}
            title="No interviews scheduled"
            description="When a recruiter schedules an interview, it will appear here." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-2">My Interviews</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Your scheduled and past interviews</p>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Upcoming ({upcoming.length})</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map(i => <InterviewCard key={i.id} interview={i} onClick={() => navigate(`/interviews/${i.id}`)} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">Past ({past.length})</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map(i => <InterviewCard key={i.id} interview={i} onClick={() => navigate(`/interviews/${i.id}`)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewCard({ interview, onClick }: { interview: InterviewResponse; onClick: () => void }) {
  const ModeIcon = MODE_ICONS[interview.mode] || Video;
  return (
    <div onClick={onClick} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-hover card-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">{interview.candidateName}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLES[interview.status] || ''}`}>{interview.status}</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">{interview.jobTitle} &middot; {interview.companyName}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{interview.date} {interview.startTime}-{interview.endTime}</span>
            <span className="flex items-center gap-1"><ModeIcon className="h-3 w-3" />{interview.mode}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{interview.interviewerName}</span>
          </div>
        </div>
        <Button size="sm" variant="ghost"><ArrowRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
