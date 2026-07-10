import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminApplications, useAdminDashboard } from '../../../hooks/useAdminApplications';
import { useAllCompanies } from '../../../hooks/useCompanies';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  Search, Eye, Download, ChevronLeft, ChevronRight, Briefcase, Plus,
  SlidersHorizontal, Users, CheckCircle, XCircle, Upload, Columns,
  ListFilter, RotateCcw, ChevronDown,
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

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  APPLIED: { label: 'Applied', cls: 'border-l-indigo-500 bg-indigo-50 text-indigo-700' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'border-l-amber-500 bg-amber-50 text-amber-700' },
  ASSESSMENT_ASSIGNED: { label: 'Assessment', cls: 'border-l-violet-500 bg-violet-50 text-violet-700' },
  ASSESSMENT_COMPLETED: { label: 'Assessment Done', cls: 'border-l-violet-500 bg-violet-50 text-violet-700' },
  INTERVIEW_SCHEDULED: { label: 'Interview', cls: 'border-l-cyan-500 bg-cyan-50 text-cyan-700' },
  HR_ROUND: { label: 'HR Round', cls: 'border-l-teal-500 bg-teal-50 text-teal-700' },
  SELECTED: { label: 'Selected', cls: 'border-l-emerald-500 bg-emerald-50 text-emerald-700' },
  REJECTED: { label: 'Rejected', cls: 'border-l-red-500 bg-red-50 text-red-700' },
  WITHDRAWN: { label: 'Withdrawn', cls: 'border-l-slate-400 bg-slate-50 text-slate-600' },
};

const PAGE_SIZES = [10, 25, 50, 100];

function statusBadge(status: string) {
  const s = STATUS_MAP[status] || STATUS_MAP.APPLIED;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${s.cls}`}>
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

  const DENSITY_OPTIONS = ['Compact', 'Standard', 'Comfortable'];
  const [density, setDensity] = useState('Standard');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <Briefcase className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Failed to load applications</p>
      </div>
    );
  }

  const rowPadding = density === 'Compact' ? 'py-2' : density === 'Comfortable' ? 'py-4' : 'py-3';

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review and manage candidate applications</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <Upload className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      {dashboardData && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Applications Today', value: dashboardData.applicationsToday, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
            { label: 'Pending Review', value: dashboardData.pendingReview, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { label: 'In Interview', value: dashboardData.interviewScheduled, color: 'text-violet-600 bg-violet-50 border-violet-200' },
            { label: 'Selected', value: dashboardData.selected, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          ].map(k => (
            <div key={k.label} className={`border ${k.color} p-3`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider">{k.label}</p>
              <p className="text-xl font-bold mt-0.5">{k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 mb-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, jobs..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="h-8 w-full border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="h-8 border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none min-w-[110px]"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={companyFilter}
            onChange={(e) => { setCompanyFilter(e.target.value); setPage(0); }}
            className="h-8 border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none min-w-[130px]"
          >
            <option value="">All Companies</option>
            {companies?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            className="h-8 border border-slate-200 bg-white px-2 text-xs text-slate-600 appearance-none min-w-[90px]"
          >
            {DENSITY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border-l-2 border-indigo-500 text-xs text-indigo-700 border border-slate-200 border-t-0">
        <input type="checkbox" className="h-3.5 w-3.5 border-slate-300" />
        <span>Select all</span>
        <div className="w-px h-4 bg-indigo-200 mx-1" />
        <button className="font-medium hover:text-indigo-900">Bulk Update Status</button>
        <div className="w-px h-4 bg-indigo-200 mx-1" />
        <button className="font-medium hover:text-indigo-900">Assign</button>
        <div className="w-px h-4 bg-indigo-200 mx-1" />
        <button className="font-medium hover:text-indigo-900">Export Selected</button>
        <span className="ml-auto text-indigo-500">{apps.length} applications</span>
      </div>

      {/* Table wrapper */}
      <div className="border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th className="w-8 px-3">
                  <input type="checkbox" className="h-3.5 w-3.5 border-slate-300" />
                </th>
                <th>Candidate</th>
                <th className="hidden sm:table-cell">Company</th>
                <th className="hidden lg:table-cell">Job Title</th>
                <th className="hidden md:table-cell">Applied</th>
                <th>Status</th>
                <th className="text-center w-12">Resume</th>
                <th className="text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-xs text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No applications found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : apps.map((app: AdminApplicationSummary) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                  <td className="px-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="h-3.5 w-3.5 border-slate-300" />
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {app.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{app.candidateName}</p>
                        <p className="text-[11px] text-slate-500">{app.candidateEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-sm text-slate-700">{app.companyName}</span>
                  </td>
                  <td className="hidden lg:table-cell">
                    <span className="text-sm text-slate-700">{app.jobTitle}</span>
                  </td>
                  <td className="hidden md:table-cell">
                    <span className="text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td>{statusBadge(app.status)}</td>
                  <td className="text-center">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex h-7 w-7 items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Download resume"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/applications/${app.id}`); }}
                      className="inline-flex h-7 w-7 items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                Page {page + 1} of {totalPages || 1}
              </span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="h-7 border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const pn = start + i;
                if (pn >= totalPages) return null;
                return (
                  <button key={pn} onClick={() => setPage(pn)}
                    className={`flex h-7 w-7 items-center justify-center text-xs font-medium transition-colors ${
                      pn === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    {pn + 1}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
