import api from './axios';
import type { Application, ApplicationRequest } from '../types';

export const applicationsApi = {
  apply: (data: ApplicationRequest) =>
    api.post<Application>('/applications', data),

  getMyApplications: () =>
    api.get<Application[]>('/applications'),

  getMyApplicationForJob: (jobId: number) =>
    api.get<Application>(`/applications/job/${jobId}`),

  getById: (id: number) =>
    api.get<Application>(`/applications/${id}`),

  withdraw: (id: number) =>
    api.delete<{ message: string }>(`/applications/${id}`),
};
