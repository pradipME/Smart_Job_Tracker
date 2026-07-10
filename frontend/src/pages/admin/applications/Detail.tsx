import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAdminApplication, useUpdateStatus, useAddNote, useDeleteNote,
} from '../../../hooks/useAdminApplications';
import { adminApplicationsApi } from '../../../api/adminApplications';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Briefcase, Building2, MapPin, DollarSign, Clock, Globe,
  User, Mail, Calendar, Download, FileText, Plus, Trash2, Send,
  CheckCircle, XCircle, ChevronDown, Tag, Users, History, Star, Sparkles,
} from 'lucide-react';
import type { ApplicationStatus, RecruiterNote, ApplicationHistoryEntry } from '../../../types';

const STATUS_LABELS: Record<string, string> = {
  APPLIED: 'Applied', UNDER_REVIEW: 'Under Review',
  ASSESSMENT_ASSIGNED: 'Assessment Assigned', ASSESSMENT_COMPLETED: 'Assessment Completed',
  INTERVIEW_SCHEDULED: 'Interview Scheduled', HR_ROUND: 'HR Round',
  SELECTED: 'Selected', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
};

const STATUS_STEPS: ApplicationStatus[] = [
  'APPLIED', 'UNDER_REVIEW', 'ASSESSMENT_ASSIGNED', 'ASSESSMENT_COMPLETED',
  'INTERVIEW_SCHEDULED', 'HR_ROUND',
];

const TERMINAL_STATUSES: ApplicationStatus[] = ['SELECTED', 'REJECTED'];

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-blue-500', UNDER_REVIEW: 'bg-amber-500',
  ASSESSMENT_ASSIGNED: 'bg-violet-500', ASSESSMENT_COMPLETED: 'bg-purple-500',
  INTERVIEW_SCHEDULED: 'bg-cyan-500', HR_ROUND: 'bg-teal-500',
  SELECTED: 'bg-emerald-500', REJECTED: 'bg-red-500', WITHDRAWN: 'bg-slate-400',
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time',
  INTERN: 'Internship', CONTRACT: 'Contract',
};

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'On-site',
};

function formatSalary(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return 'Not specified';
}

function getAvailableTransitions(current: ApplicationStatus): ApplicationStatus[] {
  const idx = STATUS_STEPS.indexOf(current);
  if (current === 'SELECTED' || current === 'REJECTED' || current === 'WITHDRAWN') return [];
  if (idx >= 0) {
    const nextIdx = idx + 1;
    if (nextIdx < STATUS_STEPS.length) return [STATUS_STEPS[nextIdx]];
    return TERMINAL_STATUSES;
  }
  return [];
}

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const appId = id ? Number(id) : null;
  const { data: app, isLoading, isFetched } = useAdminApplication(appId);
  const updateStatus = useUpdateStatus();
  const addNote = useAddNote();
  const deleteNote = useDeleteNote();

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [statusComment, setStatusComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-6 w-64" />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isFetched && !app) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Application not found</p>
        <Button onClick={() => navigate('/admin/applications')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    );
  }

  if (!app) return null;

  const availableTransitions = getAvailableTransitions(app.status as ApplicationStatus);
  const skills = app.jobRequiredSkills
    ? app.jobRequiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const isTerminal = app.status === 'SELECTED' || app.status === 'REJECTED' || app.status === 'WITHDRAWN';
  const resumeDownloadUrl = adminApplicationsApi.resumeUrl(app.id);

  const handleStatusUpdate = async () => {
    if (!appId || !selectedStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: appId,
        data: { status: selectedStatus as ApplicationStatus, comment: statusComment || undefined },
      });
      toast(`Status updated to ${STATUS_LABELS[selectedStatus]}`, 'success');
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusComment('');
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const handleAddNote = async () => {
    if (!appId || !newNoteContent.trim()) return;
    try {
      await addNote.mutateAsync({ id: appId, data: { content: newNoteContent.trim() } });
      toast('Note added', 'success');
      setNewNoteContent('');
    } catch {
      toast('Failed to add note', 'error');
    }
  };

  const handleDeleteNote = async () => {
    if (!appId || deleteNoteId === null) return;
    try {
      await deleteNote.mutateAsync({ id: appId, noteId: deleteNoteId });
      toast('Note deleted', 'success');
    } catch {
      toast('Failed to delete note', 'error');
    }
    setDeleteNoteId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/applications')}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{app.candidateName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Application for {app.jobTitle} at {app.companyName}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px] items-start">
        {/* --- Main Column --- */}
        <div className="space-y-6">
          {/* Candidate Profile Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-xl font-bold">
                {app.candidateName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h2 className="text-lg font-bold text-slate-900">{app.candidateName}</h2>
                  <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border ${
                    app.status === 'SELECTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{app.candidateEmail}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{app.jobTitle}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <History className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Application Timeline</h3>
              </div>
            </div>
            <div className="px-5 py-3.5">
              {app.history.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No timeline entries yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200 rounded" />
                  <div className="space-y-5">
                    {app.history.map((entry: ApplicationHistoryEntry) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="relative flex flex-col items-center shrink-0">
                          <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center ${
                            entry.toStatus === 'SELECTED' ? 'border-emerald-500 bg-emerald-50' :
                            entry.toStatus === 'REJECTED' || entry.toStatus === 'WITHDRAWN' ? 'border-red-500 bg-red-50' :
                            'border-blue-500 bg-blue-50'
                          }`}>
                            <div className={`h-2.5 w-2.5 rounded-full ${
                              entry.toStatus === 'SELECTED' ? 'bg-emerald-500' :
                              entry.toStatus === 'REJECTED' || entry.toStatus === 'WITHDRAWN' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-900">
                              {entry.fromStatus
                                ? `${STATUS_LABELS[entry.fromStatus] || entry.fromStatus} \u2192 ${STATUS_LABELS[entry.toStatus] || entry.toStatus}`
                                : `${STATUS_LABELS[entry.toStatus] || entry.toStatus}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-500">
                              {new Date(entry.changedAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            <span className="text-xs text-slate-500">by {entry.changedBy}</span>
                          </div>
                          {entry.comment && (
                            <p className="text-xs text-slate-500 mt-1 italic bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                              &ldquo;{entry.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resume Preview */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Resume</h3>
              </div>
              <a
                href={resumeDownloadUrl}
                download
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </a>
            </div>
            <div className="p-5">
              <div className="border border-slate-200 bg-slate-50 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <iframe
                  src={resumeDownloadUrl}
                  className="w-full h-full"
                  title="Resume Preview"
                />
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {app.coverLetter && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Cover Letter</h3>
                </div>
              </div>
              <div className="px-5 py-3.5">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {app.coverLetter}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Sidebar --- */}
        <div className="space-y-6">
          {/* Status Management Panel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Status</h3>
              </div>
            </div>
            <div className="px-5 py-3.5">
              {isTerminal ? (
                <div className="text-center py-4">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border ${
                    app.status === 'SELECTED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                    app.status === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-700' :
                    'border-slate-200 bg-slate-100 text-slate-600'
                  }`}>
                    {app.status === 'SELECTED' ? <CheckCircle className="h-4 w-4" /> :
                     app.status === 'REJECTED' ? <XCircle className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                    {STATUS_LABELS[app.status]}
                  </span>
                  <p className="text-xs text-slate-500 mt-3">This application is in its final state</p>
                </div>
              ) : availableTransitions.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No status transitions available</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">
                    Current: <span className="font-semibold text-slate-900">{STATUS_LABELS[app.status]}</span>
                  </p>
                  <div className="flex flex-col gap-2">
                    {availableTransitions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        onClick={() => {
                          setSelectedStatus(nextStatus);
                          setStatusComment('');
                          setShowStatusModal(true);
                        }}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[nextStatus] || 'bg-slate-400'}`} />
                          Move to {STATUS_LABELS[nextStatus]}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:rotate-180 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recruiter Notes */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Star className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Recruiter Notes</h3>
              </div>
            </div>
            <div className="px-5 py-3.5 space-y-4">
              <div className="space-y-2">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Add a note..."
                  className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  maxLength={2000}
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim() || addNote.isPending}
                  loading={addNote.isPending}
                  className="w-full"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Note
                </Button>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {app.notes.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">No notes yet.</p>
                ) : app.notes.map((note: RecruiterNote) => (
                  <div key={note.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      <button
                        onClick={() => setDeleteNoteId(note.id)}
                        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{note.createdBy}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">AI Summary</h3>
              </div>
            </div>
            <div className="px-5 py-3.5 text-sm text-slate-500">
              <p>AI-powered insights are available in the AI Intelligence dashboard.</p>
              <button
                onClick={() => navigate('/admin/ai')}
                className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-flex items-center gap-1"
              >
                Open AI Dashboard <ArrowLeft className="h-3 w-3 rotate-180" />
              </button>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Job Details</h3>
              </div>
            </div>
            <div className="px-5 py-3 divide-y divide-slate-100">
              <InfoRow icon={Building2} label="Company" value={app.companyName} />
              <InfoRow icon={MapPin} label="Location" value={app.jobLocation || 'Not specified'} />
              <InfoRow icon={DollarSign} label="Salary" value={formatSalary(app.jobSalaryMin, app.jobSalaryMax)} />
              <InfoRow icon={Briefcase} label="Type" value={app.jobEmploymentType ? (EMPLOYMENT_LABELS[app.jobEmploymentType] || app.jobEmploymentType) : 'Not specified'} />
              <InfoRow icon={Globe} label="Work Mode" value={app.jobWorkMode ? (WORK_MODE_LABELS[app.jobWorkMode] || app.jobWorkMode) : 'Not specified'} />
              <InfoRow icon={User} label="Experience" value={app.jobExperience || 'Not specified'} />
            </div>
            {skills.length > 0 && (
              <div className="px-5 py-3.5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal open={showStatusModal} onClose={() => { setShowStatusModal(false); setSelectedStatus(''); setStatusComment(''); }} title="Update Application Status">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Move <span className="font-semibold text-slate-900">{app.candidateName}</span> from{' '}
            <span className="font-medium text-slate-700">{STATUS_LABELS[app.status]}</span> to{' '}
            <span className="font-medium text-blue-700">{selectedStatus ? STATUS_LABELS[selectedStatus] : ''}</span>
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Comment (optional)</label>
            <textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              rows={3} maxLength={500}
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              placeholder="Add a note about this status change..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setShowStatusModal(false); setSelectedStatus(''); setStatusComment(''); }}>Cancel</Button>
            <Button onClick={handleStatusUpdate} loading={updateStatus.isPending}><Send className="h-4 w-4" />Update Status</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Note Modal */}
      <Modal open={deleteNoteId !== null} onClose={() => setDeleteNoteId(null)} title="Delete Note">
        <p className="text-sm text-slate-500 mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteNoteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteNote} loading={deleteNote.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
