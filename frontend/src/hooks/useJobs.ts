import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import type { JobRequest } from '../types';

export function useJobs(page = 0, size = 10) {
  return useQuery({
    queryKey: ['jobs', 'paginated', page, size],
    queryFn: () => jobsApi.getPaginated(page, size),
    select: (res) => res.data,
  });
}

export function useAllJobs() {
  return useQuery({
    queryKey: ['jobs', 'all'],
    queryFn: () => jobsApi.getAll(),
    select: (res) => res.data,
  });
}

export function useJob(id: number | null) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JobRequest) => jobsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JobRequest }) => jobsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useSearchJobs(company: string) {
  return useQuery({
    queryKey: ['jobs', 'search', company],
    queryFn: () => jobsApi.search(company),
    enabled: company.length > 0,
    select: (res) => res.data,
  });
}

export function useFilterJobs(status: string) {
  return useQuery({
    queryKey: ['jobs', 'filter', status],
    queryFn: () => jobsApi.filter(status),
    enabled: !!status,
    select: (res) => res.data,
  });
}
