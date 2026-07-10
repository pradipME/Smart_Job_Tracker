import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminInterview, useUpdateInterviewStatus, useAddInterviewFeedback } from '../../../hooks/useAdminInterviews';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Clock, Video, MapPin, Phone, Users, Mail, Briefcase, Building2,
  Star, Edit3, CheckCircle, XCircle,
} from 'lucide-react';
import type { InterviewStatus } from '../../../types';

const MODE_ICONS: Record<string, typeof Video> = { ONLINE: Video, OFFLINE: MapPin, PHONE: Phone };

const STATUS_BADGE: Record<string, string> = {
  SCHEDULED: 'border-l-blue-500 bg-blue-50 text-blue-700',
  COMPLETED: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  CANCELLED: 'border-l-red-500 bg-red-50 text-red-700',
  NO_SHOW: 'border-l-amber-500 bg-amber-50 text-amber-700',
};

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function getReminderLabel(dateStr: string): { label: string; color: string } | null {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr === today) return { label: 'Today', color: 'bg-indigo-50 text-indigo-600' };
  if (dateStr === tomorrowStr) return { label: 'Tomorrow', color: 'bg-amber-50 text-amber-600' };

  const d = new Date(dateStr);
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays <= 3) return { label: `Starts in ${diffDays} days`, color: 'bg-amber-50 text-amber-600' };
  if (diffDays <= 0) return { label: 'Past', color: 'bg-red-50 text-red-600' };
  return null;
}

export default function AdminInterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const interviewId = id ? Number(id) : null;

  const { data: interview, isLoading } = useAdminInterview(interviewId);
  const updateStatusMutation = useUpdateInterviewStatus();
  const addFeedbackMutation = useAddInterviewFeedback();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [statusAction, setStatusAction] = useState<InterviewStatus | ''>('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const handleStatusUpdate = async () => {
    if (!interviewId || !statusAction) return;
    try {
      await updateStatusMutation.mutateAsync({ id: interviewId, data: { status: statusAction } });
      toast(`Interview marked as ${statusAction}`, 'success');
      setShowStatusModal(false);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!interviewId) return;
    try {
      await addFeedbackMutation.mutateAsync({
        id: interviewId,
        data: { feedback, rating, status: 'COMPLETED' as InterviewStatus },
      });
      toast('Feedback submitted successfully', 'success');
      setShowFeedbackModal(false);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to submit feedback', 'error');
    }
  };

  if (isLoading) {
    return <div className="max-w-3xl mx-auto space-y-4"><Skeleton className="h-48 border border-slate-200" /><Skeleton className="h-48 border border-slate-200" /></div>;
  }

  if (!interview) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Interview not found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">This interview could not be loaded.</p>
        <Button onClick={() => navigate('/admin/interviews')}>Back to Interviews</Button>
      </div>
    );
  }

  const ModeIcon = MODE_ICONS[interview.mode] || Video;
  const reminder = getReminderLabel(interview.date);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/interviews')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{interview.candidateName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{interview.jobTitle} &middot; {interview.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {interview.status === 'SCHEDULED' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/interviews/${id}/edit`)}>
                <Edit3 className="h-4 w-4" />Edit
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setStatusAction('COMPLETED'); setShowStatusModal(true); }}>
                <CheckCircle className="h-4 w-4" />Complete
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { setStatusAction('CANCELLED'); setShowStatusModal(true); }}>
                <XCircle className="h-4 w-4" />Cancel
              </Button>
            </>
          )}
          {(interview.status === 'SCHEDULED' || interview.status === 'COMPLETED') && (
            <Button size="sm" onClick={() => setShowFeedbackModal(true)}>
              <Star className="h-4 w-4" />Feedback
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${STATUS_BADGE[interview.status] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
          {interview.status}
        </span>
        {reminder && (
          <span className={`text-[11px] px-2 py-0.5 font-medium ${reminder.color}`}>{reminder.label}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
              <Clock className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Interview Details</h3>
          </div>
          <div className="p-4 space-y-3">
            <DetailRow icon={<Clock className="h-4 w-4" />} label="Date & Time" value={`${interview.date} ${interview.startTime} - ${interview.endTime}`} />
            <DetailRow icon={<ModeIcon className="h-4 w-4" />} label="Mode" value={interview.mode} />
            <DetailRow icon={<Users className="h-4 w-4" />} label="Round" value={interview.round} />
            {interview.meetingLink && (
              <DetailRow icon={<Video className="h-4 w-4" />} label="Meeting Link" value={
                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{interview.meetingLink}</a>
              } />
            )}
            {interview.location && (
              <DetailRow icon={<MapPin className="h-4 w-4" />} label="Location" value={interview.location} />
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
              <Users className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Interviewer</h3>
          </div>
          <div className="p-4 space-y-3">
            <DetailRow icon={<Users className="h-4 w-4" />} label="Name" value={interview.interviewerName} />
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={interview.interviewerEmail} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
              <Briefcase className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Candidate</h3>
          </div>
          <div className="p-4 space-y-3">
            <DetailRow icon={<Users className="h-4 w-4" />} label="Name" value={interview.candidateName} />
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={interview.candidateEmail} />
          </div>
        </div>
        <div className="bg-white border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
              <Building2 className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Position</h3>
          </div>
          <div className="p-4 space-y-3">
            <DetailRow icon={<Briefcase className="h-4 w-4" />} label="Job Title" value={interview.jobTitle} />
            <DetailRow icon={<Building2 className="h-4 w-4" />} label="Company" value={interview.companyName} />
          </div>
        </div>
      </div>

      {interview.feedback && (
        <div className="bg-white border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
              <Star className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Feedback</h3>
          </div>
          <p className="text-sm text-slate-700 mb-2">{interview.feedback}</p>
          {interview.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < interview.rating! ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Interview Status">
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to mark this interview as <strong className="text-slate-900">{statusAction}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} loading={updateStatusMutation.isPending}
            variant={statusAction === 'CANCELLED' ? 'destructive' : 'primary'}>
            Confirm
          </Button>
        </div>
      </Modal>

      <Modal open={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Add Feedback">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)}
                  className="p-1 cursor-pointer transition-all hover:scale-110">
                  <Star className={`h-6 w-6 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Write your feedback..."
              className="flex w-full border border-slate-200 bg-white px-3 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} loading={addFeedbackMutation.isPending}>Submit Feedback</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
