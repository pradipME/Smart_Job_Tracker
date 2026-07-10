import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies, useDeleteCompany } from '../../../hooks/useCompanies';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Plus, Trash2, Edit, ChevronLeft, ChevronRight,
  Building2, Globe, MapPin, Users, Briefcase, Search,
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Companies</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage registered companies</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Companies</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage registered companies</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200">
            <Building2 className="h-7 w-7 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Failed to load companies</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Companies</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage registered companies</p>
        </div>
        <Button onClick={() => navigate('/admin/companies/new')}>
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input type="text" placeholder="Search companies..." value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Industry</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-xs text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">{isSearchActive ? 'No matching companies' : 'No companies yet'}</p>
                      <p className="text-xs text-slate-400">{isSearchActive ? 'Try adjusting your search criteria.' : 'Start by adding your first company.'}</p>
                    </div>
                  </td>
                </tr>
              ) : companies.map((company: any) => (
                <tr key={company.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/companies/${company.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-100 overflow-hidden">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{company.name}</p>
                        {company.website && (
                          <a href={company.website} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span className="truncate max-w-[140px]">{company.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {company.industry ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        <Briefcase className="h-3 w-3" />{company.industry}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {company.location ? (
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />{company.location}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {company.companySize ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        <Users className="h-3 w-3" />{company.companySize}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/companies/${company.id}`); }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/companies/${company.id}/edit`); }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: company.id, name: company.name }); }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete">
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
              <span className="text-slate-500">Page {page + 1} of {totalPages || 1}</span>
              {!isSearchActive && (
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                  className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} per page</option>)}
                </select>
              )}
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pn = start + i;
                if (pn >= totalPages) return null;
                return (
                  <button key={pn} onClick={() => setPage(pn)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-all ${pn === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {pn + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null, name: '' })} title="Delete Company">
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
