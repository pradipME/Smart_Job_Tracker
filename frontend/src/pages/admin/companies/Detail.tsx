import { useParams, useNavigate } from 'react-router-dom';
import { useCompany, useDeleteCompany } from '../../../hooks/useCompanies';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useState } from 'react';
import {
  ArrowLeft, Edit, Trash2, Building2, Globe, MapPin, Users, Briefcase, Calendar, ExternalLink,
} from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: company, isLoading, isFetched } = useCompany(id ? Number(id) : null);
  const deleteMutation = useDeleteCompany();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(Number(id));
      toast('Company deleted successfully', 'success');
      navigate('/admin/companies');
    } catch {
      toast('Failed to delete company', 'error');
    }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 border border-slate-200" />
      </div>
    );
  }

  if (isFetched && !company) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <Building2 className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Company not found</p>
        <Button onClick={() => navigate('/admin/companies')} className="mt-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </Button>
      </div>
    );
  }

  if (!company) return null;

  const details = [
    { label: 'Industry', value: company.industry, icon: Briefcase },
    { label: 'Location', value: company.location, icon: MapPin },
    { label: 'Company Size', value: company.companySize, icon: Users },
    { label: 'Website', value: company.website, icon: Globe, href: company.website },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/companies')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{company.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Company details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/admin/companies/${company.id}/edit`)}>
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
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{company.name}</h2>
              {company.industry && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[11px] font-medium border-l-2 border-l-indigo-500 bg-indigo-50 text-indigo-700">
                  <Briefcase className="h-3 w-3" />
                  {company.industry}
                </span>
              )}
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
                {detail.href ? (
                  <a
                    href={detail.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1 ml-8"
                  >
                    <span className="truncate">{detail.value}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : detail.value ? (
                  <p className="text-sm font-medium text-slate-700 ml-8">{detail.value}</p>
                ) : (
                  <p className="text-sm text-slate-500 ml-8">Not specified</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-4">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">About</h4>
          {company.description ? (
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{company.description}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">No description provided.</p>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {new Date(company.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Updated {new Date(company.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Company"
      >
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{company.name}</span>?
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
