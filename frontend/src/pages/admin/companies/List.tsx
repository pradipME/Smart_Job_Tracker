import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies, useDeleteCompany } from '../../../hooks/useCompanies';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Plus, Search, Trash2, Edit, Eye, ChevronLeft, ChevronRight,
  Building2, Globe, MapPin, Users, Briefcase,
} from 'lucide-react';

const PAGE_SIZES = [10, 20, 50, 100] as const;

export default function CompanyList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isSearchActive = debouncedSearch.length > 0;

  const { data, isLoading, isError } = useCompanies(page, pageSize, isSearchActive ? debouncedSearch : undefined);

  const deleteMutation = useDeleteCompany();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' });

  const handleDelete = async () => {
    if (deleteModal.id === null) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.id);
      toast('Company deleted successfully', 'success');
    } catch {
      toast('Failed to delete company', 'error');
    }
    setDeleteModal({ open: false, id: null, name: '' });
  };

  const companies = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Companies</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage registered companies</p>
          </div>
        </div>
        <div className="border border-slate-200 bg-white">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Companies</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage registered companies</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
            <Building2 className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Failed to load companies</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Companies</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage registered companies</p>
        </div>
        <Button onClick={() => navigate('/admin/companies/new')}>
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="px-3 py-2 bg-slate-50 border border-slate-200 mb-0">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="h-8 w-full border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="border border-slate-200 border-t-0 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th className="hidden sm:table-cell">Industry</th>
                <th className="hidden md:table-cell">Location</th>
                <th className="hidden lg:table-cell">Size</th>
                <th className="text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-xs text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        {isSearchActive ? 'No matching companies' : 'No companies yet'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isSearchActive ? 'Try adjusting your search criteria.' : 'Start by adding your first company.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : companies.map((company: any) => (
                <tr key={company.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/companies/${company.id}`)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 border border-indigo-200 overflow-hidden">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{company.name}</p>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-[140px]">{company.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    {company.industry ? (
                      <span className="inline-flex items-center gap-1 border-l-2 border-l-indigo-500 bg-indigo-50 text-indigo-600 px-2 py-0.5 text-[11px] font-medium">
                        <Briefcase className="h-3 w-3" />
                        {company.industry}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell">
                    {company.location ? (
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {company.location}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell">
                    {company.companySize ? (
                      <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        <Users className="h-3 w-3" />
                        {company.companySize}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/companies/${company.id}`); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/companies/${company.id}/edit`); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: company.id, name: company.name }); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                Page <span className="font-medium text-slate-900">{page + 1}</span> of <span className="font-medium text-slate-900">{totalPages || 1}</span>
              </span>
              {!isSearchActive && (
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="h-7 border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pn = start + i;
                if (pn >= totalPages) return null;
                return (
                  <button
                    key={pn}
                    onClick={() => setPage(pn)}
                    className={`flex h-7 w-7 items-center justify-center text-xs font-medium transition-colors ${
                      pn === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pn + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: '' })}
        title="Delete Company"
      >
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
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
