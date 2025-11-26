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

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
      
      // If it's a draft, invalidate drafts
      if (variables.is_draft) {
        queryClient.invalidateQueries({ queryKey: complaintKeys.userDrafts(variables.student_id) });
      } else {
        // If it's a submitted complaint, invalidate user complaints and stats
        queryClient.invalidateQueries({ queryKey: complaintKeys.user(variables.student_id) });
        queryClient.invalidateQueries({ queryKey: complaintKeys.userStats(variables.student_id) });
      }
    },
  });
}

/**
 * Hook to update a complaint
 */
export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateComplaint(id, updates),
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

  return useMutation({
    mutationFn: deleteComplaint,
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
    mutationFn: ({ id, justification, userId }: { id: string; justification: string; userId: string }) =>
      reopenComplaint(id, justification, userId),
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
