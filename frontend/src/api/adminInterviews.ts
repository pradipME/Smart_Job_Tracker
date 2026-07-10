import api from './axios';
import type { InterviewRequest, InterviewResponse, InterviewFeedbackRequest, InterviewDashboardStats } from '../types';

export const adminInterviewsApi = {
  list: (params?: { search?: string; status?: string; mode?: string; page?: number; size?: number }) =>
    api.get<{ content: InterviewResponse[]; totalPages: number; totalElements: number; size: number; number: number; first: boolean; last: boolean; empty: boolean }>('/admin/interviews', { params }),

  getById: (id: number) =>
    api.get<InterviewResponse>(`/admin/interviews/${id}`),

  create: (data: InterviewRequest) =>
    api.post<InterviewResponse>('/admin/interviews', data),

  update: (id: number, data: InterviewRequest) =>
    api.put<InterviewResponse>(`/admin/interviews/${id}`, data),

  updateStatus: (id: number, data: { status: string; feedback?: string; rating?: number }) =>
    api.put<InterviewResponse>(`/admin/interviews/${id}/status`, data),

  addFeedback: (id: number, data: InterviewFeedbackRequest) =>
    api.put<InterviewResponse>(`/admin/interviews/${id}/feedback`, data),

  getByDate: (date: string) =>
    api.get<InterviewResponse[]>('/admin/interviews/calendar/date', { params: { date } }),

  getByDateRange: (start: string, end: string) =>
    api.get<InterviewResponse[]>('/admin/interviews/calendar/range', { params: { start, end } }),

  getDashboardStats: () =>
    api.get<InterviewDashboardStats>('/admin/interviews/dashboard'),
};
