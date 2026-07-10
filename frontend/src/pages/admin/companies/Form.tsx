import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCompany, useCreateCompany, useUpdateCompany } from '../../../hooks/useCompanies';
import { companySchema, type CompanyFormData } from '../../../lib/validations';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import { ArrowLeft, Save, Building2, Globe, Briefcase, MapPin, Users, FileText } from 'lucide-react';

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">{icon}</div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function CompanyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const { data: company, isLoading: companyLoading, isFetched } = useCompany(isEdit ? Number(id) : null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '', logoUrl: '', website: '', industry: '',
      location: '', companySize: '', description: '',
    },
  });

  useEffect(() => {
    if (company && isEdit) {
      reset({
        name: company.name,
        logoUrl: company.logoUrl || '',
        website: company.website || '',
        industry: company.industry || '',
        location: company.location || '',
        companySize: company.companySize || '',
        description: company.description || '',
      });
    }
  }, [company, isEdit, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    const payload = {
      name: data.name,
      logoUrl: data.logoUrl || undefined,
      website: data.website || undefined,
      industry: data.industry || undefined,
      location: data.location || undefined,
      companySize: data.companySize || undefined,
      description: data.description || undefined,
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast('Company updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Company added successfully', 'success');
      }
      navigate('/admin/companies');
    } catch {
      toast(isEdit ? 'Failed to update company' : 'Failed to add company', 'error');
    }
  };

  if (isEdit && companyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  if (isEdit && isFetched && !company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200">
          <Building2 className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Company not found</p>
        <Button onClick={() => navigate('/admin/companies')}><ArrowLeft className="h-4 w-4" /> Back to Companies</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => navigate('/admin/companies')} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit Company' : 'Add Company'}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{isEdit ? 'Update the company details' : 'Register a new company'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-5 items-start">
          <div className="space-y-5 min-w-0">
            <FormSection title="Company Information" icon={<Building2 className="h-4 w-4" />}>
              <Input label="Company Name" placeholder="e.g. Acme Corp" error={errors.name?.message} {...register('name')} />
              <Input label="Industry" placeholder="e.g. Technology, Healthcare, Finance" error={errors.industry?.message} {...register('industry')} />
              <Input label="Location" placeholder="e.g. San Francisco, CA" error={errors.location?.message} {...register('location')} />
              <Input label="Company Size" placeholder="e.g. 1-10, 11-50, 51-200, 201-1000, 1000+" error={errors.companySize?.message} {...register('companySize')} />
            </FormSection>

            <FormSection title="Description" icon={<FileText className="h-4 w-4" />}>
              <textarea {...register('description')} rows={5}
                className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the company, its mission, and what makes it unique..." />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </FormSection>
          </div>

          <div className="space-y-5">
            <FormSection title="Online Presence" icon={<Globe className="h-4 w-4" />}>
              <Input label="Logo URL" placeholder="https://example.com/logo.png" error={errors.logoUrl?.message} {...register('logoUrl')} />
              <Input label="Website" placeholder="https://example.com" error={errors.website?.message} {...register('website')} />
            </FormSection>

            <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-6 space-y-3">
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="w-full">
                <Save className="h-4 w-4" /> {isEdit ? 'Save Changes' : 'Add Company'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/admin/companies')} className="w-full">Cancel</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
