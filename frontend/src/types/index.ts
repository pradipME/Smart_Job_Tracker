export type JobStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface User {
  id: number;
  fullName: string;
  email: string;
}

export interface JobApplication {
  id: number;
  company: string;
  jobTitle: string;
  location: string;
  status: JobStatus;
  appliedDate: string;
  interviewDate: string | null;
  notes: string;
  user: User;
}

export interface JobRequest {
  company: string;
  jobTitle: string;
  location?: string;
  status: JobStatus;
  appliedDate?: string;
  interviewDate?: string | null;
  notes?: string;
}

export interface DashboardResponse {
  totalJobs: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export interface ResumeResponse {
  fileName: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string | null;
  role: string | null;
  fullName: string | null;
}

export type UserRole = 'ADMIN' | 'CANDIDATE';

export interface Company {
  id: number;
  name: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  companySize: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRequest {
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  location?: string;
  companySize?: string;
  description?: string;
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACT';
export type WorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type JobListingStatus = 'OPEN' | 'CLOSED' | 'DRAFT';

export interface JobListing {
  id: number;
  companyId: number;
  companyName: string;
  companyLogoUrl: string | null;
  title: string;
  description: string | null;
  location: string | null;
  experience: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  employmentType: EmploymentType | null;
  workMode: WorkMode | null;
  requiredSkills: string | null;
  openings: number | null;
  deadline: string | null;
  status: JobListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobListingRequest {
  companyId: number;
  title: string;
  description?: string;
  location?: string;
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  requiredSkills?: string;
  openings?: number;
  deadline?: string;
  status?: JobListingStatus;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'ASSESSMENT_ASSIGNED'
  | 'ASSESSMENT_COMPLETED'
  | 'INTERVIEW_SCHEDULED'
  | 'HR_ROUND'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  resumeUrl: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationRequest {
  jobId: number;
  resumeUrl: string;
  coverLetter?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AdminApplicationSummary {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  companyId: number;
  companyName: string;
  companyLogoUrl: string | null;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  resumeUrl: string;
}

export interface ApplicationHistoryEntry {
  id: number;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  comment: string | null;
}

export interface RecruiterNote {
  id: number;
  applicationId: number;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteRequest {
  content: string;
}

export interface StatusUpdateRequest {
  status: ApplicationStatus;
  comment?: string;
}

export interface AdminApplicationDetail {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  jobId: number;
  jobTitle: string;
  jobDescription: string | null;
  jobLocation: string | null;
  jobSalaryMin: number | null;
  jobSalaryMax: number | null;
  jobEmploymentType: string | null;
  jobWorkMode: string | null;
  jobExperience: string | null;
  jobRequiredSkills: string | null;
  companyId: number;
  companyName: string;
  companyLogoUrl: string | null;
  companyLocation: string | null;
  companyIndustry: string | null;
  resumeUrl: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  history: ApplicationHistoryEntry[];
  notes: RecruiterNote[];
}

export interface AdminDashboardStats {
  applicationsToday: number;
  pendingReview: number;
  interviewScheduled: number;
  selected: number;
  rejected: number;
  byStatus: { status: string; count: number }[];
  byCompany: { companyName: string; count: number }[];
  monthly: { year: number; month: number; count: number }[];
}

export type AssessmentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'CODING';
export type AttemptStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'TIMEOUT';

export interface QuestionRequest {
  questionText: string;
  questionType: QuestionType;
  options?: string;
  correctAnswer?: string;
  marks: number;
  orderIndex: number;
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  questionType: QuestionType;
  options: string | null;
  correctAnswer: string | null;
  marks: number;
  orderIndex: number;
}

export interface AssessmentRequest {
  title: string;
  description?: string;
  duration: number;
  passingMarks: number;
  totalMarks: number;
  deadline?: string;
  instructions?: string;
  status?: AssessmentStatus;
  jobId?: number;
  questions: QuestionRequest[];
}

export interface AssessmentResponse {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  passingMarks: number;
  totalMarks: number;
  deadline: string | null;
  instructions: string | null;
  status: AssessmentStatus;
  jobId: number | null;
  jobTitle: string | null;
  companyName: string | null;
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  questions: QuestionResponse[] | null;
}

export interface AttemptResponse {
  id: number;
  applicationId: number;
  assessmentId: number;
  assessmentTitle: string;
  assessmentDescription: string | null;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  deadline: string | null;
  instructions: string | null;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  questions: QuestionResponse[] | null;
}

export interface SubmitAnswerEntry {
  questionId: number;
  answerText: string;
}

export interface SubmitRequest {
  answers: SubmitAnswerEntry[];
}

export interface AnswerResult {
  questionId: number;
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksObtained: number;
  marks: number;
}

export interface SubmitResponse {
  attemptId: number;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string;
  answerResults: AnswerResult[];
}

export interface AssessmentResultResponse {
  id: number;
  applicationId: number;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  status: string;
  startedAt: string;
  submittedAt: string;
  attemptDuration: string;
}

export type InterviewMode = 'ONLINE' | 'OFFLINE' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type InterviewRound = 'TECHNICAL' | 'MANAGERIAL' | 'HR' | 'FINAL';

export interface InterviewRequest {
  applicationId: number;
  interviewerName: string;
  interviewerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: InterviewMode;
  meetingLink?: string;
  location?: string;
  round: InterviewRound;
}

export interface InterviewResponse {
  id: number;
  applicationId: number;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  interviewerName: string;
  interviewerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: InterviewMode;
  meetingLink: string | null;
  location: string | null;
  round: InterviewRound;
  status: InterviewStatus;
  feedback: string | null;
  rating: number | null;
  createdAt: string;
}

export interface InterviewFeedbackRequest {
  feedback: string;
  rating: number;
  status: InterviewStatus;
}

export interface InterviewDashboardStats {
  todayCount: number;
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  todayInterviews: InterviewResponse[];
}

export interface ParseResumeResponse {
  name: string;
  skills: string[];
  education: string[];
  experience: string[];
  projects: string[];
  certificates: string[];
  technologies: string[];
}

export interface MatchResumeResponse {
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
}

export interface RecruiterSummaryResponse {
  summary: string;
}

export interface RankCandidatesRequest {
  jobDescription: string;
  candidates: { id: number; name: string; resumeText: string }[];
}

export interface RankCandidatesResponse {
  rankedCandidates: { id: number; name: string; score: number; reasoning: string }[];
}

export interface GenerateQuestionsResponse {
  questions: { technical: string[]; behavioral: string[]; hr: string[] };
}

export interface CoverLetterReviewResponse {
  grammarIssues: string[];
  professionalismScore: string;
  suggestions: string[];
}

export interface SkillGapResponse {
  missingSkills: string[];
  recommendations: string[];
}
