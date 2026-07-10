import api from './axios';
import type { AttemptResponse, SubmitRequest, SubmitResponse } from '../types';

export const candidateAssessmentsApi = {
  getMy: () =>
    api.get<AttemptResponse[]>('/assessments/my'),

  start: (appAssessmentId: number) =>
    api.post<AttemptResponse>(`/assessments/${appAssessmentId}/start`),

  submit: (appAssessmentId: number, data: SubmitRequest) =>
    api.post<SubmitResponse>(`/assessments/${appAssessmentId}/submit`, data),

  getResult: (appAssessmentId: number) =>
    api.get<SubmitResponse>(`/assessments/${appAssessmentId}/result`),
};
