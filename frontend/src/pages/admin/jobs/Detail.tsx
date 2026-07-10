import { useParams, useNavigate } from 'react-router-dom';
import { useJobListing, useDeleteJobListing } from '../../../hooks/useJobListings';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useState } from 'react';
import {
  ArrowLeft, Edit, Trash2, Briefcase, Building2, MapPin, DollarSign,
  Clock, Users, ListChecks, FileText, Calendar, Globe, Tag,
} from 'lucide-react';

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', INTERN: 'Internship', CONTRACT: 'Contract',
};
const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'On-site',
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function JobListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: job, isLoading, isFetched } = useJobListing(Number(id));
  const deleteMutation = useDeleteJobListing();
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-6 w-64" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4"><Skeleton className="h-32 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></div>
          <div className="space-y-4"><Skeleton className="h-48 rounded-lg" /><Skeleton className="h-32 rounded-lg" /></div>
        </div>
      </div>
    );
  }

  if (isFetched && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200"><Briefcase className="h-7 w-7 text-red-500" /></div>
        <p className="text-sm font-semibold text-slate-900">Job not found</p>
        <Button onClick={() => navigate('/admin/jobs')}><ArrowLeft className="h-4 w-4" />Back</Button>
      </div>
    );
  }

  if (!job) return null;

  const skills = job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/jobs')} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{job.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Job ID: {job.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}>
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Job Information</h3>
            <div className="divide-y divide-slate-100">
              <InfoRow icon={Building2} label="Company" value={job.companyName || `Company #${job.companyId}`} />
              <InfoRow icon={MapPin} label="Location" value={job.location || 'Not specified'} />
              <InfoRow icon={Briefcase} label="Employment Type" value={EMPLOYMENT_LABELS[job.employmentType || ''] || job.employmentType || 'Not specified'} />
              <InfoRow icon={Globe} label="Work Mode" value={WORK_MODE_LABELS[job.workMode || ''] || job.workMode || 'Not specified'} />
              <InfoRow icon={UserIcon} label="Experience" value={job.experience || 'Not specified'} />
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Compensation</h3>
            <div className="divide-y divide-slate-100">
              {job.salaryMin != null && (
                <InfoRow icon={DollarSign} label="Salary Range" value={`$${job.salaryMin.toLocaleString()} - $${(job.salaryMax || 0).toLocaleString()}`} />
              )}
              <InfoRow icon={Users} label="Openings" value={String(job.openings || 'Not specified')} />
            </div>
          </div>

          {/* Created/Updated */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Timeline</h3>
            <div className="divide-y divide-slate-100">
              <InfoRow icon={Calendar} label="Created" value={job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} />
              <InfoRow icon={Clock} label="Last Updated" value={job.updatedAt ? new Date(job.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} />
              {job.deadline && (
                <InfoRow icon={Calendar} label="Application Deadline" value={new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status & Skills */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Overview</h3>
            <div className="mb-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium border ${
                job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {job.status || 'Draft'}
              </span>
            </div>
            {skills.length > 0 && (
              <div>
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

          {/* Description */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Description</h3>
            </div>
            {job.description ? (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            ) : (
              <p className="text-sm text-slate-400 italic">No description provided</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/admin/applications')} className="justify-start">
                <ListChecks className="h-3.5 w-3.5" /> View Applications
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)} className="justify-start">
                <Edit className="h-3.5 w-3.5" /> Edit Listing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Job Listing">
        <p className="text-sm text-slate-500 mb-4">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{job.title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="destructive" onClick={async () => { await deleteMutation.mutateAsync(Number(id)); toast('Job deleted', 'success'); navigate('/admin/jobs'); }} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
