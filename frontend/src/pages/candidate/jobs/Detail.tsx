import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOpenJob } from '../../../hooks/useCandidateJobs';
import { useCompany } from '../../../hooks/useCompanies';
import { useMyApplicationForJob, useApply } from '../../../hooks/useApplications';
import { resumeApi } from '../../../api/resume';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Building2, MapPin, DollarSign, Clock, Calendar, Briefcase, Globe,
  Users, Tag, FileText, ExternalLink, Send, CheckCircle, Upload, X, Loader2,
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

function formatSalary(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return 'Not specified';
}

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CandidateJobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const jobId = id ? Number(id) : null;
  const { data: job, isLoading, isFetched } = useOpenJob(jobId);
  const { data: company } = useCompany(job?.companyId ?? null);
  const { data: existingApp } = useMyApplicationForJob(jobId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const applyMutation = useApply();

  const hasApplied = !!existingApp;

  const resetModal = () => {
    setShowApplyModal(false);
    setSelectedFile(null);
    setCoverLetter('');
  };

  const handleApply = async () => {
    if (!jobId || !selectedFile) return;
    setIsSubmitting(true);
    try {
      const uploadRes = await resumeApi.upload(selectedFile);
      await applyMutation.mutateAsync({
        jobId,
        resumeUrl: uploadRes.data.fileName,
        coverLetter: coverLetter || undefined,
      });
      toast('Application submitted successfully!', 'success');
      resetModal();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast('You have already applied for this position', 'error');
      } else {
        toast('Failed to submit application. Please try again.', 'error');
      }
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <DetailSkeleton />;

  if (isFetched && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Job not found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">This position may no longer be available</p>
        </div>
        <Button onClick={() => navigate('/jobs')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Browse Jobs
        </Button>
      </div>
    );
  }

  if (!job) return null;

  const skills = job.requiredSkills
    ? job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden card-shadow">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-[var(--border)] overflow-hidden">
                  {job.companyLogoUrl ? (
                    <img src={job.companyLogoUrl} alt={job.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-[var(--muted-foreground)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight">{job.title}</h1>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{job.companyName}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {job.employmentType && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 text-xs font-medium">
                        {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}
                      </span>
                    )}
                    {job.workMode && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2.5 py-0.5 text-xs font-medium">
                        {WORK_MODE_LABELS[job.workMode] || job.workMode}
                      </span>
                    )}
                    {job.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)]">
                  <FileText className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                </div>
                <h2 className="text-sm font-semibold">Job Description</h2>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)]">
                  <Tag className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                </div>
                <h2 className="text-sm font-semibold">Required Skills</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-lg bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Overview */}
          {company && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)]">
                  <Building2 className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                </div>
                <h2 className="text-sm font-semibold">Company Overview</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {company.industry && (
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Industry</p>
                      <p className="text-sm font-medium">{company.industry}</p>
                    </div>
                  </div>
                )}
                {company.companySize && (
                  <div className="flex items-start gap-2.5">
                    <Users className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Company Size</p>
                      <p className="text-sm font-medium">{company.companySize}</p>
                    </div>
                  </div>
                )}
                {company.location && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Location</p>
                      <p className="text-sm font-medium">{company.location}</p>
                    </div>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-start gap-2.5">
                    <Globe className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Website</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-500 hover:underline flex items-center gap-1">
                        {new URL(company.website).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {company.description && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{company.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Key details */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden card-shadow">
              <div className="divide-y divide-[var(--border)]">
                <SidebarRow icon={DollarSign} label="Salary" value={formatSalary(job.salaryMin, job.salaryMax)} highlight />
                <SidebarRow icon={MapPin} label="Location" value={job.location || 'Not specified'} />
                {job.deadline && (
                  <SidebarRow icon={Calendar} label="Deadline" value={new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                )}
                {job.employmentType && (
                  <SidebarRow icon={Briefcase} label="Job Type" value={EMPLOYMENT_LABELS[job.employmentType] || job.employmentType} />
                )}
                {job.workMode && (
                  <SidebarRow icon={Globe} label="Work Mode" value={WORK_MODE_LABELS[job.workMode] || job.workMode} />
                )}
                <SidebarRow icon={Users} label="Openings" value={job.openings != null ? String(job.openings) : 'Not specified'} />
                {job.experience && (
                  <SidebarRow icon={Clock} label="Experience" value={job.experience} />
                )}
              </div>
            </div>

            {/* Apply Now button */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 card-shadow">
              {hasApplied ? (
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Applied</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    You have already applied for this position
                  </p>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setShowApplyModal(true)}>
                  <Send className="h-4 w-4" />
                  Apply Now
                </Button>
              )}
            </div>

            {/* Posted / Updated */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-xs text-[var(--muted-foreground)] space-y-1.5">
                <p>
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p>
                  Updated {new Date(job.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        open={showApplyModal}
        onClose={resetModal}
        title="Apply for Position"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Applying for <span className="font-semibold text-[var(--foreground)]">{job.title}</span> at {job.companyName}
          </p>

          {/* Resume upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Resume <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
                selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-[var(--border)] hover:border-blue-500/50 hover:bg-[var(--accent)]/50'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mx-auto">
                    <FileText className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] mx-auto">
                    <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload your resume</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">PDF up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      toast('Only PDF files are allowed', 'error');
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast('File size must be under 5MB', 'error');
                      return;
                    }
                    setSelectedFile(file);
                  }
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          {/* Cover letter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={5}
              maxLength={3000}
              className="flex w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 resize-none"
              placeholder="Tell the employer why you're a great fit..."
            />
            <p className="text-xs text-[var(--muted-foreground)] text-right">
              {coverLetter.length}/3000
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={resetModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedFile || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SidebarRow({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
          <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
          <p className={`text-sm font-medium mt-0.5 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
