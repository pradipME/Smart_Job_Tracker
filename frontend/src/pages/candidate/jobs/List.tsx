import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenJobs } from '../../../hooks/useCandidateJobs';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  Search, MapPin, Briefcase, Clock, Building2, Calendar,
  ChevronLeft, ChevronRight, SlidersHorizontal, X, ArrowRight,
  DollarSign,
} from 'lucide-react';

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  INTERN: 'Internship',
  CONTRACT: 'Contract',
};

const WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'salary_high', label: 'Salary: High to Low' },
  { value: 'salary_low', label: 'Salary: Low to High' },
];

const EMPLOYMENT_OPTIONS = [
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

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden animate-pulse">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-[var(--muted)]" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-24 rounded bg-[var(--muted)]" />
            <div className="h-5 w-40 rounded bg-[var(--muted)]" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-md bg-[var(--muted)]" />
          <div className="h-5 w-16 rounded-md bg-[var(--muted)]" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-32 rounded bg-[var(--muted)]" />
          <div className="h-3.5 w-28 rounded bg-[var(--muted)]" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 w-16 rounded-lg bg-[var(--muted)]" />
          <div className="h-6 w-14 rounded-lg bg-[var(--muted)]" />
          <div className="h-6 w-12 rounded-lg bg-[var(--muted)]" />
        </div>
        <div className="h-9 w-full rounded-lg bg-[var(--muted)]" />
      </div>
    </div>
  );
}

function formatSalary(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return '';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(date);
}

export default function CandidateJobList() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const hasActiveFilters = debouncedSearch || employmentFilter || workModeFilter || experienceFilter || sortBy !== 'newest';

  const queryParams = useMemo(() => ({
    title: debouncedSearch || undefined,
    company: debouncedSearch || undefined,
    location: debouncedSearch || undefined,
    employmentType: employmentFilter || undefined,
    workMode: workModeFilter || undefined,
    experience: experienceFilter || undefined,
    sort: sortBy,
    page,
    size: 12,
  }), [debouncedSearch, employmentFilter, workModeFilter, experienceFilter, sortBy, page]);

  const { data, isLoading, isError } = useOpenJobs(queryParams);

  const resetFilters = () => {
    setSearchQuery('');
    setEmploymentFilter('');
    setWorkModeFilter('');
    setExperienceFilter('');
    setSortBy('newest');
    setPage(0);
  };

  const jobs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="heading-2">Browse Jobs</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Discover open positions</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search by job title, company, or location..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-10 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setPage(0); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative">
          <select
            value={employmentFilter}
            onChange={(e) => { setEmploymentFilter(e.target.value); setPage(0); }}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 pr-8 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 cursor-pointer"
          >
            {EMPLOYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={workModeFilter}
            onChange={(e) => { setWorkModeFilter(e.target.value); setPage(0); }}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 pr-8 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 cursor-pointer"
          >
            {WORK_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
        </div>

        <input
          type="text"
          placeholder="Experience..."
          value={experienceFilter}
          onChange={(e) => { setExperienceFilter(e.target.value); setPage(0); }}
          className="h-9 w-36 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-xs font-medium placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
        />

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
            className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 pr-8 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="h-9 px-3 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <Briefcase className="h-7 w-7 text-red-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--foreground)]">Failed to load jobs</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Please try again</p>
          </div>
          <Button onClick={() => setPage(0)} className="mt-2">Retry</Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
            <Search className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-[var(--foreground)]">No jobs found</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-xs">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'There are no open positions right now'}
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={resetFilters} className="mt-2">
              <X className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">
            Showing {jobs.length} of {data?.totalElements ?? 0} jobs
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const skills = job.requiredSkills
                ? job.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];
              const visibleSkills = skills.slice(0, 3);
              const remainingCount = skills.length - 3;

              return (
                <div
                  key={job.id}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden card-hover card-shadow transition-all duration-200 flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    {/* Logo + Company + Title */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-[var(--border)] overflow-hidden">
                        {job.companyLogoUrl ? (
                          <img src={job.companyLogoUrl} alt={job.companyName} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[var(--muted-foreground)] truncate">{job.companyName}</p>
                        <p className="text-sm font-semibold mt-0.5 leading-snug line-clamp-2">{job.title}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {job.employmentType && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[11px] font-medium">
                          {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}
                        </span>
                      )}
                      {job.workMode && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 text-[11px] font-medium">
                          {WORK_MODE_LABELS[job.workMode] || job.workMode}
                        </span>
                      )}
                    </div>

                    {/* Location + Salary */}
                    <div className="space-y-1.5">
                      {job.location && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}
                      {formatSalary(job.salaryMin, job.salaryMax) && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <DollarSign className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {visibleSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {visibleSkills.map((skill) => (
                          <span key={skill} className="rounded-lg bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                            {skill}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                            +{remainingCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Posted + Deadline */}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)] mt-auto pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(job.createdAt)}
                      </span>
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(job.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View Details */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/20 dark:hover:text-blue-400 transition-all duration-150 cursor-pointer group/btn"
                    >
                      View Details
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 3, totalPages - 7));
                const pageNum = start + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                      pageNum === page
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
