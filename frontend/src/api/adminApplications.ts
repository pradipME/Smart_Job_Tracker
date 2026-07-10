import api from './axios';
import type {
  AdminApplicationSummary,
  AdminApplicationDetail,
  AdminDashboardStats,
  ApplicationHistoryEntry,
  RecruiterNote,
  NoteRequest,
  StatusUpdateRequest,
  PaginatedResponse,
} from '../types';

export const adminApplicationsApi = {
  list: (params: {
    search?: string;
    status?: string;
    companyId?: number;
    jobId?: number;
    sort?: string;
    page?: number;
    size?: number;
  }) =>
    api.get<PaginatedResponse<AdminApplicationSummary>>('/admin/applications', { params }),

  getById: (id: number) =>
    api.get<AdminApplicationDetail>(`/admin/applications/${id}`),

  updateStatus: (id: number, data: StatusUpdateRequest) =>
    api.put<AdminApplicationDetail>(`/admin/applications/${id}/status`, data),

  getHistory: (id: number) =>
    api.get<ApplicationHistoryEntry[]>(`/admin/applications/${id}/history`),

  addNote: (id: number, data: NoteRequest) =>
    api.post<RecruiterNote>(`/admin/applications/${id}/notes`, data),

  getNotes: (id: number) =>
    api.get<RecruiterNote[]>(`/admin/applications/${id}/notes`),

  updateNote: (id: number, noteId: number, data: NoteRequest) =>
    api.put<RecruiterNote>(`/admin/applications/${id}/notes/${noteId}`, data),

  deleteNote: (id: number, noteId: number) =>
    api.delete<{ message: string }>(`/admin/applications/${id}/notes/${noteId}`),

  dashboard: () =>
    api.get<AdminDashboardStats>('/admin/applications/dashboard'),

  resumeUrl: (applicationId: number) =>
    `${api.defaults.baseURL}/admin/applications/resume/${applicationId}`,
};
