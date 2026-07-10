import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useJobListings, useSearchJobListings, useFilterJobListings, useDeleteJobListing,
} from '../../../hooks/useJobListings';
import { useAllCompanies } from '../../../hooks/useCompanies';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Plus, Search, Trash2, Edit, Eye, ChevronLeft, ChevronRight,
  Briefcase, Building2, MapPin, SlidersHorizontal, ArrowUpDown, Filter,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobListingsApi } from '../../../api/jobListings';
import type { JobListing } from '../../../types';
import { formatDate } from '../../../lib/utils';

const PAGE_SIZES = [10, 20, 50, 100] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' }, { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' }, { value: 'INTERN', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
];

const WORK_MODE_OPTIONS = [
  { value: '', label: 'All Modes' }, { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' }, { value: 'ONSITE', label: 'On-site' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' }, { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' }, { value: 'DRAFT', label: 'Draft' },
];

function EmploymentBadge({ type }: { type: string | null }) {
  const styles: Record<string, string> = {
    FULL_TIME: 'bg-blue-50 text-blue-700 border-blue-200',
    PART_TIME: 'bg-amber-50 text-amber-700 border-amber-200',
    INTERN: 'bg-violet-50 text-violet-700 border-violet-200',
    CONTRACT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[type || ''] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {EMPLOYMENT_TYPE_OPTIONS.find(o => o.value === type)?.label || type || 'N/A'}
    </span>
  );
}

function WorkModeBadge({ mode }: { mode: string | null }) {
  const styles: Record<string, string> = {
    REMOTE: 'bg-green-50 text-green-700 border-green-200',
    HYBRID: 'bg-amber-50 text-amber-700 border-amber-200',
    ONSITE: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[mode || ''] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {WORK_MODE_OPTIONS.find(o => o.value === mode)?.label || mode || 'N/A'}
    </span>
  );
}

export default function JobListingList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: companies } = useAllCompanies();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError } = useJobListings(page, pageSize);
  const deleteMutation = useDeleteJobListing();
  const [deleteModal, setDeleteModal] = useState<{ id: number; title: string } | null>(null);

  const isSearchOrFilter = debouncedSearch || employmentTypeFilter || workModeFilter || statusFilter;

  const combinedData = useQuery({
    queryKey: ['admin-jobs-combined', debouncedSearch, employmentTypeFilter, workModeFilter, statusFilter, page, pageSize],
    queryFn: async () => {
      if (debouncedSearch) {
        const field = isNaN(Number(debouncedSearch)) ? 'title' : 'id';
        return jobListingsApi.search({ [field]: debouncedSearch, page, size: pageSize });
      }
      if (employmentTypeFilter || workModeFilter || statusFilter) {
        return jobListingsApi.filter({ status: statusFilter || undefined, employmentType: employmentTypeFilter || undefined, workMode: workModeFilter || undefined, page, size: pageSize });
      }
      return { data: { content: [], totalPages: 0 } };
    },
    enabled: !!isSearchOrFilter,
    select: (res) => res.data,
  });

  const resultData = isSearchOrFilter ? combinedData.data : data;
  const jobs: JobListing[] = resultData?.content ?? [];
  const totalPages = resultData?.totalPages ?? 0;

  if (isLoading && !isSearchOrFilter) {
    return (
      <div className="space-y-5 animate-pulse">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (isError && !isSearchOrFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Failed to load job listings</p>
      </div>
    );
  }

  const handleDeleteJob = async () => {
    if (!deleteModal) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.id);
      toast('Job listing deleted', 'success');
      setDeleteModal(null);
    } catch {
      toast('Failed to delete job listing', 'error');
    }
  };

  const companyMap = new Map(companies?.map((c: any) => [c.id, c.name]) || []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Job Listings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage and create job listings</p>
        </div>
        <Button size="sm" onClick={() => navigate('/admin/jobs/new')}>
          <Plus className="h-3.5 w-3.5" /> New Job
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={employmentTypeFilter}
          onChange={(e) => { setEmploymentTypeFilter(e.target.value); setPage(0); }}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
        >
          {EMPLOYMENT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={workModeFilter}
          onChange={(e) => { setWorkModeFilter(e.target.value); setPage(0); }}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
        >
          {WORK_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-xs text-slate-400 font-medium ml-auto">{jobs.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    Job Title <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Mode</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Briefcase className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No job listings found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/jobs/${job.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                        <Briefcase className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-400">ID: {job.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {companyMap.get(job.companyId) || `Company #${job.companyId}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {job.location ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </div>
                    ) : <span className="text-sm text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3"><EmploymentBadge type={job.employmentType} /></td>
                  <td className="px-4 py-3"><WorkModeBadge mode={job.workMode} /></td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      job.status === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {job.status || 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/admin/jobs/${job.id}`)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => navigate(`/admin/jobs/${job.id}/edit`)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteModal({ id: job.id, title: job.title })} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Page {page + 1} of {totalPages}</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pn = start + i;
                if (pn >= totalPages) return null;
                return (
                  <button key={pn} onClick={() => setPage(pn)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium ${pn === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {pn + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Job Listing">
        <p className="text-sm text-slate-500 mb-4">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal?.title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteJob} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
