import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAssessment, useAssessmentResults, useUpdateAssessmentStatus, useDeleteAssessment } from '../../../hooks/useAdminAssessments';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Edit, Trash2, ClipboardList, Clock, CheckCircle, XCircle,
  FileText, Tag, Calendar, Users, BarChart3, Award, ChevronDown,
} from 'lucide-react';
import type { AssessmentResultResponse } from '../../../types';

function ResultRow({ r, rank }: { r: AssessmentResultResponse; rank: number }) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
            {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.candidateName}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{r.score}/{r.totalMarks}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{r.percentage.toFixed(0)}%</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${r.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {r.passed ? 'Passed' : 'Failed'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{r.score}/{r.totalMarks}</td>
    </tr>
  );
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: assessment, isLoading, isFetched } = useAdminAssessment(Number(id));
  const { data: results } = useAssessmentResults(Number(id));
  const updateStatus = useUpdateAssessmentStatus();
  const deleteMutation = useDeleteAssessment();
  const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-80 rounded-lg" />
        <div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-48 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></div>
      </div>
    );
  }

  if (isFetched && !assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-200"><ClipboardList className="h-7 w-7 text-red-500" /></div>
        <p className="text-sm font-semibold text-slate-900">Assessment not found</p>
        <Button onClick={() => navigate('/admin/assessments')}><ArrowLeft className="h-4 w-4" />Back</Button>
      </div>
    );
  }

  if (!assessment) return null;

  const assessmentId = Number(id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/assessments')} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{assessment.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{assessment.questionCount} questions · {assessment.duration} minutes · {assessment.totalMarks} marks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {assessment.status === 'DRAFT' && (
            <Button size="sm" onClick={async () => { await updateStatus.mutateAsync({ id: assessmentId, status: 'PUBLISHED' }); toast('Assessment published', 'success'); }}>
              <CheckCircle className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/assessments/${id}/edit`)}>
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'questions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Questions ({assessment.questions?.length || 0})
        </button>
        <button onClick={() => setActiveTab('results')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          Results ({results?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'questions' ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {assessment.questions && assessment.questions.length > 0 ? assessment.questions.map((q, i) => (
            <div key={q.id || i} className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">{i + 1}</span>
                  {q.questionType}
                </span>
                <span className="text-xs font-medium text-slate-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-sm font-medium text-slate-900 mb-3">{q.questionText}</p>
              {q.questionType === 'MCQ' && q.options && (
                <div className="space-y-1.5">
                  {(() => { try { const opts = JSON.parse(q.options); return Array.isArray(opts) ? opts : []; } catch { return []; } })().map((opt: string, oi: number) => (
                    <div key={oi} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${opt === q.correctAnswer ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {opt} {opt === q.correctAnswer && <CheckCircle className="h-3 w-3 text-emerald-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              )}
              {q.questionType === 'TRUE_FALSE' && (
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-lg text-xs border ${q.correctAnswer === 'true' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>True</span>
                  <span className={`px-3 py-1 rounded-lg text-xs border ${q.correctAnswer === 'false' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>False</span>
                </div>
              )}
              {q.correctAnswer && q.questionType !== 'MCQ' && q.questionType !== 'TRUE_FALSE' && (
                <div className="text-xs text-slate-500 mt-2">Answer: <span className="font-medium text-slate-700">{q.correctAnswer}</span></div>
              )}
            </div>
          )) : (
            <div className="lg:col-span-2 flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="h-9 w-9 mb-2" />
              <p className="text-sm font-medium text-slate-600">No questions added yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
          {results && results.length > 0 ? (
            <>
              {/* Results KPIs */}
              <div className="grid grid-cols-4 gap-4 p-5 border-b border-slate-100">
                <KPICard label="Total Attempts" value={results.length} />
                <KPICard label="Passed" value={results.filter(r => r.passed).length} color="text-emerald-600" />
                <KPICard label="Failed" value={results.filter(r => !r.passed).length} color="text-red-600" />
                <KPICard label="Avg Score" value={`${(results.reduce((s, r) => s + r.percentage, 0) / results.length).toFixed(0)}%`} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Percentage</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.sort((a, b) => b.percentage - a.percentage).map((r, i) => (
                      <ResultRow key={r.id} r={r} rank={i + 1} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BarChart3 className="h-9 w-9 mb-2" />
              <p className="text-sm font-medium text-slate-600">No results yet</p>
              <p className="text-xs text-slate-400 mt-1">Results will appear once candidates complete this assessment</p>
            </div>
          )}
        </div>
      )}

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Assessment">
        <p className="text-sm text-slate-500 mb-4">Are you sure you want to delete this assessment? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="destructive" onClick={async () => { await deleteMutation.mutateAsync(assessmentId); toast('Assessment deleted', 'success'); navigate('/admin/assessments'); }} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function KPICard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold text-slate-900 mt-0.5 ${color || ''}`}>{value}</p>
    </div>
  );
}
