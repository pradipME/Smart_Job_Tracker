import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAssessmentsApi } from '../api/adminAssessments';
import type { AssessmentRequest } from '../types';

export function useAdminAssessments(params?: { search?: string; status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['admin-assessments', params],
    queryFn: () => adminAssessmentsApi.list(params),
    select: (res) => res.data,
  });
}

export function useAdminAssessment(id: number | null) {
  return useQuery({
    queryKey: ['admin-assessments', id],
    queryFn: () => adminAssessmentsApi.getById(id!),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AssessmentRequest) => adminAssessmentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-assessments'] }),
  });
}

export function useUpdateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssessmentRequest }) => adminAssessmentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-assessments'] }),
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminAssessmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-assessments'] }),
  });
}

export function useUpdateAssessmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminAssessmentsApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-assessments'] }),
  });
}

export function useAssessmentResults(id: number | null) {
  return useQuery({
    queryKey: ['admin-assessments', 'results', id],
    queryFn: () => adminAssessmentsApi.getResults(id!),
    select: (res) => res.data,
    enabled: !!id,
  });
}
