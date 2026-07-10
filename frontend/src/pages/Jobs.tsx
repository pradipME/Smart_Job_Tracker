import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs, useDeleteJob } from '../hooks/useJobs';
import { useDebounce } from '../hooks/useDebounce';
import { jobsApi } from '../api/jobs';
import { Button } from '../components/ui/Button';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../lib/utils';
import { Plus, Search, Trash2, Edit, Eye, ChevronLeft, ChevronRight, Briefcase, SlidersHorizontal, Calendar, Building2, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { JobApplication } from '../types';

const PAGE_SIZES = [10, 20, 50, 100] as const;

const FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
] as const;

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  APPLIED: { dot: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Applied' },
  INTERVIEW: { dot: 'bg-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', label: 'Interview' },
  OFFER: { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Offer' },
  REJECTED: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Rejected' },
};

function StatusCell({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.APPLIED;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </div>
  );
}

export default function Jobs() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isSearchActive = debouncedSearch.length > 0;
  const isFilterActive = statusFilter !== '';

  const { data, isLoading, isError } = useJobs(page, pageSize);

  const searchData = useQuery({
    queryKey: ['jobs', 'search', debouncedSearch],
    queryFn: () => jobsApi.search(debouncedSearch),
    enabled: isSearchActive && !isFilterActive,
    select: (res) => res.data,
  });

  const filterData = useQuery({
    queryKey: ['jobs', 'filter', statusFilter],
    queryFn: () => jobsApi.filter(statusFilter),
    enabled: isFilterActive && !isSearchActive,
    select: (res) => res.data,
  });

  const combinedData = useQuery({
    queryKey: ['jobs', 'search-filter', debouncedSearch, statusFilter],
    queryFn: async () => {
      if (isSearchActive && isFilterActive) {
        const results = await jobsApi.search(debouncedSearch);
        return results.data.filter((j) => j.status === statusFilter);
      }
      if (isSearchActive) {
        return (await jobsApi.search(debouncedSearch)).data;
      }
      return (await jobsApi.filter(statusFilter)).data;
    },
    enabled: (isSearchActive && isFilterActive) || isSearchActive || isFilterActive,
  });

  const deleteMutation = useDeleteJob();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
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
    setDeleteModal({ open: false, id: null });
  };

  const isSearchOrFilter = isSearchActive || isFilterActive;

  const jobs = useMemo<JobApplication[]>(() => {
    if (isSearchOrFilter) {
      if (isSearchActive && isFilterActive) return combinedData.data ?? [];
      if (isSearchActive) return searchData.data ?? [];
      if (isFilterActive) return filterData.data ?? [];
    }
    return data?.content ?? [];
  }, [isSearchOrFilter, isSearchActive, isFilterActive, combinedData.data, searchData.data, filterData.data, data?.content]);

  const isLoadingJobs = (() => {
    if (isSearchOrFilter) {
      if (isSearchActive && isFilterActive) return combinedData.isLoading;
      if (isSearchActive) return searchData.isLoading;
      if (isFilterActive) return filterData.isLoading;
    }
    return isLoading;
  })();

  const totalPages = data?.totalPages ?? 0;

  if (isLoadingJobs) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading-2">Applications</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Manage your job applications</p>
          </div>
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--foreground)]">Failed to load applications</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Please try again</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="heading-2">Applications</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Manage your job applications</p>
        </div>
        <Button           onClick={() => navigate('/applications/new')}>
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by company..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="h-10 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--card)] pl-9 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {jobs.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <EmptyState
            icon={<Briefcase className="h-7 w-7" />}
            title={isSearchOrFilter ? 'No matching applications' : 'No applications yet'}
            description={
              isSearchOrFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Start tracking your job search by adding your first application.'
            }
            action={
              isSearchOrFilter ? undefined : (
                <Button           onClick={() => navigate('/applications/new')}>
                  <Plus className="h-4 w-4" />
                  Add Your First Application
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 sticky top-0 z-10">
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Company</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Position</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Status</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Applied</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-[var(--muted-foreground)] hidden md:table-cell">Interview</th>
                  <th className="text-right px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-[var(--muted-foreground)] w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--accent)]/20 group relative"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-[var(--border)]">
                          <Building2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{job.company}</p>
                          {job.location && (
                            <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium">{job.jobTitle}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusCell status={job.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDate(job.appliedDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--muted-foreground)] hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDate(job.interviewDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          onClick={() => navigate(`/applications/${job.id}`)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-blue-500 transition-all duration-150 cursor-pointer"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/applications/${job.id}/edit`)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-violet-500 transition-all duration-150 cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, id: job.id })}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 transition-all duration-150 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                Page <span className="font-medium text-[var(--foreground)]">{page + 1}</span> of <span className="font-medium text-[var(--foreground)]">{totalPages || 1}</span>
              </p>
              {!isSearchOrFilter && (
                <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                  <span className="hidden sm:inline">Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="h-7 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150"
                  >
                    {PAGE_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pageNum = start + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                      pageNum === page
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Delete Application"
      >
        <p className="text-sm text-[var(--muted-foreground)] mb-4 leading-relaxed">
          Are you sure you want to delete this job application? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null })}>
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
