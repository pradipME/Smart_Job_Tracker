import { useQuery } from '@tanstack/react-query';
import { candidateJobsApi, type CandidateJobSearchParams } from '../api/candidateJobs';

export function useOpenJobs(params: CandidateJobSearchParams) {
  return useQuery({
    queryKey: ['candidate-jobs', 'list', params],
    queryFn: () => candidateJobsApi.getOpenJobs(params),
    select: (res) => res.data,
  });
}

export function useOpenJob(id: number | null) {
  return useQuery({
    queryKey: ['candidate-jobs', id],
    queryFn: () => candidateJobsApi.getOpenJobById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}
