import api from './axios';
import type { AssessmentResponse, AssessmentRequest, AssessmentResultResponse, PaginatedResponse } from '../types';

export const adminAssessmentsApi = {
  list: (params?: { search?: string; status?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<AssessmentResponse>>('/admin/assessments', { params }),

  getById: (id: number) =>
    api.get<AssessmentResponse>(`/admin/assessments/${id}`),

  create: (data: AssessmentRequest) =>
    api.post<AssessmentResponse>('/admin/assessments', data),

  update: (id: number, data: AssessmentRequest) =>
    api.put<AssessmentResponse>(`/admin/assessments/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/admin/assessments/${id}`),

  updateStatus: (id: number, status: string) =>
    api.put<AssessmentResponse>(`/admin/assessments/${id}/status`, { status }),

  getResults: (id: number) =>
    api.get<AssessmentResultResponse[]>(`/admin/assessments/${id}/results`),
};
