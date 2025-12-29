/**
 * Standardized Complaints Hooks
 *
 * React hooks that use the standardized API layer with enhanced error handling,
 * monitoring integration, and consistent response formats.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserComplaintsStandardized,
  getUserDraftsStandardized,
  getUserComplaintStatsStandardized,
  getAllComplaintsStandardized,
  getComplaintByIdStandardized,
  createComplaintStandardized,
  updateComplaintStandardized,
  deleteComplaintStandardized,
  reopenComplaintStandardized,
  submitRatingStandardized,
  hasRatedComplaintStandardized,
  getUserAverageRatingStandardized,
  bulkAssignComplaintsStandardized,
  bulkChangeStatusStandardized,
  bulkAddTagsStandardized,
} from '@/lib/api/standardized-complaints';
import { useToast } from '@/components/ui/toast';
import { StandardizedErrorHandler } from '@/lib/api/standardization/error-handler';
import type { StandardApiResponse, PaginatedApiResponse } from '@/lib/api/standardization/types';

/**
 * Query Keys for Standardized Complaints
 */
export const standardizedComplaintKeys = {
  all: ['standardized-complaints'] as const,
  lists: () => [...standardizedComplaintKeys.all, 'list'] as const,
  list: (filters: string) => [...standardizedComplaintKeys.lists(), { filters }] as const,
  details: () => [...standardizedComplaintKeys.all, 'detail'] as const,
  detail: (id: string) => [...standardizedComplaintKeys.details(), id] as const,
  user: (userId: string) => [...standardizedComplaintKeys.all, 'user', userId] as const,
  userDrafts: (userId: string) => [...standardizedComplaintKeys.all, 'drafts', userId] as const,
  userStats: (userId: string) => [...standardizedComplaintKeys.all, 'stats', userId] as const,
  userRating: (userId: string) => [...standardizedComplaintKeys.all, 'rating', userId] as const,
  hasRated: (complaintId: string, studentId: string) =>
    [...standardizedComplaintKeys.all, 'hasRated', complaintId, studentId] as const,
};

/**
 * Hook to fetch user's complaints with standardized responses
 */
export function useStandardizedUserComplaints(userId: string) {
  return useQuery({
    queryKey: standardizedComplaintKeys.user(userId),
    queryFn: () => getUserComplaintsStandardized(userId),
    enabled: !!userId,
    select: (response: StandardApiResponse<any[]>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to fetch user's draft complaints with standardized responses
 */
export function useStandardizedUserDrafts(userId: string) {
  return useQuery({
    queryKey: standardizedComplaintKeys.userDrafts(userId),
    queryFn: () => getUserDraftsStandardized(userId),
    enabled: !!userId,
    select: (response: StandardApiResponse<any[]>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to fetch user's complaint statistics with standardized responses
 */
export function useStandardizedUserComplaintStats(userId: string) {
  return useQuery({
    queryKey: standardizedComplaintKeys.userStats(userId),
    queryFn: () => getUserComplaintStatsStandardized(userId),
    enabled: !!userId,
    select: (response: StandardApiResponse<any>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to fetch all complaints with pagination support
 */
export function useStandardizedAllComplaints(options?: {
  page?: number;
  limit?: number;
  baseUrl?: string;
}) {
  return useQuery({
    queryKey: standardizedComplaintKeys.list(JSON.stringify(options || {})),
    queryFn: () => getAllComplaintsStandardized(options),
    select: (response: PaginatedApiResponse<any>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to fetch a single complaint by ID with standardized responses
 */
export function useStandardizedComplaint(id: string) {
  return useQuery({
    queryKey: standardizedComplaintKeys.detail(id),
    queryFn: () => getComplaintByIdStandardized(id),
    enabled: !!id,
    select: (response: StandardApiResponse<any>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to check if user has rated a complaint with standardized responses
 */
export function useStandardizedHasRatedComplaint(complaintId: string, studentId: string) {
  return useQuery({
    queryKey: standardizedComplaintKeys.hasRated(complaintId, studentId),
    queryFn: () => hasRatedComplaintStandardized(complaintId, studentId),
    enabled: !!complaintId && !!studentId,
    select: (response: StandardApiResponse<boolean>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to fetch user's average rating with standardized responses
 */
export function useStandardizedUserAverageRating(userId: string) {
  return useQuery({
    queryKey: standardizedComplaintKeys.userRating(userId),
    queryFn: () => getUserAverageRatingStandardized(userId),
    enabled: !!userId,
    select: (response: StandardApiResponse<number | null>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });
}

/**
 * Hook to create a new complaint with standardized error handling
 */
export function useStandardizedCreateComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: createComplaintStandardized,
    onMutate: async (newComplaint: any) => {
      // Cancel outgoing refetches
      const queryKey = newComplaint.is_draft
        ? standardizedComplaintKeys.userDrafts(newComplaint.student_id)
        : standardizedComplaintKeys.user(newComplaint.student_id);

      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data || !Array.isArray(old.data)) return old;

        const optimisticComplaint = {
          ...newComplaint,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return {
          ...old,
          data: [optimisticComplaint, ...old.data],
        };
      });

      return { previousData, queryKey };
    },
    onError: (err: any, variables: any, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      // Show standardized error message
      const errorMessage = err?.message || 'Failed to create complaint. Please try again.';
      toast.error(errorMessage, 'Error Creating Complaint');
      console.error('Create complaint error:', err);
    },
    onSuccess: (response: StandardApiResponse<any>, variables: any) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Creating Complaint');
        return;
      }

      // Invalidate all complaint queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with request ID for tracking
      toast.success(
        `Complaint created successfully (ID: ${response.meta.requestId})`,
        'Complaint Created'
      );
    },
  });
}

/**
 * Hook to update a complaint with standardized error handling
 */
export function useStandardizedUpdateComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateComplaintStandardized(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: standardizedComplaintKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: standardizedComplaintKeys.all });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(standardizedComplaintKeys.detail(id));
      const previousLists = queryClient.getQueryData(standardizedComplaintKeys.lists());

      // Optimistically update detail view
      queryClient.setQueryData(standardizedComplaintKeys.detail(id), (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        };
      });

      return { previousDetail, previousLists, id };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(
          standardizedComplaintKeys.detail(context.id),
          context.previousDetail
        );
      }

      // Show standardized error message
      const errorMessage = err?.message || 'Failed to update complaint. Please try again.';
      toast.error(errorMessage, 'Error Updating Complaint');
      console.error('Update complaint error:', err);
    },
    onSuccess: (response: StandardApiResponse<any>) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Updating Complaint');
        return;
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with request ID
      toast.success(
        `Complaint updated successfully (ID: ${response.meta.requestId})`,
        'Complaint Updated'
      );
    },
  });
}

/**
 * Hook to delete a complaint with standardized error handling
 */
export function useStandardizedDeleteComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: deleteComplaintStandardized,
    onSuccess: (response: StandardApiResponse<null>) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Deleting Complaint');
        return;
      }

      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with request ID
      toast.success(
        `Complaint deleted successfully (ID: ${response.meta.requestId})`,
        'Complaint Deleted'
      );
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to delete complaint. Please try again.';
      toast.error(errorMessage, 'Error Deleting Complaint');
      console.error('Delete complaint error:', err);
    },
  });
}

/**
 * Hook to reopen a resolved complaint with standardized error handling
 */
export function useStandardizedReopenComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      justification,
      userId,
    }: {
      id: string;
      justification: string;
      userId: string;
    }) => reopenComplaintStandardized(id, justification, userId),
    onSuccess: (response: StandardApiResponse<any>) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Reopening Complaint');
        return;
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with request ID
      toast.success(
        `Complaint reopened successfully (ID: ${response.meta.requestId})`,
        'Complaint Reopened'
      );
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to reopen complaint. Please try again.';
      toast.error(errorMessage, 'Error Reopening Complaint');
      console.error('Reopen complaint error:', err);
    },
  });
}

/**
 * Hook to submit a rating with standardized error handling
 */
export function useStandardizedSubmitRating() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      complaintId,
      studentId,
      rating,
      feedbackText,
    }: {
      complaintId: string;
      studentId: string;
      rating: number;
      feedbackText?: string;
    }) => submitRatingStandardized(complaintId, studentId, rating, feedbackText),
    onSuccess: (response: StandardApiResponse<any>, variables) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Submitting Rating');
        return;
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: standardizedComplaintKeys.detail(variables.complaintId),
      });
      queryClient.invalidateQueries({
        queryKey: standardizedComplaintKeys.hasRated(variables.complaintId, variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: standardizedComplaintKeys.userRating(variables.studentId),
      });

      // Show success message with request ID
      toast.success(
        `Rating submitted successfully (ID: ${response.meta.requestId})`,
        'Rating Submitted'
      );
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to submit rating. Please try again.';
      toast.error(errorMessage, 'Error Submitting Rating');
      console.error('Submit rating error:', err);
    },
  });
}

/**
 * Hook to bulk assign complaints with standardized error handling
 */
export function useStandardizedBulkAssignComplaints() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      complaintIds,
      lecturerId,
      performedBy,
    }: {
      complaintIds: string[];
      lecturerId: string;
      performedBy: string;
    }) => bulkAssignComplaintsStandardized(complaintIds, lecturerId, performedBy),
    onSuccess: (
      response: StandardApiResponse<{ success: number; failed: number; errors: string[] }>
    ) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Assigning Complaints');
        return;
      }

      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with details
      const result = response.data;
      if (result) {
        toast.success(
          `Successfully assigned ${result.success} complaints (ID: ${response.meta.requestId})`,
          'Bulk Assignment Complete'
        );
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to assign complaints. Please try again.';
      toast.error(errorMessage, 'Error Assigning Complaints');
      console.error('Bulk assign error:', err);
    },
  });
}

/**
 * Hook to bulk change complaint status with standardized error handling
 */
export function useStandardizedBulkChangeStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      complaintIds,
      newStatus,
      performedBy,
    }: {
      complaintIds: string[];
      newStatus: string;
      performedBy: string;
    }) => bulkChangeStatusStandardized(complaintIds, newStatus, performedBy),
    onSuccess: (
      response: StandardApiResponse<{ success: number; failed: number; errors: string[] }>
    ) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Changing Status');
        return;
      }

      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with details
      const result = response.data;
      if (result) {
        toast.success(
          `Successfully updated ${result.success} complaints (ID: ${response.meta.requestId})`,
          'Bulk Status Change Complete'
        );
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to change status. Please try again.';
      toast.error(errorMessage, 'Error Changing Status');
      console.error('Bulk status change error:', err);
    },
  });
}

/**
 * Hook to bulk add tags with standardized error handling
 */
export function useStandardizedBulkAddTags() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      complaintIds,
      tags,
      performedBy,
    }: {
      complaintIds: string[];
      tags: string[];
      performedBy: string;
    }) => bulkAddTagsStandardized(complaintIds, tags, performedBy),
    onSuccess: (
      response: StandardApiResponse<{ success: number; failed: number; errors: string[] }>
    ) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Adding Tags');
        return;
      }

      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: standardizedComplaintKeys.all });

      // Show success message with details
      const result = response.data;
      if (result) {
        toast.success(
          `Successfully tagged ${result.success} complaints (ID: ${response.meta.requestId})`,
          'Bulk Tag Addition Complete'
        );
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to add tags. Please try again.';
      toast.error(errorMessage, 'Error Adding Tags');
      console.error('Bulk add tags error:', err);
    },
  });
}
