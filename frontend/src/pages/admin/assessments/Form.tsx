import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAssessment, useCreateAssessment, useUpdateAssessment } from '../../../hooks/useAdminAssessments';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Plus, Trash2, GripVertical, ClipboardList, Save, FileText,
  Award, HelpCircle, Clock,
} from 'lucide-react';
import type { QuestionRequest, QuestionType, AssessmentRequest } from '../../../types';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE', label: 'True / False' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'CODING', label: 'Coding (Future)' },
];

function emptyQuestion(orderIndex: number): QuestionRequest {
  return { questionText: '', questionType: 'MCQ', options: '', correctAnswer: '', marks: 5, orderIndex };
}

function parseOptions(options: string): string[] {
  if (!options) return ['', '', '', ''];
  try { const parsed = JSON.parse(options); return Array.isArray(parsed) ? parsed : ['', '', '', '']; }
  catch { return options.split('\n').filter(Boolean); }
}

function stringifyOptions(opts: string[]): string {
  return JSON.stringify(opts.filter(Boolean));
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
        <div className="flex h-6 w-6 items-center justify-center bg-indigo-100 text-indigo-600">
          {icon}
        </div>
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function AssessmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: existing, isLoading: loadingExisting } = useAdminAssessment(isEdit ? Number(id) : null);
  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingMarks, setPassingMarks] = useState(40);
  const [totalMarks, setTotalMarks] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState<QuestionRequest[]>([emptyQuestion(0)]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description || '');
      setDuration(existing.duration);
      setPassingMarks(existing.passingMarks);
      setTotalMarks(existing.totalMarks);
      setDeadline(existing.deadline || '');
      setInstructions(existing.instructions || '');
      if (existing.questions && existing.questions.length > 0) {
        setQuestions(existing.questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || '',
          correctAnswer: q.correctAnswer || '',
          marks: q.marks,
          orderIndex: q.orderIndex,
        })));
      }
    }
  }, [existing]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, emptyQuestion(prev.length)]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i })));
  };

  const updateQuestion = (idx: number, field: keyof QuestionRequest, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast('Title is required', 'error'); return; }
    if (questions.some(q => !q.questionText.trim())) { toast('All questions need text', 'error'); return; }
    if (duration < 1) { toast('Duration must be at least 1 minute', 'error'); return; }

    const payload: AssessmentRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration,
      passingMarks: Math.min(passingMarks, totalMarks),
      totalMarks,
      deadline: deadline || undefined,
      instructions: instructions.trim() || undefined,
      status: isEdit ? existing?.status : undefined,
      questions: questions.map(q => ({
        ...q,
        options: q.questionType === 'MCQ' ? stringifyOptions(parseOptions(q.options ?? '')) : undefined,
        correctAnswer: q.questionType === 'TRUE_FALSE' ? (q.correctAnswer === 'true' ? 'true' : 'false') : q.correctAnswer,
      })),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), data: payload });
        toast('Assessment updated', 'success');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Assessment created', 'success');
      }
      navigate('/admin/assessments');
    } catch {
      toast(isEdit ? 'Failed to update assessment' : 'Failed to create assessment', 'error');
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/assessments')} className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Assessment' : 'New Assessment'}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? 'Update assessment details and questions' : 'Create a new assessment for candidates'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <FormSection title="Assessment Details" icon={<ClipboardList className="h-3.5 w-3.5" />}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Java Developer Assessment"
              className="w-full border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of the assessment"
              className="flex w-full border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Duration (minutes) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(Math.max(1, Number(e.target.value)))}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Scoring" icon={<Award className="h-3.5 w-3.5" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Total Marks <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={totalMarks}
                onChange={e => setTotalMarks(Math.max(1, Number(e.target.value)))}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Passing Marks <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={passingMarks}
                onChange={e => setPassingMarks(Math.max(1, Number(e.target.value)))}
                className="w-full border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Instructions" icon={<FileText className="h-3.5 w-3.5" />}>
          <div className="space-y-1.5">
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              rows={3}
              placeholder="Instructions for candidates taking this assessment..."
              className="flex w-full border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />
          </div>
        </FormSection>

        <FormSection title={`Questions (${questions.length})`} icon={<HelpCircle className="h-3.5 w-3.5" />}>
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-slate-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Q{idx + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="flex h-7 w-7 items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-1">
                    <textarea
                      value={q.questionText}
                      onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                      rows={2}
                      placeholder="Enter question text..."
                      className="flex w-full border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-500">Type</label>
                    <select
                      value={q.questionType}
                      onChange={e => updateQuestion(idx, 'questionType', e.target.value)}
                      className="w-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                    >
                      {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-slate-500">Marks</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={e => updateQuestion(idx, 'marks', Math.max(1, Number(e.target.value)))}
                      className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                  {q.questionType === 'MCQ' && (
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-medium text-slate-500">Options (one per line)</label>
                      <textarea
                        value={parseOptions(q.options ?? '').join('\n')}
                        onChange={e => updateQuestion(idx, 'options', stringifyOptions(e.target.value.split('\n')))}
                        rows={3}
                        placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                        className="flex w-full border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-medium text-slate-500">
                      {q.questionType === 'MCQ' ? 'Correct Answer (exact text of the correct option)' :
                       q.questionType === 'TRUE_FALSE' ? 'Correct Answer' :
                       'Correct Answer (for auto-grading)'}
                    </label>
                    {q.questionType === 'TRUE_FALSE' ? (
                      <select
                        value={q.correctAnswer}
                        onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                        className="w-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <input
                        value={q.correctAnswer}
                        onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                        placeholder="Correct answer"
                        className="w-full border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Question
            </button>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => navigate('/admin/assessments')}>Cancel</Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4" />
            {isEdit ? 'Update' : 'Create'} Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
