import { useParams, useNavigate } from 'react-router-dom';
import { useMyInterview } from '../../hooks/useCandidateInterviews';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  ArrowLeft, Clock, Video, MapPin, Phone, Users, Mail, Briefcase, Building2,
  Star, ExternalLink,
} from 'lucide-react';

const MODE_ICONS: Record<string, typeof Video> = { ONLINE: Video, OFFLINE: MapPin, PHONE: Phone };
const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  COMPLETED: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  CANCELLED: 'text-red-600 dark:text-red-400 bg-red-500/10',
  NO_SHOW: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
};

export default function InterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const interviewId = id ? Number(id) : null;
  const { data: interview, isLoading, isError } = useMyInterview(interviewId);

  if (isLoading) {
    return <div className="max-w-2xl mx-auto space-y-6"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div>;
  }

  if (isError || !interview) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="flex justify-center mb-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10"><MapPin className="h-7 w-7 text-red-500" /></div></div>
        <h2 className="text-lg font-bold">Interview not found</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">This interview could not be found.</p>
        <Button onClick={() => navigate('/interviews')}>Back to Interviews</Button>
      </div>
    );
  }

  const ModeIcon = MODE_ICONS[interview.mode] || Video;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/interviews')} className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />Back to Interviews
      </button>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{interview.jobTitle}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLES[interview.status] || ''}`}>
                {interview.status}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">{interview.companyName}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Interview Details</h3>
          <div className="space-y-3">
            <Row icon={<Clock className="h-4 w-4" />} label="Date" value={`${interview.date}`} />
            <Row icon={<Clock className="h-4 w-4" />} label="Time" value={`${interview.startTime} - ${interview.endTime}`} />
            <Row icon={<ModeIcon className="h-4 w-4" />} label="Mode" value={interview.mode} />
            <Row icon={<Users className="h-4 w-4" />} label="Round" value={interview.round} />
            {interview.meetingLink && (
              <Row icon={<Video className="h-4 w-4" />} label="Meeting Link"
                value={<a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-500 hover:underline"><ExternalLink className="h-3 w-3" />{interview.meetingLink}</a>} />
            )}
            {interview.location && (
              <Row icon={<MapPin className="h-4 w-4" />} label="Location" value={interview.location} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Interviewer</h3>
          <div className="space-y-3">
            <Row icon={<Users className="h-4 w-4" />} label="Name" value={interview.interviewerName} />
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={interview.interviewerEmail} />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Position</h3>
          <div className="space-y-3">
            <Row icon={<Briefcase className="h-4 w-4" />} label="Job Title" value={interview.jobTitle} />
            <Row icon={<Building2 className="h-4 w-4" />} label="Company" value={interview.companyName} />
          </div>
        </div>
      </div>

      {/* Feedback (only show after completion) */}
      {interview.status === 'COMPLETED' && interview.feedback && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Feedback</h3>
          <p className="text-sm mb-3">{interview.feedback}</p>
          {interview.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < interview.rating! ? 'text-amber-500 fill-amber-500' : 'text-[var(--muted)]'}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[var(--muted-foreground)] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
