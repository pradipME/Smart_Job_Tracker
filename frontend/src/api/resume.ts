import api from './axios';
import type { ResumeResponse } from '../types';

export const resumeApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ResumeResponse>('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
