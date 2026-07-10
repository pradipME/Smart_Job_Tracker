import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api/applications';
import type { ApplicationRequest } from '../types';

export function useMyApplications() {
  return useQuery({
    queryKey: ['applications', 'my'],
    queryFn: () => applicationsApi.getMyApplications(),
    select: (res) => res.data,
  });
}

export function useMyApplicationForJob(jobId: number | null) {
  return useQuery({
    queryKey: ['applications', 'my', 'job', jobId],
    queryFn: () => applicationsApi.getMyApplicationForJob(jobId!),
    enabled: !!jobId,
    select: (res) => res.data,
    retry: false,
  });
}

export function useApplication(id: number | null) {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplicationRequest) => applicationsApi.apply(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => applicationsApi.withdraw(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
