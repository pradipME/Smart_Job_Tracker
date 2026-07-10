import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAssessments, useDeleteAssessment, useUpdateAssessmentStatus } from '../../../hooks/useAdminAssessments';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  ClipboardList, Clock, CheckCircle, XCircle, ArrowUpDown,
} from 'lucide-react';
import type { AssessmentResponse } from '../../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const PAGE_SIZES = [10, 25, 50];

export default function AssessmentList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, isLoading, isError } = useAdminAssessments({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page, size: pageSize,
  });
  const deleteMutation = useDeleteAssessment();
  const updateStatus = useUpdateAssessmentStatus();
  const [deleteModal, setDeleteModal] = useState<{ id: number; title: string } | null>(null);

  const assessments = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between"><div className="h-8 w-48 bg-slate-200 rounded-lg" /><div className="h-9 w-32 bg-slate-200 rounded-lg" /></div>
        <div className="h-12 bg-slate-200 rounded-lg" />
        <div className="h-96 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200"><ClipboardList className="h-7 w-7 text-red-500" /></div>
        <p className="text-sm font-semibold text-slate-900">Failed to load assessments</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Assessment Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create and manage candidate assessments</p>
        </div>
        <Button size="sm" onClick={() => navigate('/admin/assessments/new')}>
          <Plus className="h-3.5 w-3.5" /> New Assessment
        </Button>
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input type="text" placeholder="Search assessments..." value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-8 rounded-md border border-slate-200 bg-white px-2.5 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-xs text-slate-400 font-medium ml-auto">{assessments.length} results</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Marks</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3"><ClipboardList className="h-10 w-10 text-slate-300" /><p className="text-sm font-medium text-slate-600">No assessments found</p></div>
                </td></tr>
              ) : assessments.map((a: AssessmentResponse) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/assessments/${a.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-50 text-violet-600"><ClipboardList className="h-3.5 w-3.5" /></div>
                      <div><p className="text-sm font-medium text-slate-900">{a.title}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      a.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      a.status === 'ARCHIVED' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.questionCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.duration} min</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.totalMarks}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      {a.status === 'DRAFT' && (
                        <button onClick={async () => { await updateStatus.mutateAsync({ id: a.id, status: 'PUBLISHED' }); toast('Assessment published', 'success'); }}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all" title="Publish">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => navigate(`/admin/assessments/${a.id}`)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteModal({ id: a.id, title: a.title })} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
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
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Page {page + 1} of {totalPages}</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
            <div className="flex gap-0.5">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30">
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
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Assessment">
        <p className="text-sm text-slate-500 mb-4">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal?.title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          <Button variant="destructive" onClick={async () => { await deleteMutation.mutateAsync(deleteModal!.id); toast('Assessment deleted', 'success'); setDeleteModal(null); }} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
