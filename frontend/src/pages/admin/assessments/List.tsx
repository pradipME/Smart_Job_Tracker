import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAssessments, useDeleteAssessment, useUpdateAssessmentStatus } from '../../../hooks/useAdminAssessments';
import { useDebounce } from '../../../hooks/useDebounce';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
  ClipboardList, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import type { AssessmentResponse } from '../../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'border-l-amber-500 bg-amber-50 text-amber-700',
  PUBLISHED: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  ARCHIVED: 'border-l-slate-400 bg-slate-50 text-slate-600',
};

export default function AssessmentList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: '' });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isError } = useAdminAssessments({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    size: pageSize,
  });

  const deleteMutation = useDeleteAssessment();
  const updateStatus = useUpdateAssessmentStatus();

  const assessments = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleDelete = async () => {
    if (deleteModal.id === null) return;
    try {
      await deleteMutation.mutateAsync(deleteModal.id);
      toast('Assessment deleted', 'success');
    } catch { toast('Failed to delete', 'error'); }
    setDeleteModal({ open: false, id: null, title: '' });
  };

  const handlePublish = async (id: number) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'PUBLISHED' });
      toast('Assessment published', 'success');
    } catch { toast('Failed to publish', 'error'); }
  };

  if (isError) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Assessments</h1>
            <p className="text-xs text-slate-500 mt-0.5">Create and manage assessments</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
            <ClipboardList className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Failed to load assessments</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Assessments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create and manage assessments</p>
        </div>
        <Button onClick={() => navigate('/admin/assessments/new')}>
          <Plus className="h-4 w-4" />
          New Assessment
        </Button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 mb-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            className="h-8 w-full border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-8 min-w-[120px] border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="border border-slate-200 border-t-0 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="hidden sm:table-cell">Questions</th>
                <th className="hidden sm:table-cell">Duration</th>
                <th className="hidden md:table-cell">Total Marks</th>
                <th>Status</th>
                <th className="text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-xs text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        {debouncedSearch || statusFilter ? 'No matching assessments' : 'No assessments yet'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {debouncedSearch || statusFilter ? 'Try adjusting your search or filter criteria.' : 'Create your first assessment to evaluate candidates.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : assessments.map((a: AssessmentResponse) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/assessments/${a.id}`)}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 border border-indigo-200">
                        <ClipboardList className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{a.title}</p>
                        {a.jobTitle && <p className="text-[11px] text-slate-500">{a.jobTitle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-sm text-slate-700">{a.questionCount}</td>
                  <td className="hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {a.duration}m
                    </span>
                  </td>
                  <td className="hidden md:table-cell text-sm text-slate-700">{a.totalMarks}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${STATUS_BADGE[a.status] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
                      {a.status === 'DRAFT' ? 'Draft' : a.status === 'PUBLISHED' ? 'Published' : 'Archived'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/assessments/${a.id}`); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/assessments/${a.id}/edit`); }}
                        className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {a.status === 'DRAFT' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePublish(a.id); }}
                          className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Publish"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: a.id, title: a.title }); }}
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
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="h-7 border border-slate-200 bg-white px-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {[10, 20, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
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
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null, title: '' })} title="Delete Assessment">
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteModal.title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModal({ open: false, id: null, title: '' })}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
