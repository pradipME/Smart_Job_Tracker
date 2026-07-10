import api from './axios';
import type { InterviewResponse } from '../types';

export const candidateInterviewsApi = {
  getMy: () =>
    api.get<InterviewResponse[]>('/interviews'),

  getById: (id: number) =>
    api.get<InterviewResponse>(`/interviews/${id}`),
};
