import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminInterview, useCreateInterview, useUpdateInterview } from '../../../hooks/useAdminInterviews';
import { useAdminApplications } from '../../../hooks/useAdminApplications';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Save, Users, Mail, Calendar, Clock, Video, MapPin, Phone,
  Briefcase, Building2,
} from 'lucide-react';
import type { InterviewRequest, InterviewMode, InterviewRound } from '../../../types';

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
        <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
          {icon}
        </div>
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function AdminInterviewForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const interviewId = id ? Number(id) : null;

  const { data: interview, isLoading: loadingInterview } = useAdminInterview(interviewId);
  const { data: appsPage } = useAdminApplications({ page: 0, size: 100 });
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();

  const [form, setForm] = useState<InterviewRequest>({
    applicationId: 0,
    interviewerName: '',
    interviewerEmail: '',
    date: '',
    startTime: '',
    endTime: '',
    mode: 'ONLINE' as InterviewMode,
    meetingLink: '',
    location: '',
    round: 'TECHNICAL' as InterviewRound,
  });

  useEffect(() => {
    if (isEdit && interview) {
      setForm({
        applicationId: interview.applicationId,
        interviewerName: interview.interviewerName,
        interviewerEmail: interview.interviewerEmail,
        date: interview.date,
        startTime: interview.startTime,
        endTime: interview.endTime,
        mode: interview.mode,
        meetingLink: interview.meetingLink || '',
        location: interview.location || '',
        round: interview.round,
      });
    }
  }, [isEdit, interview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && interviewId) {
        await updateMutation.mutateAsync({ id: interviewId, data: form });
        toast('Interview updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(form);
        toast('Interview scheduled successfully', 'success');
      }
      navigate('/admin/interviews');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to save interview', 'error');
    }
  };

  if (isEdit && loadingInterview) {
    return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-64 border border-slate-200" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/interviews')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Interview' : 'Schedule Interview'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? 'Update interview details' : 'Schedule a new interview for a candidate'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {!isEdit && (
            <FormSection title="Candidate Application" icon={<Briefcase className="h-3.5 w-3.5" />}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Application <span className="text-red-500">*</span></label>
                <select
                  value={form.applicationId}
                  onChange={(e) => setForm(f => ({ ...f, applicationId: Number(e.target.value) }))}
                  className="w-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  required
                >
                  <option value={0}>Select application...</option>
                  {appsPage?.content?.map(a => (
                    <option key={a.id} value={a.id}>{a.candidateName} - {a.jobTitle}</option>
                  ))}
                </select>
              </div>
            </FormSection>
          )}

          <FormSection title="Interviewer Details" icon={<Users className="h-3.5 w-3.5" />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Interviewer Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.interviewerName}
                  onChange={(e) => setForm(f => ({ ...f, interviewerName: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Interviewer Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.interviewerEmail}
                  onChange={(e) => setForm(f => ({ ...f, interviewerEmail: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Schedule" icon={<Calendar className="h-3.5 w-3.5" />}>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Start Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">End Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Mode & Round" icon={<Video className="h-3.5 w-3.5" />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mode <span className="text-red-500">*</span></label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm(f => ({ ...f, mode: e.target.value as InterviewMode }))}
                  className="w-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  required
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="PHONE">Phone</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Round <span className="text-red-500">*</span></label>
                <select
                  value={form.round}
                  onChange={(e) => setForm(f => ({ ...f, round: e.target.value as InterviewRound }))}
                  className="w-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                  required
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="MANAGERIAL">Managerial</option>
                  <option value="HR">HR</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
            </div>

            {form.mode === 'ONLINE' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Meeting Link <span className="text-red-500">*</span></label>
                <input
                  type="url"
                  value={form.meetingLink || ''}
                  onChange={(e) => setForm(f => ({ ...f, meetingLink: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="https://meet.google.com/..."
                  required
                />
              </div>
            )}

            {form.mode === 'OFFLINE' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Location <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.location || ''}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="Office address, room number..."
                  required
                />
              </div>
            )}
          </FormSection>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate('/admin/interviews')}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              <Save className="h-4 w-4" />
              {isEdit ? 'Update Interview' : 'Schedule Interview'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
