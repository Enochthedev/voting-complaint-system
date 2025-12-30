/**
 * Standardized Complaints API
 *
 * This module provides standardized API responses for complaint operations
 * while maintaining backward compatibility with existing implementations.
 */

import { StandardApiResponse, PaginatedApiResponse, ErrorType } from './standardization/types';
import { createMigrationWrapper } from './standardization/migration-wrapper';
import { withMonitoring } from './standardization/monitoring-wrapper';
import * as legacyComplaints from './complaints';

// Create migration wrapper instance
const migrationWrapper = createMigrationWrapper();

/**
 * Standardized version of getUserComplaints
 */
export const getUserComplaintsStandardized = withMonitoring(
  async (userId: string): Promise<StandardApiResponse<any[]>> => {
    try {
      const data = await legacyComplaints.getUserComplaints(userId);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({
        data: null,
        error,
      }) as unknown as StandardApiResponse<any[]>;
    }
  },
  {
    endpoint: '/api/complaints/user',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true },
    },
  }
);

/**
 * Standardized version of getUserDrafts
 */
export const getUserDraftsStandardized = withMonitoring(
  async (userId: string): Promise<StandardApiResponse<any[]>> => {
    try {
      const data = await legacyComplaints.getUserDrafts(userId);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/user/drafts',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true },
    },
  }
);

/**
 * Standardized version of getUserComplaintStats
 */
export const getUserComplaintStatsStandardized = withMonitoring(
  async (userId: string): Promise<StandardApiResponse<any>> => {
    try {
      const data = await legacyComplaints.getUserComplaintStats(userId);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/user/stats',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true },
    },
  }
);

/**
 * Standardized version of getAllComplaints with pagination support
 */
export const getAllComplaintsStandardized = withMonitoring(
  async (options?: {
    page?: number;
    limit?: number;
    baseUrl?: string;
  }): Promise<PaginatedApiResponse<any>> => {
    try {
      const data = await legacyComplaints.getAllComplaints();

      // Apply pagination if requested
      const page = options?.page || 1;
      const limit = options?.limit || 50;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = data.slice(startIndex, endIndex);

      return migrationWrapper.createPaginatedResponse(paginatedData, {
        page,
        limit,
        total: data.length,
        baseUrl: options?.baseUrl || '/api/complaints',
      });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({
        data: null,
        error,
      }) as PaginatedApiResponse<any>;
    }
  },
  {
    endpoint: '/api/complaints',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, paginated: true },
    },
  }
);

/**
 * Standardized version of getComplaintById
 */
export const getComplaintByIdStandardized = withMonitoring(
  async (id: string): Promise<StandardApiResponse<any>> => {
    try {
      const data = await legacyComplaints.getComplaintById(id);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/:id',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true },
    },
  }
);

/**
 * Standardized version of createComplaint
 */
export const createComplaintStandardized = withMonitoring(
  async (complaint: unknown): Promise<StandardApiResponse<any>> => {
    try {
      const data = await legacyComplaints.createComplaint(complaint);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints',
    method: 'POST',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of updateComplaint
 */
export const updateComplaintStandardized = withMonitoring(
  async (id: string, updates: unknown): Promise<StandardApiResponse<any>> => {
    try {
      const data = await legacyComplaints.updateComplaint(id, updates);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/:id',
    method: 'PATCH',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of deleteComplaint
 */
export const deleteComplaintStandardized = withMonitoring(
  async (id: string): Promise<StandardApiResponse<null>> => {
    try {
      await legacyComplaints.deleteComplaint(id);
      return migrationWrapper.wrapSupabaseResponse({ data: null, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/:id',
    method: 'DELETE',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of reopenComplaint
 */
export const reopenComplaintStandardized = withMonitoring(
  async (id: string, justification: string, userId: string): Promise<StandardApiResponse<any>> => {
    try {
      const data = await legacyComplaints.reopenComplaint(id, justification, userId);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/:id/reopen',
    method: 'POST',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of submitRating
 */
export const submitRatingStandardized = withMonitoring(
  async (
    complaintId: string,
    studentId: string,
    rating: number,
    feedbackText?: string
  ): Promise<StandardApiResponse<any>> => {
    try {
      const data = await legacyComplaints.submitRating(
        complaintId,
        studentId,
        rating,
        feedbackText
      );
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/:id/rating',
    method: 'POST',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of hasRatedComplaint
 */
export const hasRatedComplaintStandardized = withMonitoring(
  async (complaintId: string, studentId: string): Promise<StandardApiResponse<boolean>> => {
    try {
      const data = await legacyComplaints.hasRatedComplaint(complaintId, studentId);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/:id/rating/check',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true },
    },
  }
);

/**
 * Standardized version of getUserAverageRating
 */
export const getUserAverageRatingStandardized = withMonitoring(
  async (userId: string): Promise<StandardApiResponse<number | null>> => {
    try {
      const data = await legacyComplaints.getUserAverageRating(userId);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/users/:id/average-rating',
    method: 'GET',
    metadata: {
      category: 'complaints',
      tags: { standardized: true },
    },
  }
);

/**
 * Standardized version of bulkAssignComplaints
 */
export const bulkAssignComplaintsStandardized = withMonitoring(
  async (
    complaintIds: string[],
    lecturerId: string,
    performedBy: string
  ): Promise<StandardApiResponse<{ success: number; failed: number; errors: string[] }>> => {
    try {
      const data = await legacyComplaints.bulkAssignComplaints(
        complaintIds,
        lecturerId,
        performedBy
      );
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/bulk/assign',
    method: 'POST',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true, bulk: true },
    },
  }
);

/**
 * Standardized version of bulkChangeStatus
 */
export const bulkChangeStatusStandardized = withMonitoring(
  async (
    complaintIds: string[],
    newStatus: string,
    performedBy: string
  ): Promise<StandardApiResponse<{ success: number; failed: number; errors: string[] }>> => {
    try {
      const data = await legacyComplaints.bulkChangeStatus(complaintIds, newStatus, performedBy);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/bulk/status',
    method: 'POST',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true, bulk: true },
    },
  }
);

/**
 * Standardized version of bulkAddTags
 */
export const bulkAddTagsStandardized = withMonitoring(
  async (
    complaintIds: string[],
    tags: string[],
    performedBy: string
  ): Promise<StandardApiResponse<{ success: number; failed: number; errors: string[] }>> => {
    try {
      const data = await legacyComplaints.bulkAddTags(complaintIds, tags, performedBy);
      return migrationWrapper.wrapSupabaseResponse({ data, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/complaints/bulk/tags',
    method: 'POST',
    metadata: {
      category: 'complaints',
      tags: { standardized: true, mutation: true, bulk: true },
    },
  }
);
