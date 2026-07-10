import api from './axios';
import type { JobApplication, JobRequest, PaginatedResponse } from '../types';

export const jobsApi = {
  getAll: () => api.get<JobApplication[]>('/jobs'),
  getPaginated: (page: number, size: number) =>
    api.get<PaginatedResponse<JobApplication>>('/jobs/page', { params: { page, size } }),
  getById: (id: number) => api.get<JobApplication>(`/jobs/${id}`),
  create: (data: JobRequest) => api.post<string>('/jobs', data),
  update: (id: number, data: JobRequest) => api.put<string>(`/jobs/${id}`, data),
  delete: (id: number) => api.delete<string>(`/jobs/${id}`),
  search: (company: string) =>
    api.get<JobApplication[]>('/jobs/search', { params: { company } }),
  filter: (status: string) =>
    api.get<JobApplication[]>('/jobs/filter', { params: { status } }),
};
