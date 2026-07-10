import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJobListing, useCreateJobListing, useUpdateJobListing } from '../../../hooks/useJobListings';
import { useAllCompanies } from '../../../hooks/useCompanies';
import { jobListingSchema, type JobListingFormData } from '../../../lib/validations';
import type { JobListingRequest } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { ArrowLeft, Save, Briefcase, Building2, MapPin, DollarSign, Clock, Users, ListChecks, FileText, Globe } from 'lucide-react';

function FormSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function JobListingForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: job, isLoading: jobLoading, isFetched } = useJobListing(isEdit ? Number(id) : null);
  const { data: companies } = useAllCompanies();
  const createMutation = useCreateJobListing();
  const updateMutation = useUpdateJobListing();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobListingFormData>({
    resolver: zodResolver(jobListingSchema),
  });

  useEffect(() => {
    if (isFetched && job) {
      reset({
        companyId: job.companyId,
        title: job.title,
        description: job.description || '',
        location: job.location || '',
        experience: job.experience || '',
        salaryMin: job.salaryMin ?? (undefined as any),
        salaryMax: job.salaryMax ?? (undefined as any),
        employmentType: job.employmentType || '',
        workMode: job.workMode || '',
        requiredSkills: job.requiredSkills || '',
        openings: job.openings ?? (undefined as any),
        deadline: job.deadline ? job.deadline.slice(0, 10) : '',
        status: job.status === 'OPEN' ? 'OPEN' : 'DRAFT',
      });
    }
  }, [isFetched, job, reset]);

  const onSubmit = async (data: JobListingFormData) => {
    const payload = {
      ...data,
      employmentType: data.employmentType || undefined,
      workMode: data.workMode || undefined,
      status: data.status || undefined,
    } as JobListingRequest;
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast('Job listing updated', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Job listing created', 'success');
      }
      navigate('/admin/jobs');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to save job listing', 'error');
    }
  };

  if (isEdit && jobLoading) {
    return <div className="space-y-6 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => navigate('/admin/jobs')} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit Job' : 'Create Job'}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{isEdit ? 'Update the job listing details' : 'Add a new job listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection icon={Briefcase} title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Job Title *" placeholder="e.g. Senior Software Engineer" error={errors.title?.message} {...register('title')} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Company *</label>
              <select {...register('companyId', { valueAsNumber: true })}
                className={`h-10 w-full rounded-lg border ${errors.companyId ? 'border-red-300' : 'border-slate-200'} bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}>
                <option value="">Select company</option>
                {companies?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.companyId && <p className="text-xs text-red-500 mt-1">{errors.companyId.message}</p>}
            </div>
            <div>
              <Input label="Location" placeholder="e.g. San Francisco, CA" {...register('location')} />
            </div>
            <div>
              <Select label="Employment Type"
                options={[{ value: '', label: 'Select type' }, { value: 'FULL_TIME', label: 'Full Time' }, { value: 'PART_TIME', label: 'Part Time' }, { value: 'INTERN', label: 'Internship' }, { value: 'CONTRACT', label: 'Contract' }]}
                {...register('employmentType')} />
            </div>
            <div>
              <Select label="Work Mode"
                options={[{ value: '', label: 'Select mode' }, { value: 'REMOTE', label: 'Remote' }, { value: 'HYBRID', label: 'Hybrid' }, { value: 'ONSITE', label: 'On-site' }]}
                {...register('workMode')} />
            </div>
            <div>
              <Input label="Experience" placeholder="e.g. 3-5 years" {...register('experience')} />
            </div>
            <div>
              <Select label="Status"
                options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'OPEN', label: 'Open' }]}
                {...register('status')} />
            </div>
          </div>
        </FormSection>

        <FormSection icon={FileText} title="Description & Skills">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <textarea {...register('description')} rows={5}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                placeholder="Describe the role, responsibilities, and qualifications..." />
            </div>
            <div>
              <Input label="Required Skills (comma-separated)" placeholder="e.g. React, Node.js, TypeScript" {...register('requiredSkills')} />
            </div>
          </div>
        </FormSection>

        <FormSection icon={DollarSign} title="Compensation & Openings">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Salary Min" type="number" placeholder="50000" {...register('salaryMin', { valueAsNumber: true })} />
            <Input label="Salary Max" type="number" placeholder="120000" {...register('salaryMax', { valueAsNumber: true })} />
            <Input label="Openings" type="number" placeholder="1" {...register('openings', { valueAsNumber: true })} />
          </div>
        </FormSection>

        <FormSection icon={Clock} title="Timeline">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Application Deadline</label>
              <input type="date" {...register('deadline')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
            </div>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/jobs')}>Cancel</Button>
          <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4" /> {isEdit ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
