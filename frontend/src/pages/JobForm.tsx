import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJob, useCreateJob, useUpdateJob } from '../hooks/useJobs';
import { jobSchema, type JobFormData } from '../lib/validations';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, Save, Building2, Briefcase, Calendar, StickyNote } from 'lucide-react';

const statusOptions = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function JobForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();
  const { data: job, isLoading: jobLoading, isFetched } = useJob(isEdit ? Number(id) : null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: '',
      jobTitle: '',
      location: '',
      status: 'APPLIED',
      appliedDate: '',
      interviewDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (job && isEdit) {
      reset({
        company: job.company,
        jobTitle: job.jobTitle,
        location: job.location || '',
        status: job.status,
        appliedDate: job.appliedDate || '',
        interviewDate: job.interviewDate || '',
        notes: job.notes || '',
      });
    }
  }, [job, isEdit, reset]);

  const onSubmit = async (data: JobFormData) => {
    const payload = {
      company: data.company,
      jobTitle: data.jobTitle,
      location: data.location || undefined,
      status: data.status,
      appliedDate: data.appliedDate || undefined,
      interviewDate: data.interviewDate || null,
      notes: data.notes || undefined,
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast('Job updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Job added successfully', 'success');
      }
      navigate('/applications');
    } catch {
      toast(isEdit ? 'Failed to update job' : 'Failed to add job', 'error');
    }
  };

  if (isEdit && jobLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isEdit && isFetched && !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Application not found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">The job you are looking for does not exist</p>
        </div>
        <Button onClick={() => navigate('/applications')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/applications')}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="heading-2">{isEdit ? 'Edit Application' : 'New Application'}</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {isEdit ? 'Update the details of your job application' : 'Track a new job application'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 card-shadow">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)] pb-3 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold">Company Details</h3>
              </div>

              <Input
                label="Company"
                placeholder="e.g. Google, Stripe, Linear"
                error={errors.company?.message}
                {...register('company')}
              />
              <Input
                label="Job Title"
                placeholder="e.g. Software Engineer"
                error={errors.jobTitle?.message}
                {...register('jobTitle')}
              />
              <Input
                label="Location"
                placeholder="e.g. San Francisco, CA (or Remote)"
                error={errors.location?.message}
                {...register('location')}
              />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 card-shadow">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)] pb-3 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                  <StickyNote className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold">Notes</h3>
              </div>

              <div className="space-y-1.5">
                <textarea
                  {...register('notes')}
                  rows={5}
                  className={`flex w-full rounded-xl border bg-[var(--background)] px-3 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 resize-none ${errors.notes ? 'border-red-500' : 'border-[var(--border)]'}`}
                  placeholder="Add any notes about this application..."
                />
                {errors.notes && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 card-shadow">
              <div className="flex items-center gap-2 pb-1 border-b border-[var(--border)] pb-3 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold">Status & Dates</h3>
              </div>

              <Select
                label="Status"
                options={statusOptions}
                error={errors.status?.message}
                {...register('status')}
              />

              <Input
                label="Applied Date"
                type="date"
                error={errors.appliedDate?.message}
                {...register('appliedDate')}
              />

              <Input
                label="Interview Date"
                type="date"
                error={errors.interviewDate?.message}
                {...register('interviewDate')}
              />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 card-shadow">
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4" />
                {isEdit ? 'Save Changes' : 'Add Application'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/applications')}
                className="w-full mt-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
