/**
 * Input Validation Schemas using Zod
 * Centralized validation for API routes and forms
 */

import { z } from 'zod';

// Common validation patterns
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const idSchema = z.string().min(1, 'ID is required');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['client', 'freelancer'], {
    errorMap: () => ({ message: 'Role must be either client or freelancer' }),
  }),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Project schemas
export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.number().positive('Budget must be positive'),
  budgetType: z.enum(['fixed', 'hourly']),
  deadline: z.string().datetime().optional().or(z.literal('')),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  category: z.string().min(1, 'Category is required'),
  timeline: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: idSchema,
});

// Proposal schemas
export const createProposalSchema = z.object({
  projectId: idSchema,
  coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters'),
  proposedRate: z.number().positive().optional(),
  proposedBudget: z.number().positive('Proposed budget must be positive'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
});

export const updateProposalStatusSchema = z.object({
  proposalId: idSchema,
  status: z.enum(['pending', 'accepted', 'rejected']),
  processedBy: idSchema.optional(),
});

// Order schemas
export const createOrderSchema = z.object({
  projectId: idSchema,
  proposalId: idSchema,
  clientId: idSchema,
  freelancerId: idSchema,
});

export const updateOrderStatusSchema = z.object({
  orderId: idSchema,
  status: z.enum(['pending', 'in_progress', 'delivered', 'completed', 'cancelled']),
  deliveryNote: z.string().optional(),
});

// Catalog/Gig schemas
export const createCatalogSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  samples: z.array(z.string().url()).optional(),
});

// File upload schemas
export const uploadFileSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  folderType: z.enum(['profileImage', 'projectImage', 'projectFiles', 'proposalsImage', 'workSamples', 'general']),
  subfolder: z.string().optional(),
});

// Payment schemas
export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['topup', 'subscription']),
  plan: z.string().optional(),
});

// Profile update schema
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(1000).optional(),
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

// Helper function to validate and parse
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string; errors?: z.ZodError } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
        errors: error,
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Helper for API routes
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = validate(schema, data);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

