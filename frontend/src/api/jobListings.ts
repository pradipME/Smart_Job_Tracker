import api from './axios';
import type { JobListing, JobListingRequest, PaginatedResponse } from '../types';

export const jobListingsApi = {
  getAll: (page = 0, size = 10) =>
    api.get<PaginatedResponse<JobListing>>('/admin/jobs', { params: { page, size } }),

  getById: (id: number) =>
    api.get<JobListing>(`/admin/jobs/${id}`),

  search: (params: { title?: string; company?: string; location?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<JobListing>>('/admin/jobs/search', { params }),

  filter: (params: { status?: string; employmentType?: string; workMode?: string; page?: number; size?: number }) =>
    api.get<PaginatedResponse<JobListing>>('/admin/jobs/filter', { params }),

  create: (data: JobListingRequest) =>
    api.post<JobListing>('/admin/jobs', data),

  update: (id: number, data: JobListingRequest) =>
    api.put<JobListing>(`/admin/jobs/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/admin/jobs/${id}`),
};
