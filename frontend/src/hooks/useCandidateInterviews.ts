import { useQuery } from '@tanstack/react-query';
import { candidateInterviewsApi } from '../api/candidateInterviews';

export function useMyInterviews() {
  return useQuery({
    queryKey: ['candidate-interviews', 'my'],
    queryFn: () => candidateInterviewsApi.getMy(),
    select: (res) => res.data,
  });
}

export function useMyInterview(id: number | null) {
  return useQuery({
    queryKey: ['candidate-interviews', id],
    queryFn: () => candidateInterviewsApi.getById(id!),
    select: (res) => res.data,
    enabled: !!id,
  });
}
