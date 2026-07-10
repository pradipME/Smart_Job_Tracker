import api from './axios';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<string>('/auth/register', data),
  test: () => api.get<string>('/auth/test'),
};
