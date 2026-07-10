import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateAssessmentsApi } from '../api/candidateAssessments';
import type { SubmitRequest } from '../types';

export function useMyAssessments() {
  return useQuery({
    queryKey: ['candidate-assessments', 'my'],
    queryFn: () => candidateAssessmentsApi.getMy(),
    select: (res) => res.data,
  });
}

export function useStartAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => candidateAssessmentsApi.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidate-assessments'] }),
  });
}

export function useSubmitAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubmitRequest }) =>
      candidateAssessmentsApi.submit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidate-assessments'] }),
  });
}

export function useAssessmentResult(id: number | null) {
  return useQuery({
    queryKey: ['candidate-assessments', 'result', id],
    queryFn: () => candidateAssessmentsApi.getResult(id!),
    select: (res) => res.data,
    enabled: !!id,
  });
}
