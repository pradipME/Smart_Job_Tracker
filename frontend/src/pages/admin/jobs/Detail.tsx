import { useParams, useNavigate } from 'react-router-dom';
import { useJobListing, useDeleteJobListing } from '../../../hooks/useJobListings';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useState } from 'react';
import {
  ArrowLeft, Edit, Trash2, Briefcase, Building2, MapPin, DollarSign, Clock,
  Users, ListChecks, FileText, Calendar, Globe, Tag,
} from 'lucide-react';

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

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  CLOSED: 'border-l-slate-400 bg-slate-50 text-slate-600',
  DRAFT: 'border-l-amber-500 bg-amber-50 text-amber-700',
};

export default function JobListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: job, isLoading, isFetched } = useJobListing(id ? Number(id) : null);
  const deleteMutation = useDeleteJobListing();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(Number(id));
      toast('Job deleted successfully', 'success');
      navigate('/admin/jobs');
    } catch {
      toast('Failed to delete job', 'error');
    }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isFetched && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <Briefcase className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Job not found</p>
        <Button onClick={() => navigate('/admin/jobs')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  if (!job) return null;

  const details = [
    { label: 'Company', value: job.companyName, icon: Building2 },
    { label: 'Location', value: job.location || 'Not specified', icon: MapPin },
    { label: 'Experience', value: job.experience || 'Not specified', icon: Clock },
    { label: 'Openings', value: job.openings != null ? String(job.openings) : 'Not specified', icon: Users },
    { label: 'Employment Type', value: EMPLOYMENT_LABELS[job.employmentType || ''] || 'Not specified', icon: Briefcase },
    { label: 'Work Mode', value: WORK_MODE_LABELS[job.workMode || ''] || 'Not specified', icon: Globe },
    {
      label: 'Salary Range',
      value: job.salaryMin != null && job.salaryMax != null
        ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
        : job.salaryMin != null
          ? `From $${job.salaryMin.toLocaleString()}`
          : job.salaryMax != null
            ? `Up to $${job.salaryMax.toLocaleString()}`
            : 'Not specified',
      icon: DollarSign,
    },
    { label: 'Deadline', value: job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No deadline', icon: Calendar },
  ];

  const skills = job.requiredSkills
    ? job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/jobs')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{job.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Job listing details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 border border-indigo-200 overflow-hidden">
              {job.companyLogoUrl ? (
                <img src={job.companyLogoUrl} alt={job.companyName} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{job.title}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${STATUS_BADGE[job.status] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
                  {job.status === 'OPEN' ? 'Open' : job.status === 'CLOSED' ? 'Closed' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <span>{job.companyName}</span>
                {job.employmentType && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 border-l-2 border-l-blue-500 bg-blue-50 text-blue-700">
                      {EMPLOYMENT_LABELS[job.employmentType]}
                    </span>
                  </>
                )}
                {job.workMode && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 border-l-2 border-l-violet-500 bg-violet-50 text-violet-700">
                      {WORK_MODE_LABELS[job.workMode]}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {details.map((detail) => {
            const Icon = detail.icon;
            return (
              <div key={detail.label} className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
                    <Icon className="h-3 w-3 text-slate-500" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{detail.label}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 ml-8">{detail.value}</p>
              </div>
            );
          })}
        </div>

        {skills.length > 0 && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
                <ListChecks className="h-3 w-3" />
              </div>
              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Required Skills</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 ml-8">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex h-6 w-6 items-center justify-center bg-slate-100">
              <FileText className="h-3 w-3 text-slate-500" />
            </div>
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Description</h4>
          </div>
          {job.description ? (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap ml-8">{job.description}</p>
          ) : (
            <p className="text-sm text-slate-400 italic ml-8">No description provided.</p>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Updated {new Date(job.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job Listing"
      >
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{job.title}</span> at {job.companyName}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
