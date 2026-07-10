import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApplicationsApi } from '../api/adminApplications';
import type { StatusUpdateRequest, NoteRequest } from '../types';

export function useAdminApplications(params: {
  search?: string;
  status?: string;
  companyId?: number;
  jobId?: number;
  sort?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['admin-applications', params],
    queryFn: () => adminApplicationsApi.list(params),
    select: (res) => res.data,
  });
}

export function useAdminApplication(id: number | null) {
  return useQuery({
    queryKey: ['admin-applications', id],
    queryFn: () => adminApplicationsApi.getById(id!),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-applications', 'dashboard'],
    queryFn: () => adminApplicationsApi.dashboard(),
    select: (res) => res.data,
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StatusUpdateRequest }) =>
      adminApplicationsApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    },
  });
}

export function useAddNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NoteRequest }) =>
      adminApplicationsApi.addNote(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications', id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noteId }: { id: number; noteId: number }) =>
      adminApplicationsApi.deleteNote(id, noteId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications', id] });
    },
  });
}
