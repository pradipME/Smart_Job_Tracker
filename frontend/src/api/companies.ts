import api from './axios';
import type { Company, CompanyRequest, PaginatedResponse } from '../types';

export const companiesApi = {
  getAll: (page = 0, size = 10, name?: string) =>
    api.get<PaginatedResponse<Company>>('/companies', {
      params: { page, size, ...(name ? { name } : {}) },
    }),

  getAllUnpaginated: () =>
    api.get<Company[]>('/companies/all'),

  getById: (id: number) =>
    api.get<Company>(`/companies/${id}`),

  search: (name: string) =>
    api.get<Company[]>('/companies/search', { params: { name } }),

  create: (data: CompanyRequest) =>
    api.post<Company>('/companies', data),

  update: (id: number, data: CompanyRequest) =>
    api.put<Company>(`/companies/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/companies/${id}`),
};
