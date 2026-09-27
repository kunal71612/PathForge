import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  college: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  year: z.number().int().min(1).max(6).optional().nullable(),
  bio: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(), // skill IDs to add to StudentSkill
});

export const assessmentSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.number().int().min(0),
  })),
});

export const applicationSchema = z.object({
  opportunityId: z.string(),
  status: z.enum(['SAVED', 'PREPARING', 'READY', 'APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'COMPLETED']).optional(),
  notes: z.string().optional().nullable(),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(['SAVED', 'PREPARING', 'READY', 'APPLIED', 'SHORTLISTED', 'REJECTED', 'SELECTED', 'COMPLETED']).optional(),
  notes: z.string().optional().nullable(),
});

export const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  organization: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.enum(['HACKATHON', 'INTERNSHIP', 'SCHOLARSHIP', 'COMPETITION', 'WORKSHOP', 'COURSE', 'CERTIFICATION', 'RESEARCH']),
  eligibility: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  mode: z.string().optional().nullable(),
  cost: z.string().optional().nullable(),
  applyUrl: z.string().url().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  isDemo: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  skillIds: z.array(z.string()).optional(),
});

export const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  url: z.string().url('Invalid URL'),
  type: z.enum(['YOUTUBE', 'COURSE', 'DOCUMENTATION', 'ARTICLE', 'PRACTICE', 'GITHUB']),
  duration: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  moduleId: z.string().optional().nullable(),
  skillId: z.string().optional().nullable(),
});

export const questionSchema = z.object({
  assessmentId: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  skillId: z.string().optional().nullable(),
});
