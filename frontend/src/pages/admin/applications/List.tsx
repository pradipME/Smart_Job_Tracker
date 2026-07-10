import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApplications, useAdminDashboard } from '../../../hooks/useAdminApplications';
import { useAllCompanies } from '../../../hooks/useCompanies';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  Search, Eye, Download, ChevronLeft, ChevronRight, Briefcase,
  SlidersHorizontal, Users, Upload, ChevronDown, ArrowUpDown, Filter,
} from 'lucide-react';
import type { AdminApplicationSummary } from '../../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'ASSESSMENT_ASSIGNED', label: 'Assessment' },
  { value: 'ASSESSMENT_COMPLETED', label: 'Assessment Done' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview' },
  { value: 'HR_ROUND', label: 'HR Round' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  APPLIED: { label: 'Applied', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  ASSESSMENT_ASSIGNED: { label: 'Assessment', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  ASSESSMENT_COMPLETED: { label: 'Assessment Done', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  INTERVIEW_SCHEDULED: { label: 'Interview', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  HR_ROUND: { label: 'HR Round', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  SELECTED: { label: 'Selected', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
  WITHDRAWN: { label: 'Withdrawn', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const PAGE_SIZES = [10, 25, 50, 100];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.APPLIED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function AdminApplicationList() {
  const navigate = useNavigate();
  const { data: companies } = useAllCompanies();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError } = useAdminApplications({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    companyId: companyFilter ? Number(companyFilter) : undefined,
    page,
    size: pageSize,
  });
  const { data: dashboardData } = useAdminDashboard();
  const apps = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200">
          <Briefcase className="h-7 w-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Failed to load applications</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and manage candidate applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Upload className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      {dashboardData && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Applications Today', value: dashboardData.applicationsToday, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'Pending Review', value: dashboardData.pendingReview, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: 'In Interview', value: dashboardData.interviewScheduled, color: 'text-violet-600 bg-violet-50 border-violet-200' },
            { label: 'Selected', value: dashboardData.selected, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          ].map(k => (
            <div key={k.label} className={`rounded-lg border ${k.color} p-3.5`}>
              <p className="text-xs font-medium uppercase tracking-wider">{k.label}</p>
              <p className="text-xl font-semibold mt-1">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Enterprise Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setPage(0); }}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
            >
              <option value="">All Companies</option>
              {companies?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-xs text-slate-400 font-medium px-1">{apps.length} results</span>
        </div>
      </div>

      {/* Enterprise Data Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                  </div>
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    Candidate <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No applications found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : apps.map((app: AdminApplicationSummary) => (
                <tr
                  key={app.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/applications/${app.id}`)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600 text-sm font-semibold shrink-0">
                        {app.candidateName ? app.candidateName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{app.candidateName}</p>
                        <p className="text-xs text-slate-500">{app.candidateEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{app.companyName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{app.jobTitle}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Download resume"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => navigate(`/admin/applications/${app.id}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Page {page + 1} of {totalPages || 1}</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
            </select>
          </div>
          <div className="flex gap-0.5">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
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
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-all ${
                    pn === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pn + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
