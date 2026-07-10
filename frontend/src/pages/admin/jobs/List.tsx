import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useJobListings,
  useSearchJobListings,
  useFilterJobListings,
  useDeleteJobListing,
} from '../../../hooks/useJobListings';
import { useAllCompanies } from '../../../hooks/useCompanies';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Skeleton, TableSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Plus, Search, Trash2, Edit, Eye, ChevronLeft, ChevronRight,
  Briefcase, SlidersHorizontal, Building2, MapPin, XCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobListingsApi } from '../../../api/jobListings';
import type { JobListing } from '../../../types';
import { formatDate } from '../../../lib/utils';

const PAGE_SIZES = [10, 20, 50, 100] as const;

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
];

const WORK_MODE_OPTIONS = [
  { value: '', label: 'All Modes' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'DRAFT', label: 'Draft' },
];

const STATUS_BADGE_MAP: Record<string, string> = {
  OPEN: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  CLOSED: 'border-l-slate-400 bg-slate-50 text-slate-600',
  DRAFT: 'border-l-amber-500 bg-amber-50 text-amber-700',
};

function EmploymentBadge({ type }: { type: string | null }) {
  if (!type) return null;
  const colors: Record<string, string> = {
    FULL_TIME: 'border-l-blue-500 bg-blue-50 text-blue-700',
    PART_TIME: 'border-l-violet-500 bg-violet-50 text-violet-700',
    INTERN: 'border-l-amber-500 bg-amber-50 text-amber-700',
    CONTRACT: 'border-l-cyan-500 bg-cyan-50 text-cyan-700',
  };
  const labels: Record<string, string> = {
    FULL_TIME: 'Full Time',
    PART_TIME: 'Part Time',
    INTERN: 'Intern',
    CONTRACT: 'Contract',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${colors[type] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
      {labels[type] || type}
    </span>
  );
}

function WorkModeBadge({ mode }: { mode: string | null }) {
  if (!mode) return null;
  const colors: Record<string, string> = {
    REMOTE: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
    HYBRID: 'border-l-violet-500 bg-violet-50 text-violet-700',
    ONSITE: 'border-l-orange-500 bg-orange-50 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${colors[mode] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
      {mode.charAt(0) + mode.slice(1).toLowerCase()}
    </span>
  );
}

export default function JobListingList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<'title' | 'company' | 'location'>('title');
  const [statusFilter, setStatusFilter] = useState('');
  const [empTypeFilter, setEmpTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isSearchActive = debouncedSearch.length > 0;
  const isFilterActive = !!(statusFilter || empTypeFilter || workModeFilter);
  const isSearchOrFilter = isSearchActive || isFilterActive;

  const { data, isLoading, isError } = useJobListings(
    !isSearchOrFilter ? page : 0,
    !isSearchOrFilter ? pageSize : 10
  );

  const searchData = useSearchJobListings(
    isSearchActive && !isFilterActive
      ? { [searchField]: debouncedSearch, page, size: pageSize }
      : { page: 0, size: 10 }
  );

  const filterData = useFilterJobListings(
    isFilterActive && !isSearchActive
      ? { status: statusFilter || undefined, employmentType: empTypeFilter || undefined, workMode: workModeFilter || undefined, page, size: pageSize }
      : { page: 0, size: 10 }
  );

  const combinedData = useQuery({
    queryKey: ['job-listings', 'combined', debouncedSearch, searchField, statusFilter, empTypeFilter, workModeFilter, page, pageSize],
    queryFn: async () => {
      if (isSearchActive && isFilterActive) {
        const result = await jobListingsApi.search({ [searchField]: debouncedSearch, page, size: pageSize });
        return result.data;
      }
      if (isSearchActive) {
        return (await jobListingsApi.search({ [searchField]: debouncedSearch, page, size: pageSize })).data;
      }
      if (isFilterActive) {
        return (await jobListingsApi.filter({
          status: statusFilter || undefined,
          employmentType: empTypeFilter || undefined,
          workMode: workModeFilter || undefined,
          page, size: pageSize,
        })).data;
      }
      return null;
    },
    enabled: isSearchOrFilter,
  });

  const deleteMutation = useDeleteJobListing();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: '' });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleDelete = async () => {
    if (deleteModal.id === null) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.id);
      toast('Job deleted successfully', 'success');
    } catch {
      toast('Failed to delete job', 'error');
    }
    setDeleteModal({ open: false, id: null, title: '' });
  };

  const resultData = isSearchOrFilter ? combinedData.data : data;
  const jobs: JobListing[] = resultData?.content ?? [];
  const totalPages = resultData?.totalPages ?? 0;

  if (isLoading && !isSearchOrFilter) {
    return (
      <div>
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError && !isSearchOrFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <Briefcase className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Failed to load job listings</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Job Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage job openings</p>
        </div>
        <Button onClick={() => navigate('/admin/jobs/new')}>
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 mb-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search by ${searchField}...`}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 w-full border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select
          value={searchField}
          onChange={(e) => { setSearchField(e.target.value as 'title' | 'company' | 'location'); setPage(0); }}
          className="h-8 min-w-[100px] border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
        >
          <option value="title">Title</option>
          <option value="company">Company</option>
          <option value="location">Location</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-8 min-w-[100px] border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={empTypeFilter}
          onChange={(e) => { setEmpTypeFilter(e.target.value); setPage(0); }}
          className="h-8 min-w-[100px] border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
        >
          {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={workModeFilter}
          onChange={(e) => { setWorkModeFilter(e.target.value); setPage(0); }}
          className="h-8 min-w-[100px] border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
        >
          {WORK_MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="border border-slate-200 border-t-0 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Job</th>
                <th className="hidden sm:table-cell">Company</th>
                <th className="hidden md:table-cell">Type</th>
                <th className="hidden lg:table-cell">Mode</th>
                <th>Status</th>
                <th className="text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Briefcase className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        {isSearchOrFilter ? 'No matching jobs' : 'No job listings yet'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isSearchOrFilter ? 'Try adjusting your search or filter criteria.' : 'Create your first job listing to start receiving applications.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : jobs.map((job: JobListing) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/jobs/${job.id}`)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 border border-indigo-200 overflow-hidden">
                        {job.companyLogoUrl ? (
                          <img src={job.companyLogoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Briefcase className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{job.title}</p>
                        {job.location && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {job.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-sm text-slate-700">{job.companyName}</span>
                  </td>
                  <td className="hidden md:table-cell">
                    <EmploymentBadge type={job.employmentType} />
                  </td>
                  <td className="hidden lg:table-cell">
                    <WorkModeBadge mode={job.workMode} />
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${STATUS_BADGE_MAP[job.status] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
                      {STATUS_OPTIONS.find(o => o.value === job.status)?.label || job.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}`); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/jobs/${job.id}/edit`); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: job.id, title: job.title }); }}
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
              {!isSearchOrFilter && (
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
                      pn === page
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
        onClose={() => setDeleteModal({ open: false, id: null, title: '' })}
        title="Delete Job"
      >
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal.title}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null, title: '' })}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(0);
  }
}
