import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '../api/companies';
import type { CompanyRequest } from '../types';

export function useCompanies(page = 0, size = 10, name?: string) {
  return useQuery({
    queryKey: ['companies', 'paginated', page, size, name],
    queryFn: () => companiesApi.getAll(page, size, name),
    select: (res) => res.data,
  });
}

export function useAllCompanies() {
  return useQuery({
    queryKey: ['companies', 'all'],
    queryFn: () => companiesApi.getAllUnpaginated(),
    select: (res) => res.data,
  });
}

export function useCompany(id: number | null) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => companiesApi.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyRequest) => companiesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyRequest }) =>
      companiesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => companiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
