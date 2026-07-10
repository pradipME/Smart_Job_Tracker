import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  location: z.string(),
  status: z.enum(['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']),
  appliedDate: z.string(),
  interviewDate: z.string(),
  notes: z.string(),
});

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  logoUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().optional(),
});

export const jobListingSchema = z.object({
  companyId: z.number().positive('Company is required'),
  title: z.string().min(1, 'Job title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  experience: z.string().optional(),
  salaryMin: z.number().min(0).optional().or(z.nan().transform(() => undefined)),
  salaryMax: z.number().min(0).optional().or(z.nan().transform(() => undefined)),
  employmentType: z.string().optional(),
  workMode: z.string().optional(),
  requiredSkills: z.string().optional(),
  openings: z.number().min(1).optional().or(z.nan().transform(() => undefined)),
  deadline: z.string().optional(),
  status: z.string().optional(),
}).refine(
  (data) => {
    if (data.salaryMin != null && data.salaryMax != null) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  { message: 'Salary min cannot be greater than salary max', path: ['salaryMax'] }
);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
export type JobListingFormData = z.infer<typeof jobListingSchema>;
