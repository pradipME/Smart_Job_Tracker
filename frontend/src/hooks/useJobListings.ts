import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobListingsApi } from '../api/jobListings';
import type { JobListingRequest } from '../types';

export function useJobListings(page = 0, size = 10) {
  return useQuery({
    queryKey: ['job-listings', 'paginated', page, size],
    queryFn: () => jobListingsApi.getAll(page, size),
    select: (res) => res.data,
  });
}

export function useJobListing(id: number | null) {
  return useQuery({
    queryKey: ['job-listings', id],
    queryFn: () => jobListingsApi.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useSearchJobListings(params: {
  title?: string;
  company?: string;
  location?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['job-listings', 'search', params],
    queryFn: () => jobListingsApi.search(params),
    enabled: !!(params.title || params.company || params.location),
    select: (res) => res.data,
  });
}

export function useFilterJobListings(params: {
  status?: string;
  employmentType?: string;
  workMode?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['job-listings', 'filter', params],
    queryFn: () => jobListingsApi.filter(params),
    enabled: !!(params.status || params.employmentType || params.workMode),
    select: (res) => res.data,
  });
}

export function useCreateJobListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JobListingRequest) => jobListingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-listings'] });
    },
  });
}

export function useUpdateJobListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JobListingRequest }) =>
      jobListingsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-listings'] });
    },
  });
}

export function useDeleteJobListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobListingsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-listings'] });
    },
  });
}
