'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserComplaints,
  getUserDrafts,
  getUserComplaintStats,
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  reopenComplaint,
  submitRating,
  hasRatedComplaint,
  getUserAverageRating,
  bulkAssignComplaints,
  bulkChangeStatus,
  bulkAddTags,
} from '@/lib/api/complaints';
import { useToast } from '@/components/ui/toast';
import { ValidationError, DatabaseError } from '@/lib/validation';
import { TimeoutError } from '@/lib/timeout';

/**
 * Query Keys for Complaints
 * Centralized query key management for better cache invalidation
 */
export const complaintKeys = {
  all: ['complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  list: (filters: string) => [...complaintKeys.lists(), { filters }] as const,
  details: () => [...complaintKeys.all, 'detail'] as const,
  detail: (id: string) => [...complaintKeys.details(), id] as const,
  user: (userId: string) => [...complaintKeys.all, 'user', userId] as const,
  userDrafts: (userId: string) => [...complaintKeys.all, 'drafts', userId] as const,
  userStats: (userId: string) => [...complaintKeys.all, 'stats', userId] as const,
  userRating: (userId: string) => [...complaintKeys.all, 'rating', userId] as const,
  hasRated: (complaintId: string, studentId: string) =>
    [...complaintKeys.all, 'hasRated', complaintId, studentId] as const,
};

/**
 * Hook to fetch user's complaints
 */
export function useUserComplaints(userId: string) {
  return useQuery({
    queryKey: complaintKeys.user(userId),
    queryFn: () => getUserComplaints(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user's draft complaints
 */
export function useUserDrafts(userId: string) {
  return useQuery({
    queryKey: complaintKeys.userDrafts(userId),
    queryFn: () => getUserDrafts(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user's complaint statistics
 */
export function useUserComplaintStats(userId: string) {
  return useQuery({
    queryKey: complaintKeys.userStats(userId),
    queryFn: () => getUserComplaintStats(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch all complaints (for lecturers/admins)
 */
export function useAllComplaints() {
  return useQuery({
    queryKey: complaintKeys.lists(),
    queryFn: getAllComplaints,
  });
}

/**
 * Hook to fetch a single complaint by ID
 */
export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => getComplaintById(id),
    enabled: !!id,
  });
}

/**
 * Hook to check if user has rated a complaint
 */
export function useHasRatedComplaint(complaintId: string, studentId: string) {
  return useQuery({
    queryKey: complaintKeys.hasRated(complaintId, studentId),
    queryFn: () => hasRatedComplaint(complaintId, studentId),
    enabled: !!complaintId && !!studentId,
  });
}

/**
 * Hook to fetch user's average rating
 */
export function useUserAverageRating(userId: string) {
  return useQuery({
    queryKey: complaintKeys.userRating(userId),
    queryFn: () => getUserAverageRating(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to create a new complaint
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: createComplaint,
    onMutate: async (newComplaint: any) => {
      // Cancel outgoing refetches
      const queryKey = newComplaint.is_draft
        ? complaintKeys.userDrafts(newComplaint.student_id)
        : complaintKeys.user(newComplaint.student_id);

      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!Array.isArray(old)) return old;

        const optimisticComplaint = {
          ...newComplaint,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return [optimisticComplaint, ...old];
      });

      return { previousData, queryKey };
    },
    onError: (err: any, variables: any, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      // Show error toast with appropriate message
      let errorMessage = 'Failed to create complaint. Please try again.';

      if (err instanceof ValidationError) {
        errorMessage = err.getUserMessage();
      } else if (err instanceof TimeoutError) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err instanceof DatabaseError) {
        errorMessage = err.details || err.message || 'Database error occurred';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, 'Error Creating Complaint');
      console.error('Create complaint error:', err);
    },
    onSuccess: (data, variables: any) => {
      // Invalidate all complaint queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });

      // Always invalidate both drafts and complaints to handle status changes
      queryClient.invalidateQueries({ queryKey: complaintKeys.userDrafts(variables.student_id) });
      queryClient.invalidateQueries({ queryKey: complaintKeys.user(variables.student_id) });
      queryClient.invalidateQueries({ queryKey: complaintKeys.userStats(variables.student_id) });
    },
  });
}

/**
 * Hook to update a complaint
 */
export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateComplaint(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: complaintKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: complaintKeys.all });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(complaintKeys.detail(id));
      const previousLists = queryClient.getQueryData(complaintKeys.lists());

      // Optimistically update detail view
      queryClient.setQueryData(complaintKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...updates,
          updated_at: new Date().toISOString(),
        };
      });

      // Optimistically update list views
      queryClient.setQueriesData({ queryKey: complaintKeys.all }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((complaint: any) =>
          complaint.id === id
            ? { ...complaint, ...updates, updated_at: new Date().toISOString() }
            : complaint
        );
      });

      return { previousDetail, previousLists, id };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(complaintKeys.detail(context.id), context.previousDetail);
      }
      if (context?.previousLists) {
        queryClient.setQueryData(complaintKeys.lists(), context.previousLists);
      }

      // Show error toast
      let errorMessage = 'Failed to update complaint. Please try again.';

      if (err instanceof ValidationError) {
        errorMessage = err.getUserMessage();
      } else if (err instanceof TimeoutError) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err instanceof DatabaseError) {
        errorMessage = err.details || err.message || 'Database error occurred';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, 'Error Updating Complaint');
      console.error('Update complaint error:', err);
    },
    onSuccess: (data) => {
      // Invalidate the specific complaint
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(data.id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.user(data.student_id) });
      queryClient.invalidateQueries({ queryKey: complaintKeys.userStats(data.student_id) });

      // If it was a draft that got submitted, invalidate drafts
      if (data.is_draft === false) {
        queryClient.invalidateQueries({ queryKey: complaintKeys.userDrafts(data.student_id) });
      }
    },
  });
}

/**
 * Hook to delete a complaint (drafts only)
 */
export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: deleteComplaint,
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: complaintKeys.all });

      // Snapshot previous values
      const previousLists = queryClient.getQueryData(complaintKeys.lists());
      const previousDetail = queryClient.getQueryData(complaintKeys.detail(id));

      // Optimistically remove from all lists
      queryClient.setQueriesData({ queryKey: complaintKeys.all }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter((complaint: any) => complaint.id !== id);
      });

      return { previousLists, previousDetail, id };
    },
    onError: (err: any, id, context) => {
      // Rollback on error
      if (context?.previousLists) {
        queryClient.setQueryData(complaintKeys.lists(), context.previousLists);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(complaintKeys.detail(id), context.previousDetail);
      }

      // Show error toast
      let errorMessage = 'Failed to delete complaint. Please try again.';

      if (err instanceof TimeoutError) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (err instanceof DatabaseError) {
        errorMessage = err.details || err.message || 'Database error occurred';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, 'Error Deleting Complaint');
      console.error('Delete complaint error:', err);
    },
    onSuccess: (_, id) => {
      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

/**
 * Hook to reopen a resolved complaint
 */
export function useReopenComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      justification,
      userId,
    }: {
      id: string;
      justification: string;
      userId: string;
    }) => reopenComplaint(id, justification, userId),
    onSuccess: (data) => {
      // Invalidate the specific complaint
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(data.id) });

      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.user(data.student_id) });
      queryClient.invalidateQueries({ queryKey: complaintKeys.userStats(data.student_id) });
    },
  });
}

/**
 * Hook to submit a rating for a complaint
 */
export function useSubmitRating() {
  const queryClient = useQueryClient();

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
    }) => submitRating(complaintId, studentId, rating, feedbackText),
    onSuccess: (data, variables) => {
      // Invalidate the complaint detail
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.complaintId) });

      // Invalidate rating status
      queryClient.invalidateQueries({
        queryKey: complaintKeys.hasRated(variables.complaintId, variables.studentId),
      });

      // Invalidate user's average rating
      queryClient.invalidateQueries({ queryKey: complaintKeys.userRating(variables.studentId) });
    },
  });
}

/**
 * Hook to bulk assign complaints
 */
export function useBulkAssignComplaints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintIds,
      lecturerId,
      performedBy,
    }: {
      complaintIds: string[];
      lecturerId: string;
      performedBy: string;
    }) => bulkAssignComplaints(complaintIds, lecturerId, performedBy),
    onSuccess: () => {
      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

/**
 * Hook to bulk change complaint status
 */
export function useBulkChangeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintIds,
      newStatus,
      performedBy,
    }: {
      complaintIds: string[];
      newStatus: string;
      performedBy: string;
    }) => bulkChangeStatus(complaintIds, newStatus, performedBy),
    onSuccess: () => {
      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}

/**
 * Hook to bulk add tags to complaints
 */
export function useBulkAddTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      complaintIds,
      tags,
      performedBy,
    }: {
      complaintIds: string[];
      tags: string[];
      performedBy: string;
    }) => bulkAddTags(complaintIds, tags, performedBy),
    onSuccess: () => {
      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}
