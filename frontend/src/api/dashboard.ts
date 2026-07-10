import api from './axios';
import type { DashboardResponse } from '../types';

export const dashboardApi = {
  get: () => api.get<DashboardResponse>('/dashboard'),
};
