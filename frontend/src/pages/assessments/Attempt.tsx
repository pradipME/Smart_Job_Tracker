import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMyAssessments, useStartAssessment, useSubmitAssessment } from '../../hooks/useCandidateAssessments';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import {
  Clock, AlertCircle, Send, ChevronLeft, ChevronRight, CheckCircle, XCircle,
} from 'lucide-react';
import type { AttemptResponse, QuestionResponse, SubmitResponse } from '../../types';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getOptionsArray(options: string | null): string[] {
  if (!options) return [];
  try { return JSON.parse(options); } catch { return []; }
}

export default function AssessmentAttempt() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const appAssessmentId = id ? Number(id) : null;

  const { data: attempts, isLoading: loadingList } = useMyAssessments();
  const startMutation = useStartAssessment();
  const submitMutation = useSubmitAssessment();

  const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initAttempt = useCallback(async () => {
    if (!appAssessmentId) return;

    // Find existing attempt in cache
    const existing = attempts?.find(a => a.id === appAssessmentId);
    if (existing && (existing.status === 'IN_PROGRESS' || existing.status === 'COMPLETED' || existing.status === 'TIMEOUT')) {
      setAttempt(existing);
      if (existing.questions) setQuestions(existing.questions);
      return;
    }

    try {
      const res = await startMutation.mutateAsync(appAssessmentId);
      setAttempt(res.data);
      if (res.data.questions) setQuestions(res.data.questions);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to start assessment', 'error');
      navigate('/assessments');
    }
  }, [appAssessmentId, attempts, startMutation, toast, navigate]);

  const initAttemptRef = useRef(initAttempt);
  initAttemptRef.current = initAttempt;

  useEffect(() => {
    if (!loadingList) initAttemptRef.current();
  }, [loadingList]);

  const handleAutoSubmit = useCallback(async () => {
    if (!appAssessmentId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await submitMutation.mutateAsync({
        id: appAssessmentId,
        data: { answers: Object.entries(answers).map(([qId, answerText]) => ({ questionId: Number(qId), answerText })) },
      });
      setResult(res.data);
      toast('Time expired! Assessment auto-submitted.', 'warning');
    } catch {
      toast('Failed to auto-submit. Please contact support.', 'error');
    }
  }, [appAssessmentId, answers, submitMutation, toast]);

  const handleAutoSubmitRef = useRef(handleAutoSubmit);
  handleAutoSubmitRef.current = handleAutoSubmit;

  // Timer
  useEffect(() => {
    if (attempt?.status === 'IN_PROGRESS' && attempt.startedAt && attempt.duration) {
      const started = new Date(attempt.startedAt).getTime();
      const durationMs = attempt.duration * 60 * 1000;
      const updateTimer = () => {
        const elapsed = Date.now() - started;
        const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));

        if (remaining <= 0) {
          setTimeLeft(0);
          handleAutoSubmitRef.current();
          return;
        }
        setTimeLeft(remaining);
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [attempt?.status, attempt?.startedAt, attempt?.duration]);

  const handleSubmit = async () => {
    if (!appAssessmentId) return;
    setSubmitting(true);
    try {
      const res = await submitMutation.mutateAsync({
        id: appAssessmentId,
        data: { answers: Object.entries(answers).map(([qId, answerText]) => ({ questionId: Number(qId), answerText })) },
      });
      setResult(res.data);
      setShowSubmitModal(false);
      toast('Assessment submitted successfully!', 'success');
    } catch {
      toast('Failed to submit assessment', 'error');
    }
    setSubmitting(false);
  };

  const answeredCount = Object.keys(answers).length;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow text-center">
          <div className="flex justify-center mb-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${result.passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {result.passed ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
            </div>
          </div>
          <h2 className="text-xl font-bold mb-1">{result.passed ? 'Congratulations!' : 'Assessment Complete'}</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            {result.passed ? 'You passed the assessment' : 'You did not pass this time'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="heading-2">{result.score}/{result.totalMarks}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Score</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="heading-2">{result.percentage.toFixed(0)}%</p>
              <p className="text-xs text-[var(--muted-foreground)]">Percentage</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="heading-2">{result.correctCount}/{result.totalQuestions}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Correct</p>
            </div>
          </div>

          <div className="space-y-2 mb-6 text-left">
            {result.answerResults.map((ar) => (
              <div key={ar.questionId} className={`rounded-xl border p-3 ${ar.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start gap-2">
                  {ar.isCorrect ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{ar.questionText}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Your answer: {ar.yourAnswer || '(empty)'}</p>
                    {!ar.isCorrect && <p className="text-xs text-emerald-600">Correct: {ar.correctAnswer}</p>}
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{ar.marksObtained}/{ar.marks} marks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => navigate('/assessments')}>Back to Assessments</Button>
        </div>
      </div>
    );
  }

  if (loadingList || !attempt) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // If already completed
  if (attempt.status === 'COMPLETED' || attempt.status === 'TIMEOUT') {
    navigate(`/assessments/${appAssessmentId}/result`);
    return null;
  }

  const q = questions[currentQuestion];
  const options = q ? getOptionsArray(q.options) : [];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Timer bar */}
      <div className={`sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 mb-6 border-b transition-all duration-200 ${
        timeLeft < 60 ? 'bg-red-500/5 border-red-500/20' : 'bg-[var(--card)]/80 border-[var(--border)]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[var(--muted-foreground)]'}`} />
            <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span>{answeredCount}/{questions.length} answered</span>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${timeLeft < 60 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((qItem, idx) => (
            <button
              key={qItem.id}
              onClick={() => setCurrentQuestion(idx)}
              className={`h-7 w-7 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                idx === currentQuestion ? 'bg-blue-500 text-white' :
                answers[qItem.id] ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Current question */}
        {q && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                {currentQuestion + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-relaxed">{q.questionText}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {q.questionType === 'MCQ' ? 'Select one option' :
                   q.questionType === 'TRUE_FALSE' ? 'Select True or False' :
                   'Type your answer'} &middot; {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                </p>
              </div>
            </div>

            {(q.questionType === 'MCQ' || q.questionType === 'TRUE_FALSE') ? (
              <div className="space-y-2">
                {q.questionType === 'TRUE_FALSE' ? (
                  <>
                    <OptionButton text="True" selected={answers[q.id] === 'true'} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'true' }))} />
                    <OptionButton text="False" selected={answers[q.id] === 'false'} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'false' }))} />
                  </>
                ) : (
                  options.map((opt, oi) => (
                    <OptionButton key={oi} text={opt} selected={answers[q.id] === opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))} />
                  ))
                )}
              </div>
            ) : (
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                rows={4}
                placeholder="Type your answer here..."
                className="flex w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-150 resize-none"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
              <Button size="sm" variant="secondary" onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))} disabled={currentQuestion === 0}>
                <ChevronLeft className="h-3.5 w-3.5" />Previous
              </Button>
              <div className="flex gap-2">
                {currentQuestion < questions.length - 1 ? (
                  <Button size="sm" onClick={() => setCurrentQuestion(p => p + 1)}>
                    Next<ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setShowSubmitModal(true)} disabled={submitting}>
                    <Send className="h-3.5 w-3.5" />Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit confirmation */}
      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assessment">
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            You have answered <span className="font-semibold text-[var(--foreground)]">{answeredCount}</span> of <span className="font-semibold">{questions.length}</span> questions.
          </p>
          {answeredCount < questions.length && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {questions.length - answeredCount} question{(questions.length - answeredCount) !== 1 ? 's' : ''} unanswered. You can still review before submitting.
            </div>
          )}
          <p className="text-sm text-[var(--muted-foreground)]">Once submitted, you cannot change your answers.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>Review</Button>
            <Button onClick={handleSubmit} loading={submitting}><Send className="h-4 w-4" />Submit Now</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OptionButton({ text, selected, onClick }: { text: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-150 cursor-pointer ${
        selected
          ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30'
          : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted-foreground)]/30 hover:bg-[var(--accent)]/50'
      }`}
    >
      {text}
    </button>
  );
}
