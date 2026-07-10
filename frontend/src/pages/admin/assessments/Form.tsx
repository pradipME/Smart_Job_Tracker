import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAssessment, useCreateAssessment, useUpdateAssessment } from '../../../hooks/useAdminAssessments';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/ui/Toast';
import {
  ArrowLeft, Plus, Trash2, ClipboardList, Save, FileText, Award, HelpCircle, Clock,
} from 'lucide-react';
import type { QuestionRequest, QuestionType, AssessmentRequest } from '../../../types';

function FormSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-50 text-violet-600"><Icon className="h-3.5 w-3.5" /></div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function parseOptions(options: string): string[] {
  if (!options) return ['', '', '', ''];
  try { const parsed = JSON.parse(options); return Array.isArray(parsed) ? parsed : ['', '', '', '']; }
  catch { return options.split('\n').filter(Boolean); }
}

function stringifyOptions(opts: string[]): string {
  return JSON.stringify(opts.filter(Boolean));
}

const emptyQuestion: QuestionRequest = {
  questionText: '', questionType: 'MCQ', options: '["","","",""]',
  correctAnswer: '', marks: 1, orderIndex: 0,
};

export default function AssessmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const { data: existing, isLoading } = useAdminAssessment(isEdit ? Number(id) : null);
  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState<QuestionRequest[]>([{ ...emptyQuestion }]);

  useEffect(() => {
    if (isEdit && existing) {
      setTitle(existing.title);
      setDescription(existing.description || '');
      setDuration(existing.duration);
      setTotalMarks(existing.totalMarks);
      setPassingMarks(existing.passingMarks);
      setDeadline(existing.deadline ? existing.deadline.slice(0, 10) : '');
      setInstructions(existing.instructions || '');
      if (existing.questions && existing.questions.length > 0) {
        setQuestions(existing.questions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType as QuestionType,
          options: q.options || '',
          correctAnswer: q.correctAnswer || '',
          marks: q.marks,
          orderIndex: q.orderIndex,
        })));
      }
    }
  }, [isEdit, existing]);

  const updateQuestion = (idx: number, field: keyof QuestionRequest, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { ...emptyQuestion, orderIndex: prev.length }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const recalcMarks = (qs: QuestionRequest[]) => qs.reduce((sum, q) => sum + (q.marks || 0), 0);

  const handleSubmit = async () => {
    if (!title.trim()) { toast('Title is required', 'error'); return; }
    if (questions.some(q => !q.questionText.trim())) { toast('All questions must have text', 'error'); return; }
    const computedTotal = recalcMarks(questions);
    const payload: AssessmentRequest & { questions: QuestionRequest[] } = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration, passingMarks, totalMarks: computedTotal,
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
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to save', 'error');
    }
  };

  if (isEdit && isLoading) {
    return <div className="space-y-6 animate-pulse">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}</div>;
  }

  const computedTotal = recalcMarks(questions);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-5">
        <button onClick={() => navigate('/admin/assessments')} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit Assessment' : 'Create Assessment'}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{isEdit ? 'Update assessment details and questions' : 'Create a new assessment for candidates'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <FormSection icon={ClipboardList} title="Assessment Details">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Technical Screening Round 1"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the purpose of this assessment..."
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Duration (minutes) *</label>
                <input type="number" value={duration} onChange={e => setDuration(Math.max(1, Number(e.target.value)))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Passing Marks</label>
                <input type="number" value={passingMarks} onChange={e => setPassingMarks(Math.min(Number(e.target.value), computedTotal))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Deadline</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Instructions</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={3} placeholder="Instructions for candidates..."
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none" />
            </div>
          </div>
        </FormSection>

        <FormSection icon={HelpCircle} title="Questions">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Marks: <strong className="text-slate-900">{computedTotal}</strong></span>
              <Button size="sm" onClick={addQuestion}><Plus className="h-3.5 w-3.5" /> Add Question</Button>
            </div>
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 text-xs font-bold">{idx + 1}</span>
                    <select value={q.questionType} onChange={e => updateQuestion(idx, 'questionType', e.target.value as QuestionType)}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                      <option value="MCQ">Multiple Choice</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                      <option value="CODING">Coding</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500"><Award className="h-3 w-3" />
                      <input type="number" value={q.marks} min={1} onChange={e => updateQuestion(idx, 'marks', Math.max(1, Number(e.target.value)))}
                        className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-center focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
                    </div>
                    <button onClick={() => removeQuestion(idx)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <textarea value={q.questionText} onChange={e => updateQuestion(idx, 'questionText', e.target.value)} rows={2}
                  placeholder="Enter question text..."
                  className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none" />
                {q.questionType === 'MCQ' && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Options (one per line)</label>
                    <textarea value={parseOptions(q.options ?? '').join('\n')}
                      onChange={e => updateQuestion(idx, 'options', stringifyOptions(e.target.value.split('\n')).toString())}
                      rows={3} placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"
                      className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">
                    {q.questionType === 'MCQ' ? 'Correct Answer (exact text)' :
                     q.questionType === 'TRUE_FALSE' ? 'Correct Answer' : 'Correct Answer'}
                  </label>
                  {q.questionType === 'TRUE_FALSE' ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => updateQuestion(idx, 'correctAnswer', 'true')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${q.correctAnswer === 'true' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>True</button>
                      <button type="button" onClick={() => updateQuestion(idx, 'correctAnswer', 'false')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${q.correctAnswer === 'false' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>False</button>
                    </div>
                  ) : (
                    <input value={q.correctAnswer || ''} onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                      placeholder="Enter the correct answer"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/assessments')}>Cancel</Button>
          <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4" /> {isEdit ? 'Update Assessment' : 'Create Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
