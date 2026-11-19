import { z } from 'zod';

export const SupportedLocaleSchema = z.enum(['mr', 'hi', 'en']);
export const UserRoleSchema = z.enum(['candidate', 'employer', 'admin']);

export const CandidateProfileSchema = z.object({
  preferredName: z.string().min(2, 'Name must be at least 2 characters').max(80),
  district: z.string().min(2).max(50),
  taluka: z.string().max(50).optional(),
  village: z.string().max(50).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
  trade: z.string().min(2).max(50).optional(),
  qualifications: z.array(z.string()).default([]),
  skillIds: z.array(z.string()).min(1, 'Please select at least one skill'),
  experienceMonths: z.number().int().min(0).max(480).default(0),
  expectedWageRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  maximumTravelKm: z.number().min(0).max(200).optional(),
  availability: z.enum(['immediate', 'two_weeks', 'one_month']).default('immediate'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian phone number').optional(),
});

export const EmployerProfileSchema = z.object({
  businessName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(80),
  district: z.string().min(2).max(50),
  taluka: z.string().max(50).optional(),
  industrialArea: z.string().max(80).optional(),
  companyCategory: z.string().min(2).max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian phone number').optional(),
});

export const CreateJobPostingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  district: z.string().min(2).max(50),
  taluka: z.string().max(50).optional(),
  areaOrMidc: z.string().max(80).optional(),
  requiredSkillIds: z.array(z.string()).min(1, 'At least one skill is required'),
  mandatoryCertificationIds: z.array(z.string()).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryPeriod: z.enum(['monthly', 'daily', 'hourly']).default('monthly'),
  vacancies: z.number().int().min(1).max(500).default(1),
  sourceType: z.enum(['internal_employer', 'demo_seed']).default('internal_employer'),
});

export const UpdateApplicationStatusSchema = z.object({
  status: z.enum(['shortlisted', 'interview_requested', 'accepted', 'rejected']),
  notes: z.string().max(500).optional(),
});

export const ExternalJobDiscoveryQuerySchema = z.object({
  query: z.string().min(2).max(100),
  location: z.string().min(2).max(50),
  limit: z.number().int().min(1).max(20).default(5),
});

export const VoiceInputConfirmSchema = z.object({
  rawTranscript: z.string().min(1),
  extractedTrade: z.string().optional(),
  extractedSkills: z.array(z.string()),
  extractedExperienceYears: z.number().optional(),
  extractedLocation: z.string().optional(),
  userConfirmed: z.boolean(),
});
