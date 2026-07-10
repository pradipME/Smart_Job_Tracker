import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAdminApplication,
  useUpdateStatus,
  useAddNote,
  useDeleteNote,
} from '../../../hooks/useAdminApplications';
import { adminApplicationsApi } from '../../../api/adminApplications';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Briefcase, Building2, MapPin, DollarSign, Clock, Globe,
  User, Mail, Calendar, Download, FileText, Plus, Trash2, Send,
  CheckCircle, XCircle, ChevronDown, Tag, Users, History,
} from 'lucide-react';
import type { ApplicationStatus, RecruiterNote, ApplicationHistoryEntry } from '../../../types';

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

const STATUS_STEPS: ApplicationStatus[] = [
  'APPLIED', 'UNDER_REVIEW', 'ASSESSMENT_ASSIGNED', 'ASSESSMENT_COMPLETED',
  'INTERVIEW_SCHEDULED', 'HR_ROUND',
];

const TERMINAL_STATUSES: ApplicationStatus[] = ['SELECTED', 'REJECTED'];

const STATUS_BADGE: Record<string, string> = {
  APPLIED: 'border-l-indigo-500 bg-indigo-50 text-indigo-700',
  UNDER_REVIEW: 'border-l-amber-500 bg-amber-50 text-amber-700',
  ASSESSMENT_ASSIGNED: 'border-l-violet-500 bg-violet-50 text-violet-700',
  ASSESSMENT_COMPLETED: 'border-l-violet-500 bg-violet-50 text-violet-700',
  INTERVIEW_SCHEDULED: 'border-l-cyan-500 bg-cyan-50 text-cyan-700',
  HR_ROUND: 'border-l-teal-500 bg-teal-50 text-teal-700',
  SELECTED: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-l-red-500 bg-red-50 text-red-700',
  WITHDRAWN: 'border-l-slate-400 bg-slate-50 text-slate-600',
};

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-indigo-500',
  UNDER_REVIEW: 'bg-amber-500',
  ASSESSMENT_ASSIGNED: 'bg-violet-500',
  ASSESSMENT_COMPLETED: 'bg-purple-500',
  INTERVIEW_SCHEDULED: 'bg-cyan-500',
  HR_ROUND: 'bg-teal-500',
  SELECTED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-400',
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERN: 'Internship',
  CONTRACT: 'Contract',
};

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

function formatSalary(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return 'Not specified';
}

function SidebarRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-4">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-slate-100">
        <Icon className="h-3 w-3 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm text-slate-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-5 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5 items-start">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 border border-slate-200" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 border border-slate-200" />
          <Skeleton className="h-64 border border-slate-200" />
        </div>
      </div>
    </div>
  );
}

function getAvailableTransitions(current: ApplicationStatus): ApplicationStatus[] {
  const idx = STATUS_STEPS.indexOf(current);
  if (current === 'SELECTED' || current === 'REJECTED' || current === 'WITHDRAWN') return [];
  if (idx >= 0) {
    const nextIdx = idx + 1;
    if (nextIdx < STATUS_STEPS.length) {
      return [STATUS_STEPS[nextIdx]];
    }
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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);

  if (isLoading) return <DetailSkeleton />;

  if (isFetched && !app) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <Briefcase className="h-6 w-6 text-red-500" />
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

  const resumeDownloadUrl = adminApplicationsApi.resumeUrl(app.id);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/applications')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{app.candidateName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Application for {app.jobTitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5 items-start">
        {/* Main Column */}
        <div className="space-y-5">
          {/* Candidate Profile Card */}
          <div className="bg-white border border-slate-200">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 text-base font-bold">
                  {app.candidateName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-base font-bold text-slate-900">{app.candidateName}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${STATUS_BADGE[app.status] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {app.candidateEmail}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {app.jobTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                <History className="h-3 w-3 text-slate-500" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Application Timeline</h3>
            </div>
            <div className="p-4">
              {app.history.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No timeline entries yet.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  <div className="space-y-4">
                    {app.history.map((entry: ApplicationHistoryEntry) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="relative flex flex-col items-center shrink-0">
                          <div className={`h-6 w-6 border-2 flex items-center justify-center ${
                            entry.toStatus === 'SELECTED' ? 'border-emerald-500 bg-emerald-50' :
                            entry.toStatus === 'REJECTED' ? 'border-red-500 bg-red-50' :
                            'border-indigo-500 bg-indigo-50'
                          }`}>
                            <div className={`h-2 w-2 ${
                              entry.toStatus === 'SELECTED' ? 'bg-emerald-500' :
                              entry.toStatus === 'REJECTED' ? 'bg-red-500' :
                              'bg-indigo-500'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pb-2">
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
                            <span className="text-xs text-slate-500">
                              by {entry.changedBy}
                            </span>
                          </div>
                          {entry.comment && (
                            <p className="text-xs text-slate-500 mt-1 italic">
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
          <div className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                <FileText className="h-3 w-3 text-slate-500" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Resume</h3>
              <div className="ml-auto">
                <a
                  href={resumeDownloadUrl}
                  download
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </a>
              </div>
            </div>
            <div className="p-4">
              <div className="border border-slate-200 bg-slate-50 overflow-hidden" style={{ height: '500px' }}>
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
            <div className="bg-white border border-slate-200">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
                <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                  <FileText className="h-3 w-3 text-slate-500" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Cover Letter</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {app.coverLetter}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status Management */}
          <div className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
                <CheckCircle className="h-3 w-3" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Status Management</h3>
            </div>
            <div className="p-4">
              {isTerminal ? (
                <div className="text-center py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border ${
                    app.status === 'SELECTED' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                    app.status === 'REJECTED' ? 'border-red-500 bg-red-50 text-red-700' :
                    'border-slate-200 bg-slate-100 text-slate-600'
                  }`}>
                    {app.status === 'SELECTED' ? <CheckCircle className="h-3.5 w-3.5" /> :
                     app.status === 'REJECTED' ? <XCircle className="h-3.5 w-3.5" /> :
                     <Clock className="h-3.5 w-3.5" />}
                    {STATUS_LABELS[app.status]}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">This application is in its final state</p>
                </div>
              ) : availableTransitions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No status transitions available</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    Move from <span className="font-medium text-slate-900">{STATUS_LABELS[app.status]}</span> to:
                  </p>
                  {availableTransitions.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => {
                        setSelectedStatus(nextStatus);
                        setStatusComment('');
                        setShowStatusModal(true);
                      }}
                      className="w-full flex items-center justify-between border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 ${STATUS_COLORS[nextStatus] || 'bg-gray-400'}`} />
                        {STATUS_LABELS[nextStatus]}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recruiter Notes */}
          <div className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                <FileText className="h-3 w-3 text-slate-500" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Recruiter Notes</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2 mb-3">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Add a note..."
                  className="flex w-full border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
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

              {app.notes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No notes yet.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {app.notes.map((note: RecruiterNote) => (
                    <div key={note.id} className="border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <button
                          onClick={() => setDeleteNoteId(note.id)}
                          className="shrink-0 flex h-6 w-6 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400">
                          {note.createdBy}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                <Briefcase className="h-3 w-3 text-slate-500" />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Job Information</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <SidebarRow icon={Building2} label="Company" value={app.companyName} />
              <SidebarRow icon={MapPin} label="Location" value={app.jobLocation || 'Not specified'} />
              <SidebarRow icon={DollarSign} label="Salary" value={formatSalary(app.jobSalaryMin, app.jobSalaryMax)} />
              <SidebarRow icon={Briefcase} label="Type" value={app.jobEmploymentType ? (EMPLOYMENT_LABELS[app.jobEmploymentType] || app.jobEmploymentType) : 'Not specified'} />
              <SidebarRow icon={Globe} label="Work Mode" value={app.jobWorkMode ? (WORK_MODE_LABELS[app.jobWorkMode] || app.jobWorkMode) : 'Not specified'} />
              <SidebarRow icon={Users} label="Experience" value={app.jobExperience || 'Not specified'} />
            </div>
            {skills.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Progress */}
          <div className="bg-white border border-slate-200">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                <TrendingUpIcon />
              </div>
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Status Progress</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-1.5">
                {STATUS_STEPS.map((step) => {
                  const stepIdx = STATUS_STEPS.indexOf(step);
                  const currentIdx = STATUS_STEPS.indexOf(app.status as ApplicationStatus);
                  const isRejected = app.status === 'REJECTED';
                  const isSelected = app.status === 'SELECTED';
                  const isWithdrawn = app.status === 'WITHDRAWN';
                  const isCompleted = stepIdx <= currentIdx && !isRejected;
                  const isCurrent = step === app.status;
                  const isActive = isCompleted || isCurrent;

                  let dotColor = 'bg-slate-300';
                  let lineColor = 'bg-slate-200';
                  let textColor = 'text-slate-500';

                  if (isRejected && stepIdx <= currentIdx) {
                    dotColor = 'bg-red-500';
                    lineColor = 'bg-red-500';
                    textColor = 'text-red-500';
                  } else if (isSelected && isCompleted) {
                    dotColor = 'bg-emerald-500';
                    lineColor = 'bg-emerald-500';
                    textColor = 'text-emerald-500';
                  } else if (isActive) {
                    dotColor = 'bg-indigo-600';
                    lineColor = 'bg-indigo-600';
                    textColor = 'text-slate-900';
                  }

                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div className={`h-2.5 w-2.5 ${dotColor} transition-colors`} />
                        {stepIdx < STATUS_STEPS.length - 1 && (
                          <div className={`h-4 w-0.5 ${lineColor} transition-colors`} />
                        )}
                      </div>
                      <span className={`text-xs ${textColor} transition-colors`}>
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 ${app.status === 'SELECTED' ? 'bg-emerald-500' : app.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-300'}`} />
                  </div>
                  <div className="flex gap-3">
                    <span className={`text-xs ${app.status === 'SELECTED' ? 'text-emerald-500 font-medium' : 'text-slate-500'}`}>
                      Selected
                    </span>
                    <span className={`text-xs ${app.status === 'REJECTED' ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                      Rejected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => { setShowStatusModal(false); setSelectedStatus(''); setStatusComment(''); }}
        title="Update Application Status"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Move <span className="font-semibold text-slate-900">{app.candidateName}</span> from{' '}
            <span className="font-medium text-slate-700">{STATUS_LABELS[app.status]}</span> to{' '}
            <span className="font-medium text-slate-700">{selectedStatus ? STATUS_LABELS[selectedStatus] : ''}</span>
          </p>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Comment (optional)</label>
            <textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="flex w-full border border-slate-200 bg-white px-3 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
              placeholder="Add a note about this status change..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setShowStatusModal(false); setSelectedStatus(''); setStatusComment(''); }}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} loading={updateStatus.isPending}>
              <Send className="h-4 w-4" />
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Note Confirmation */}
      <Modal
        open={deleteNoteId !== null}
        onClose={() => setDeleteNoteId(null)}
        title="Delete Note"
      >
        <p className="text-sm text-slate-500 mb-4">
          Are you sure you want to delete this note? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteNoteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteNote} loading={deleteNote.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
