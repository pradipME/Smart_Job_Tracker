import api from './axios';
import type {
  ParseResumeResponse, MatchResumeResponse,
  RecruiterSummaryResponse, RankCandidatesRequest, RankCandidatesResponse,
  GenerateQuestionsResponse, CoverLetterReviewResponse, SkillGapResponse,
} from '../types';

export const aiApi = {
  parseResume: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post<ParseResumeResponse>('/ai/parse-resume', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  matchResume: (data: { resumeText: string; jobDescription: string }) =>
    api.post<MatchResumeResponse>('/ai/match-resume', data, { timeout: 120000 }),

  recruiterSummary: (resumeText: string, jobDescription: string) =>
    api.post<RecruiterSummaryResponse>('/ai/recruiter-summary', { resumeText, jobDescription }, { timeout: 120000 }),

  rankCandidates: (data: RankCandidatesRequest) =>
    api.post<RankCandidatesResponse>('/ai/rank-candidates', data, { timeout: 180000 }),

  generateQuestions: (resumeText: string, jobDescription: string) =>
    api.post<GenerateQuestionsResponse>('/ai/generate-questions', { resumeText, jobDescription }, { timeout: 120000 }),

  reviewCoverLetter: (coverLetter: string) =>
    api.post<CoverLetterReviewResponse>('/ai/review-cover-letter', { coverLetter }, { timeout: 120000 }),

  skillGap: (resumeText: string, jobDescription: string) =>
    api.post<SkillGapResponse>('/ai/skill-gap', { resumeText, jobDescription }, { timeout: 120000 }),
};
