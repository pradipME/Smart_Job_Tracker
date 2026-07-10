import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAssessment, useAssessmentResults, useUpdateAssessmentStatus, useDeleteAssessment } from '../../../hooks/useAdminAssessments';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Edit, Trash2, ClipboardList, Clock, CheckCircle, XCircle,
  FileText, Tag, Calendar, Users, BarChart3, Award,
} from 'lucide-react';
import type { AssessmentResultResponse } from '../../../types';

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: 'Multiple Choice', TRUE_FALSE: 'True / False', SHORT_ANSWER: 'Short Answer', CODING: 'Coding',
};

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'border-l-amber-500 bg-amber-50 text-amber-700',
  PUBLISHED: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
  ARCHIVED: 'border-l-slate-400 bg-slate-50 text-slate-600',
};

function ResultRow({ r, rank }: { r: AssessmentResultResponse; rank: number }) {
  return (
    <tr>
      <td>
        <span className="text-sm font-medium text-slate-700">
          {rank <= 3 && (
            <Award className={`h-4 w-4 inline mr-1 ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-400' : 'text-amber-700'}`} />
          )}
          #{rank}
        </span>
      </td>
      <td>
        <span className="text-sm font-medium text-slate-900">{r.candidateName || `Candidate #${r.candidateId}`}</span>
      </td>
      <td><span className="text-sm text-slate-700">{r.score}/{r.totalMarks}</span></td>
      <td><span className="text-sm text-slate-700">{r.percentage.toFixed(1)}%</span></td>
      <td>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border-l-2 ${r.passed ? 'border-l-emerald-500 bg-emerald-50 text-emerald-700' : 'border-l-red-500 bg-red-50 text-red-700'}`}>
          {r.passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {r.passed ? 'Passed' : 'Failed'}
        </span>
      </td>
      <td><span className="text-sm text-slate-500">{r.attemptDuration}</span></td>
    </tr>
  );
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assessmentId = id ? Number(id) : null;
  const { data: assessment, isLoading, isFetched } = useAdminAssessment(assessmentId);
  const { data: results } = useAssessmentResults(assessmentId);
  const updateStatus = useUpdateAssessmentStatus();
  const deleteMutation = useDeleteAssessment();

  const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePublish = async () => {
    if (!assessmentId) return;
    try {
      await updateStatus.mutateAsync({ id: assessmentId, status: 'PUBLISHED' });
      toast('Assessment published', 'success');
    } catch { toast('Failed to publish', 'error'); }
  };

  const handleDelete = async () => {
    if (!assessmentId) return;
    try {
      await deleteMutation.mutateAsync(assessmentId);
      toast('Assessment deleted', 'success');
      navigate('/admin/assessments');
    } catch { toast('Failed to delete', 'error'); }
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 border border-slate-200" />
      </div>
    );
  }

  if (isFetched && !assessment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-red-50 border border-red-200">
          <ClipboardList className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Assessment not found</p>
        <Button onClick={() => navigate('/admin/assessments')}><ArrowLeft className="h-4 w-4" />Back to Assessments</Button>
      </div>
    );
  }

  if (!assessment) return null;

  const passedCount = results?.filter(r => r.passed).length || 0;
  const failedCount = results ? results.length - passedCount : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/assessments')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{assessment.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Assessment details and results</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {assessment.status === 'DRAFT' && (
            <Button onClick={handlePublish} loading={updateStatus.isPending}>
              <CheckCircle className="h-4 w-4" />Publish
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(`/admin/assessments/${assessment.id}/edit`)}>
            <Edit className="h-4 w-4" />Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4" />Delete
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border-l-2 ${STATUS_BADGE[assessment.status] || 'border-l-slate-300 bg-slate-50 text-slate-600'}`}>
              {assessment.status}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />{assessment.duration} min
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <FileText className="h-3 w-3" />{assessment.questionCount} questions
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Award className="h-3 w-3" />Pass: {assessment.passingMarks}/{assessment.totalMarks}
            </span>
            {assessment.deadline && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />Due {new Date(assessment.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {assessment.description && (
          <div className="px-4 py-3 border-b border-slate-200 text-sm text-slate-600">{assessment.description}</div>
        )}

        {assessment.instructions && (
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Instructions</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{assessment.instructions}</p>
          </div>
        )}

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'questions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <FileText className="h-3.5 w-3.5" />Questions
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2.5 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'results' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <BarChart3 className="h-3.5 w-3.5" />Results {results ? `(${results.length})` : ''}
          </button>
        </div>

        {activeTab === 'questions' && (
          <div className="divide-y divide-slate-100">
            {(!assessment.questions || assessment.questions.length === 0) ? (
              <div className="p-8 text-center text-sm text-slate-500">No questions added yet.</div>
            ) : (
              assessment.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          <Tag className="h-3 w-3" />{QUESTION_TYPE_LABELS[q.questionType] || q.questionType}
                        </span>
                        <span className="text-xs text-slate-500">{q.marks} marks</span>
                        {q.correctAnswer && (
                          <span className="text-xs text-emerald-600">Answer: {q.correctAnswer}</span>
                        )}
                      </div>
                      {q.questionType === 'MCQ' && q.options && (
                        <div className="mt-2 space-y-1">
                          {(() => { try { return JSON.parse(q.options).map((opt: string, i: number) => (
                            <div key={i} className={`text-xs px-2.5 py-1 ${opt === q.correctAnswer ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                              {opt} {opt === q.correctAnswer && '(Correct)'}
                            </div>
                          )); } catch { return null; }})()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            {results && results.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3 p-4 border-b border-slate-200">
                <div className="bg-slate-50 border border-slate-200 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900 tracking-tight">{results.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Attempts</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-700 tracking-tight">{passedCount}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Passed</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 text-center">
                  <p className="text-xl font-bold text-red-700 tracking-tight">{failedCount}</p>
                  <p className="text-xs text-red-600 mt-0.5">Failed</p>
                </div>
              </div>
            )}

            {!results || results.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No results yet. Results will appear after candidates complete this assessment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full admin-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Score</th>
                      <th>%</th>
                      <th>Result</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => <ResultRow key={r.id} r={r} rank={idx + 1} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Assessment">
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{assessment.title}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
