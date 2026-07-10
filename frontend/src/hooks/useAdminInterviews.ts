import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminInterviewsApi } from '../api/adminInterviews';
import type { InterviewRequest, InterviewFeedbackRequest } from '../types';

export function useAdminInterviews(params?: { search?: string; status?: string; mode?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['admin-interviews', params],
    queryFn: () => adminInterviewsApi.list(params),
    select: (res) => res.data,
  });
}

export function useAdminInterview(id: number | null) {
  return useQuery({
    queryKey: ['admin-interviews', id],
    queryFn: () => adminInterviewsApi.getById(id!),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InterviewRequest) => adminInterviewsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-interviews'] }),
  });
}

export function useUpdateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InterviewRequest }) => adminInterviewsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-interviews'] }),
  });
}

export function useUpdateInterviewStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string; feedback?: string; rating?: number } }) =>
      adminInterviewsApi.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-interviews'] }),
  });
}

export function useAddInterviewFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InterviewFeedbackRequest }) =>
      adminInterviewsApi.addFeedback(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-interviews'] }),
  });
}

export function useInterviewsByDateRange(start: string | null, end: string | null) {
  return useQuery({
    queryKey: ['admin-interviews', 'calendar', start, end],
    queryFn: () => adminInterviewsApi.getByDateRange(start!, end!),
    select: (res) => res.data,
    enabled: !!start && !!end,
  });
}

export function useInterviewDashboardStats() {
  return useQuery({
    queryKey: ['admin-interviews', 'dashboard'],
    queryFn: () => adminInterviewsApi.getDashboardStats(),
    select: (res) => res.data,
  });
}
