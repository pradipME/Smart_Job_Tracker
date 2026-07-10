import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../api/ai';
import type { RankCandidatesRequest } from '../types';

export function useParseResume() {
  return useMutation({
    mutationFn: (file: File) => aiApi.parseResume(file),
  });
}

export function useMatchResume() {
  return useMutation({
    mutationFn: (data: { resumeText: string; jobDescription: string }) => aiApi.matchResume(data),
  });
}

export function useRecruiterSummary() {
  return useMutation({
    mutationFn: ({ resumeText, jobDescription }: { resumeText: string; jobDescription: string }) =>
      aiApi.recruiterSummary(resumeText, jobDescription),
  });
}

export function useRankCandidates() {
  return useMutation({
    mutationFn: (data: RankCandidatesRequest) => aiApi.rankCandidates(data),
  });
}

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: ({ resumeText, jobDescription }: { resumeText: string; jobDescription: string }) =>
      aiApi.generateQuestions(resumeText, jobDescription),
  });
}

export function useReviewCoverLetter() {
  return useMutation({
    mutationFn: (coverLetter: string) => aiApi.reviewCoverLetter(coverLetter),
  });
}

export function useSkillGap() {
  return useMutation({
    mutationFn: ({ resumeText, jobDescription }: { resumeText: string; jobDescription: string }) =>
      aiApi.skillGap(resumeText, jobDescription),
  });
}
