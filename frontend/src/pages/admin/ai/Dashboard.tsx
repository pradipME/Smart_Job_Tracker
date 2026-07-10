import { useState } from 'react';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  Upload, FileText, MessageSquare, BarChart3, HelpCircle, FileEdit, Target,
  Sparkles, CheckCircle, XCircle, AlertCircle, Star, BookOpen, Lightbulb,
  TrendingUp, UserCheck, Briefcase, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  useParseResume, useMatchResume, useRecruiterSummary, useRankCandidates,
  useGenerateQuestions, useReviewCoverLetter, useSkillGap,
} from '../../../hooks/useAi';
import type {
  ParseResumeResponse, MatchResumeResponse, RecruiterSummaryResponse,
  RankCandidatesResponse, GenerateQuestionsResponse, CoverLetterReviewResponse, SkillGapResponse,
} from '../../../types';

type Tab = 'parse' | 'match' | 'summary' | 'rank' | 'questions' | 'coverLetter' | 'skillGap';

const TABS: { id: Tab; label: string; icon: typeof Upload }[] = [
  { id: 'parse', label: 'Resume Parsing', icon: Upload },
  { id: 'match', label: 'Resume Match', icon: FileText },
  { id: 'summary', label: 'AI Summary', icon: MessageSquare },
  { id: 'rank', label: 'Ranking', icon: BarChart3 },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'coverLetter', label: 'Cover Letter', icon: FileEdit },
  { id: 'skillGap', label: 'Skill Gap', icon: Target },
];

function AiCard({ title, icon, subtitle, children }: { title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-slate-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-3 w-32" />
        <div className="space-y-2 w-full max-w-xs">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p className="text-sm font-medium text-red-600 mb-1">AI Service Error</p>
      <p className="text-xs text-slate-500 mb-3">{message}</p>
      {onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

function SkillBadge({ skill, match }: { skill: string; match?: 'has' | 'missing' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${
      match === 'has' ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : match === 'missing' ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-blue-200 bg-blue-50 text-blue-700'
    }`}>
      {match === 'has' && <CheckCircle className="h-3 w-3" />}
      {match === 'missing' && <XCircle className="h-3 w-3" />}
      {skill}
    </span>
  );
}

function ProgressCircle({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

function ExpandableSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
        {title}
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && <div className="px-4 py-3 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function TabParseResume() {
  const { toast } = useToast();
  const mutation = useParseResume();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParseResumeResponse | null>(null);

  const handleUpload = async () => {
    if (!file) { toast('Please select a PDF file', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync(file);
      setResult(res.data);
      toast('Resume parsed successfully', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to parse resume', 'error');
    }
  };

  return (
    <AiCard title="Resume Parsing" icon={<Upload className="h-4 w-4" />}
      subtitle="Upload a PDF resume to extract structured information">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 text-sm file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-sm file:font-medium file:cursor-pointer hover:file:bg-slate-50" />
          <Button size="sm" onClick={handleUpload} loading={mutation.isPending}>Analyze</Button>
        </div>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Parse failed'} onRetry={handleUpload} />}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Candidate Name</p>
                <p className="text-sm font-semibold text-slate-900">{result.name}</p>
              </div>
            </div>

            <ExpandableSection title={`Skills (${result.skills?.length || 0})`}>
              <div className="flex flex-wrap gap-1.5">
                {result.skills?.map((s, i) => <SkillBadge key={i} skill={s} />)}
                {(!result.skills || result.skills.length === 0) && <p className="text-xs text-slate-400 italic">No skills found</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Technologies (${result.technologies?.length || 0})`}>
              <div className="flex flex-wrap gap-1.5">
                {result.technologies?.map((t, i) => <SkillBadge key={i} skill={t} />)}
                {(!result.technologies || result.technologies.length === 0) && <p className="text-xs text-slate-400 italic">No technologies found</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Education (${result.education?.length || 0})`}>
              <div className="space-y-1.5">
                {result.education?.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-sm text-slate-700">{e}</span>
                  </div>
                ))}
                {(!result.education || result.education.length === 0) && <p className="text-xs text-slate-400 italic">No education found</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Experience (${result.experience?.length || 0})`}>
              <div className="space-y-1.5">
                {result.experience?.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{e}</span>
                    </div>
                  </div>
                ))}
                {(!result.experience || result.experience.length === 0) && <p className="text-xs text-slate-400 italic">No experience found</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Projects (${result.projects?.length || 0})`}>
              <div className="space-y-1.5">
                {result.projects?.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{p}</span>
                    </div>
                  </div>
                ))}
                {(!result.projects || result.projects.length === 0) && <p className="text-xs text-slate-400 italic">No projects found</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Certificates (${result.certificates?.length || 0})`}>
              <div className="space-y-1.5">
                {result.certificates?.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <Star className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm text-slate-700">{c}</span>
                  </div>
                ))}
                {(!result.certificates || result.certificates.length === 0) && <p className="text-xs text-slate-400 italic">No certificates found</p>}
              </div>
            </ExpandableSection>
          </div>
        )}
      </div>
    </AiCard>
  );
}

function TabMatchResume() {
  const { toast } = useToast();
  const mutation = useMatchResume();
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<MatchResumeResponse | null>(null);

  const handleMatch = async () => {
    if (!resumeText || !jobDesc) { toast('Please provide both resume text and job description', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync({ resumeText, jobDescription: jobDesc });
      setResult(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Match failed', 'error');
    }
  };

  return (
    <AiCard title="Resume Match" icon={<FileText className="h-4 w-4" />}
      subtitle="Compare resume against job description">
      <div className="space-y-4">
        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={4}
          placeholder="Paste resume text here..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4}
          placeholder="Paste job description here..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <Button onClick={handleMatch} loading={mutation.isPending} className="w-full">
          <Sparkles className="h-4 w-4" /> Analyze Match
        </Button>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Match failed'} onRetry={handleMatch} />}

        {result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 p-5 rounded-lg border border-slate-200 bg-slate-50">
              <ProgressCircle value={result.matchPercentage} size={100} strokeWidth={8} />
              <p className="text-xs text-slate-500">Match Score</p>
            </div>

            <ExpandableSection title={`Strengths (${result.strengths?.length || 0})`}>
              <div className="space-y-1.5">
                {result.strengths?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Weaknesses (${result.weaknesses?.length || 0})`}>
              <div className="space-y-1.5">
                {result.weaknesses?.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{w}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Missing Skills (${result.missingSkills?.length || 0})`}>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills?.map((s, i) => <SkillBadge key={i} skill={s} match="missing" />)}
              </div>
            </ExpandableSection>
          </div>
        )}
      </div>
    </AiCard>
  );
}

function TabRecruiterSummary() {
  const { toast } = useToast();
  const mutation = useRecruiterSummary();
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<RecruiterSummaryResponse | null>(null);

  const handleGenerate = async () => {
    if (!resumeText) { toast('Please provide resume text', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync({ resumeText, jobDescription: jobDesc });
      setResult(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Generation failed', 'error');
    }
  };

  return (
    <AiCard title="AI Recruiter Summary" icon={<MessageSquare className="h-4 w-4" />}
      subtitle="Generate 2-3 paragraph professional summary">
      <div className="space-y-4">
        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={4}
          placeholder="Paste resume text..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={3}
          placeholder="Paste job description (optional)..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <Button onClick={handleGenerate} loading={mutation.isPending} className="w-full">
          <Sparkles className="h-4 w-4" /> Generate Summary
        </Button>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Generation failed'} onRetry={handleGenerate} />}

        {result && (
          <div className="p-5 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recruiter Assessment</p>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.summary}</div>
          </div>
        )}
      </div>
    </AiCard>
  );
}

function TabRankCandidates() {
  const { toast } = useToast();
  const mutation = useRankCandidates();
  const [jobDesc, setJobDesc] = useState('');
  const [candidates, setCandidates] = useState([{ id: 1, name: '', resumeText: '' }]);
  const [result, setResult] = useState<RankCandidatesResponse | null>(null);

  const addCandidate = () => setCandidates(c => [...c, { id: c.length + 1, name: '', resumeText: '' }]);
  const removeCandidate = (idx: number) => setCandidates(c => c.filter((_, i) => i !== idx));
  const updateCandidate = (idx: number, field: 'name' | 'resumeText', value: string) =>
    setCandidates(c => c.map((cd, i) => i === idx ? { ...cd, [field]: value } : cd));

  const handleRank = async () => {
    if (!jobDesc) { toast('Please provide a job description', 'warning'); return; }
    if (candidates.some(c => !c.name || !c.resumeText)) { toast('Please fill in all candidate fields', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync({ jobDescription: jobDesc, candidates });
      setResult(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Ranking failed', 'error');
    }
  };

  return (
    <AiCard title="Candidate Ranking" icon={<BarChart3 className="h-4 w-4" />}
      subtitle="AI-powered candidate ranking for any job">
      <div className="space-y-4">
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={3}
          placeholder="Paste job description..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Candidates ({candidates.length})</p>
            <Button size="sm" variant="ghost" onClick={addCandidate}>+ Add</Button>
          </div>
          {candidates.map((c, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">#{c.id}</span>
                {candidates.length > 1 && (
                  <button onClick={() => removeCandidate(idx)} className="text-xs text-red-500 hover:text-red-600 cursor-pointer">Remove</button>
                )}
              </div>
              <input type="text" value={c.name} onChange={(e) => updateCandidate(idx, 'name', e.target.value)}
                placeholder="Candidate name"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
              <textarea value={c.resumeText} onChange={(e) => updateCandidate(idx, 'resumeText', e.target.value)} rows={2}
                placeholder="Paste resume text..."
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
            </div>
          ))}
        </div>

        <Button onClick={handleRank} loading={mutation.isPending} className="w-full">
          <TrendingUp className="h-4 w-4" /> Rank Candidates
        </Button>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Ranking failed'} onRetry={handleRank} />}

        {result?.rankedCandidates && result.rankedCandidates.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ranked Results</p>
            {result.rankedCandidates.map((rc, idx) => (
              <div key={rc.id} className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center font-bold text-sm rounded-lg border ${
                    idx === 0 ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : idx < 3 ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>#{idx + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{rc.name}</p>
                    <p className="text-xs text-slate-500">{rc.reasoning}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ProgressCircle value={rc.score} size={48} strokeWidth={4} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AiCard>
  );
}

function TabGenerateQuestions() {
  const { toast } = useToast();
  const mutation = useGenerateQuestions();
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<GenerateQuestionsResponse | null>(null);

  const handleGenerate = async () => {
    if (!jobDesc) { toast('Please provide a job description', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync({ resumeText, jobDescription: jobDesc });
      setResult(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Generation failed', 'error');
    }
  };

  return (
    <AiCard title="AI Interview Questions" icon={<HelpCircle className="h-4 w-4" />}
      subtitle="Generate technical, behavioral, and HR questions">
      <div className="space-y-4">
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={3}
          placeholder="Paste job description..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={3}
          placeholder="Paste resume text (optional)..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <Button onClick={handleGenerate} loading={mutation.isPending} className="w-full">
          <Sparkles className="h-4 w-4" /> Generate Questions
        </Button>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Generation failed'} onRetry={handleGenerate} />}

        {result?.questions && (
          <div className="space-y-3">
            {(['technical', 'behavioral', 'hr'] as const).map(cat => (
              <div key={cat} className="rounded-lg border border-slate-200 overflow-hidden">
                <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${
                  cat === 'technical' ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : cat === 'behavioral' ? 'bg-violet-50 text-violet-700 border-violet-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>{cat} Questions</div>
                <div className="p-3 space-y-1.5">
                  {result.questions[cat]?.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 transition-colors rounded-lg">
                      <span className="text-xs font-medium text-slate-400 shrink-0 mt-0.5">{i + 1}.</span>
                      <span className="text-sm text-slate-700">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AiCard>
  );
}

function TabCoverLetterReview() {
  const { toast } = useToast();
  const mutation = useReviewCoverLetter();
  const [coverLetter, setCoverLetter] = useState('');
  const [result, setResult] = useState<CoverLetterReviewResponse | null>(null);

  const handleReview = async () => {
    if (!coverLetter) { toast('Please paste a cover letter', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync(coverLetter);
      setResult(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Review failed', 'error');
    }
  };

  return (
    <AiCard title="Cover Letter Review" icon={<FileEdit className="h-4 w-4" />}
      subtitle="AI grammar, professionalism, and suggestions">
      <div className="space-y-4">
        <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={6}
          placeholder="Paste cover letter here..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <Button onClick={handleReview} loading={mutation.isPending} className="w-full">
          <Sparkles className="h-4 w-4" /> Review Cover Letter
        </Button>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Review failed'} onRetry={handleReview} />}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-100">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-slate-500">Professionalism Score</p>
                <p className="text-sm font-semibold text-slate-900">{result.professionalismScore}</p>
              </div>
            </div>

            <ExpandableSection title={`Grammar Issues (${result.grammarIssues?.length || 0})`}>
              <div className="space-y-1.5">
                {result.grammarIssues?.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{g}</span>
                  </div>
                ))}
                {(!result.grammarIssues || result.grammarIssues.length === 0) && <p className="text-xs text-slate-400 italic">No grammar issues found</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Suggestions (${result.suggestions?.length || 0})`}>
              <div className="space-y-1.5">
                {result.suggestions?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    <Lightbulb className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          </div>
        )}
      </div>
    </AiCard>
  );
}

function TabSkillGap() {
  const { toast } = useToast();
  const mutation = useSkillGap();
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<SkillGapResponse | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText || !jobDesc) { toast('Please provide both resume and job description', 'warning'); return; }
    try {
      const res = await mutation.mutateAsync({ resumeText, jobDescription: jobDesc });
      setResult(res.data);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Analysis failed', 'error');
    }
  };

  return (
    <AiCard title="Skill Gap Analysis" icon={<Target className="h-4 w-4" />}
      subtitle="Compare skills and get learning recommendations">
      <div className="space-y-4">
        <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={4}
          placeholder="Paste resume text..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4}
          placeholder="Paste job description..."
          className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
        <Button onClick={handleAnalyze} loading={mutation.isPending} className="w-full">
          <Target className="h-4 w-4" /> Analyze Skill Gap
        </Button>

        {mutation.isPending && <LoadingCard />}
        {mutation.isError && <ErrorCard message={mutation.error?.message || 'Analysis failed'} onRetry={handleAnalyze} />}

        {result && (
          <div className="space-y-3">
            <ExpandableSection title={`Missing Skills (${result.missingSkills?.length || 0})`}>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills?.map((s, i) => <SkillBadge key={i} skill={s} match="missing" />)}
                {(!result.missingSkills || result.missingSkills.length === 0) && <p className="text-xs text-slate-400 italic">No missing skills identified</p>}
              </div>
            </ExpandableSection>

            <ExpandableSection title={`Learning Recommendations (${result.recommendations?.length || 0})`}>
              <div className="space-y-1.5">
                {result.recommendations?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <BookOpen className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{r}</span>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          </div>
        )}
      </div>
    </AiCard>
  );
}

export default function AiDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('parse');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">AI Recruitment Intelligence</h1>
        <p className="text-sm text-slate-500 mt-0.5">Powered by OpenAI &mdash; Analyze, match, and rank candidates</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-lg transition-all ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'parse' && <TabParseResume />}
      {activeTab === 'match' && <TabMatchResume />}
      {activeTab === 'summary' && <TabRecruiterSummary />}
      {activeTab === 'rank' && <TabRankCandidates />}
      {activeTab === 'questions' && <TabGenerateQuestions />}
      {activeTab === 'coverLetter' && <TabCoverLetterReview />}
      {activeTab === 'skillGap' && <TabSkillGap />}
    </div>
  );
}
