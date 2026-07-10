import { useParams, useNavigate } from 'react-router-dom';
import { useAssessmentResult } from '../../hooks/useCandidateAssessments';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  CheckCircle, XCircle, ArrowLeft,
} from 'lucide-react';

export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appAssessmentId = id ? Number(id) : null;

  const { data, isLoading, isError } = useAssessmentResult(appAssessmentId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-14 w-32 rounded-lg" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
        </div>
        <h2 className="text-lg font-bold">Result not found</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">This assessment result could not be loaded.</p>
        <Button onClick={() => navigate('/assessments')}>Back to Assessments</Button>
      </div>
    );
  }

  const result = data;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/assessments')} className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />Back to Assessments
      </button>

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

        {result.answerResults && result.answerResults.length > 0 && (
          <div className="space-y-2 mb-6 text-left">
            <h3 className="text-sm font-semibold mb-3">Question Review</h3>
            {result.answerResults.map((ar) => (
              <div key={ar.questionId} className={`rounded-xl border p-3 ${ar.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start gap-2">
                  {ar.isCorrect ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{ar.questionText}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Your answer: {ar.yourAnswer || '(empty)'}</p>
                    {!ar.isCorrect && <p className="text-xs text-emerald-600">Correct answer: {ar.correctAnswer}</p>}
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{ar.marksObtained}/{ar.marks} marks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
