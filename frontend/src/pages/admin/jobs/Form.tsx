import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJobListing, useCreateJobListing, useUpdateJobListing } from '../../../hooks/useJobListings';
import { useAllCompanies } from '../../../hooks/useCompanies';
import { jobListingSchema, type JobListingFormData } from '../../../lib/validations';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { ArrowLeft, Save, Briefcase, Building2, MapPin, DollarSign, Clock, Users, ListChecks, FileText } from 'lucide-react';

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
];

const WORK_MODE_OPTIONS = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

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

export default function JobListingForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateJobListing();
  const updateMutation = useUpdateJobListing();
  const { data: job, isLoading: jobLoading, isFetched } = useJobListing(isEdit ? Number(id) : null);
  const { data: companies } = useAllCompanies();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobListingFormData>({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      companyId: undefined,
      title: '',
      description: '',
      location: '',
      experience: '',
      salaryMin: undefined,
      salaryMax: undefined,
      employmentType: '',
      workMode: '',
      requiredSkills: '',
      openings: undefined,
      deadline: '',
      status: 'DRAFT',
    },
  });

  useEffect(() => {
    if (job && isEdit) {
      reset({
        companyId: job.companyId,
        title: job.title,
        description: job.description || '',
        location: job.location || '',
        experience: job.experience || '',
        salaryMin: job.salaryMin ?? undefined,
        salaryMax: job.salaryMax ?? undefined,
        employmentType: job.employmentType || '',
        workMode: job.workMode || '',
        requiredSkills: job.requiredSkills || '',
        openings: job.openings ?? undefined,
        deadline: job.deadline || '',
        status: job.status,
      });
    }
  }, [job, isEdit, reset]);

  const companyOptions = (companies || []).map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const onSubmit = async (data: JobListingFormData) => {
    const payload = {
      companyId: Number(data.companyId),
      title: data.title,
      description: data.description || undefined,
      location: data.location || undefined,
      experience: data.experience || undefined,
      salaryMin: data.salaryMin || undefined,
      salaryMax: data.salaryMax || undefined,
      employmentType: (data.employmentType || undefined) as any,
      workMode: (data.workMode || undefined) as any,
      requiredSkills: data.requiredSkills || undefined,
      openings: data.openings || undefined,
      deadline: data.deadline || undefined,
      status: (data.status || 'DRAFT') as any,
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast('Job updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Job added successfully', 'success');
      }
      navigate('/admin/jobs');
    } catch {
      toast(isEdit ? 'Failed to update job' : 'Failed to add job', 'error');
    }
  };

  if (isEdit && jobLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isEdit && isFetched && !job) {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/jobs')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Job' : 'Add Job'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? 'Update the job listing details' : 'Create a new job listing'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5 items-start">
          <div className="space-y-5 min-w-0">
            <FormSection title="Basic Information" icon={<Briefcase className="h-3.5 w-3.5" />}>
              <Select
                label="Company"
                placeholder="Select a company"
                options={companyOptions}
                error={errors.companyId?.message}
                {...register('companyId', { valueAsNumber: true })}
              />

              <Input
                label="Job Title"
                placeholder="e.g. Senior Software Engineer"
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="Location"
                placeholder="e.g. San Francisco, CA (or Remote)"
                error={errors.location?.message}
                {...register('location')}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  className={`border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none w-full placeholder:text-slate-400 ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>
            </FormSection>

            <FormSection title="Skills & Requirements" icon={<ListChecks className="h-3.5 w-3.5" />}>
              <Input
                label="Required Skills"
                placeholder="e.g. Java, Spring Boot, React (comma separated)"
                error={errors.requiredSkills?.message}
                {...register('requiredSkills')}
              />

              <Input
                label="Experience"
                placeholder="e.g. 3-5 years"
                error={errors.experience?.message}
                {...register('experience')}
              />

              <Input
                label="Number of Openings"
                type="number"
                min="1"
                placeholder="e.g. 2"
                error={errors.openings?.message}
                {...register('openings', { valueAsNumber: true })}
              />
            </FormSection>
          </div>

          <div className="space-y-5">
            <FormSection title="Employment Details" icon={<Clock className="h-3.5 w-3.5" />}>
              <Select
                label="Employment Type"
                placeholder="Select type"
                options={EMPLOYMENT_TYPE_OPTIONS}
                error={errors.employmentType?.message}
                {...register('employmentType')}
              />

              <Select
                label="Work Mode"
                placeholder="Select mode"
                options={WORK_MODE_OPTIONS}
                error={errors.workMode?.message}
                {...register('workMode')}
              />

              <Select
                label="Status"
                options={STATUS_OPTIONS}
                error={errors.status?.message}
                {...register('status')}
              />
            </FormSection>

            <FormSection title="Compensation & Dates" icon={<DollarSign className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Salary Min"
                  type="number"
                  min="0"
                  placeholder="e.g. 80000"
                  error={errors.salaryMin?.message}
                  {...register('salaryMin', { valueAsNumber: true })}
                />
                <Input
                  label="Salary Max"
                  type="number"
                  min="0"
                  placeholder="e.g. 120000"
                  error={errors.salaryMax?.message}
                  {...register('salaryMax', { valueAsNumber: true })}
                />
              </div>
              {errors.salaryMax?.message && (
                <p className="text-xs text-red-500 -mt-2">{errors.salaryMax.message}</p>
              )}

              <Input
                label="Application Deadline"
                type="date"
                error={errors.deadline?.message}
                {...register('deadline')}
              />
            </FormSection>

            <div className="bg-white border border-slate-200 p-4 space-y-2">
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="w-full"
              >
                <Save className="h-4 w-4" />
                {isEdit ? 'Save Changes' : 'Add Job'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/jobs')}
                className="w-full"
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
