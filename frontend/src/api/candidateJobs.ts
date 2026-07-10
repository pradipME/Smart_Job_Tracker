import api from './axios';
import type { JobListing, PaginatedResponse } from '../types';

export interface CandidateJobSearchParams {
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  experience?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export const candidateJobsApi = {
  getOpenJobs: (params: CandidateJobSearchParams) =>
    api.get<PaginatedResponse<JobListing>>('/jobs/listings', { params }),

  getOpenJobById: (id: number) =>
    api.get<JobListing>(`/jobs/listings/${id}`),
};
