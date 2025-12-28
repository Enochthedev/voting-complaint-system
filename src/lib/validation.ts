/**
 * Validation Schemas using Zod
 *
 * This module provides validation schemas for all data types in the application.
 * Use these schemas to validate data before API calls to catch errors early
 * and provide better error messages to users.
 */

import { z } from 'zod';

/**
 * Complaint Category Schema
 */
export const ComplaintCategorySchema = z.enum([
  'academic',
  'administrative',
  'facilities',
  'financial',
  'it_services',
  'library',
  'health_services',
  'accommodation',
  'other',
]);

/**
 * Complaint Priority Schema
 */
export const ComplaintPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent', 'critical']);

/**
 * Complaint Status Schema
 */
export const ComplaintStatusSchema = z.enum([
  'draft',
  'new',
  'opened',
  'in_progress',
  'resolved',
  'closed',
  'reopened',
]);

/**
 * User Role Schema
 */
export const UserRoleSchema = z.enum(['student', 'lecturer', 'admin']);

/**
 * Create Complaint Schema
 */
export const CreateComplaintSchema = z
  .object({
    title: z.string().max(200, 'Title must be 200 characters or less').trim(),
    description: z.string().max(5000, 'Description must be 5000 characters or less').trim(),
    category: z.union([ComplaintCategorySchema, z.literal('')]),
    priority: z.union([ComplaintPrioritySchema, z.literal('')]),
    is_anonymous: z.boolean().default(false),
    is_draft: z.boolean().default(false),
    student_id: z.string().uuid('Invalid user ID'),
    status: ComplaintStatusSchema.default('new'),
  })
  .refine(
    (data) => {
      // For non-drafts, require all fields
      if (!data.is_draft) {
        return (
          data.title.trim().length >= 1 &&
          data.description.trim().length >= 10 &&
          data.category !== '' &&
          data.priority !== ''
        );
      }
      return true;
    },
    {
      message: 'Title, description, category, and priority are required for submitted complaints',
    }
  );

/**
 * Update Complaint Schema (all fields optional except ID)
 */
export const UpdateComplaintSchema = z.object({
  id: z.string().uuid('Invalid complaint ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be 5000 characters or less')
    .trim()
    .optional(),
  category: ComplaintCategorySchema.optional(),
  priority: ComplaintPrioritySchema.optional(),
  status: ComplaintStatusSchema.optional(),
  is_anonymous: z.boolean().optional(),
  is_draft: z.boolean().optional(),
  assigned_to: z.string().uuid('Invalid assignee ID').nullable().optional(),
});

/**
 * Complaint Tag Schema
 */
export const ComplaintTagSchema = z.object({
  complaint_id: z.string().uuid('Invalid complaint ID'),
  tag_name: z.string().min(1).max(50).trim(),
});

/**
 * Bulk Assign Schema
 */
export const BulkAssignSchema = z.object({
  complaintIds: z
    .array(z.string().uuid('Invalid complaint ID'))
    .min(1, 'At least one complaint must be selected'),
  lecturerId: z.string().uuid('Invalid lecturer ID'),
  performedBy: z.string().uuid('Invalid user ID'),
});

/**
 * Bulk Status Change Schema
 */
export const BulkStatusChangeSchema = z.object({
  complaintIds: z
    .array(z.string().uuid('Invalid complaint ID'))
    .min(1, 'At least one complaint must be selected'),
  newStatus: ComplaintStatusSchema,
  performedBy: z.string().uuid('Invalid user ID'),
});

/**
 * Bulk Add Tags Schema
 */
export const BulkAddTagsSchema = z.object({
  complaintIds: z
    .array(z.string().uuid('Invalid complaint ID'))
    .min(1, 'At least one complaint must be selected'),
  tags: z.array(z.string().min(1).max(50)).min(1, 'At least one tag must be provided'),
  performedBy: z.string().uuid('Invalid user ID'),
});

/**
 * Comment Schema
 */
export const CommentSchema = z.object({
  complaint_id: z.string().uuid('Invalid complaint ID'),
  user_id: z.string().uuid('Invalid user ID'),
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be 2000 characters or less')
    .trim(),
  is_internal: z.boolean().default(false),
});

/**
 * Rating Schema
 */
export const RatingSchema = z.object({
  complaint_id: z.string().uuid('Invalid complaint ID'),
  student_id: z.string().uuid('Invalid student ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  feedback_text: z
    .string()
    .max(1000, 'Feedback must be 1000 characters or less')
    .trim()
    .optional()
    .nullable(),
});

/**
 * Reopen Complaint Schema
 */
export const ReopenComplaintSchema = z.object({
  id: z.string().uuid('Invalid complaint ID'),
  justification: z
    .string()
    .min(10, 'Justification must be at least 10 characters')
    .max(500, 'Justification must be 500 characters or less')
    .trim(),
  userId: z.string().uuid('Invalid user ID'),
});

/**
 * User Registration Schema
 */
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be 100 characters or less')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or less')
    .trim(),
  role: UserRoleSchema.default('student'),
});

/**
 * Update User Role Schema
 */
export const UpdateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  newRole: UserRoleSchema,
});

/**
 * Search Query Schema
 */
export const SearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(200).trim(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});

/**
 * Database Error Class - Preserves Supabase error properties
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: string,
    public hint?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Validation Error Class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    this.errors.issues.forEach((error) => {
      const path = error.path.join('.');
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(error.message);
    });

    return formatted;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    const firstError = this.errors.issues[0];
    if (firstError) {
      return firstError.message;
    }
    return 'Validation failed';
  }
}

/**
 * Validate data against a schema
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError('Validation failed', result.error);
  }

  return result.data;
}

/**
 * Type exports for convenience
 */
export type ComplaintCategory = z.infer<typeof ComplaintCategorySchema>;
export type ComplaintPriority = z.infer<typeof ComplaintPrioritySchema>;
export type ComplaintStatus = z.infer<typeof ComplaintStatusSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type CreateComplaintInput = z.infer<typeof CreateComplaintSchema>;
export type UpdateComplaintInput = z.infer<typeof UpdateComplaintSchema>;
export type CommentInput = z.infer<typeof CommentSchema>;
export type RatingInput = z.infer<typeof RatingSchema>;
export type UserRegistrationInput = z.infer<typeof UserRegistrationSchema>;
