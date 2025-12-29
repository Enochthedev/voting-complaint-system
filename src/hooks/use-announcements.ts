'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Announcement } from '@/types/database.types';
import {
  getRecentAnnouncements,
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/api/announcements';

/**
 * Query Keys for Announcements
 */
export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (filters?: { limit?: number; createdBy?: string }) =>
    [...announcementKeys.lists(), filters] as const,
  recent: (limit: number) => [...announcementKeys.lists(), 'recent', limit] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
};

/**
 * Hook to fetch all announcements
 */
export function useAnnouncements(filters?: { limit?: number; createdBy?: string }) {
  return useQuery({
    queryKey: announcementKeys.list(filters),
    queryFn: () => getAnnouncements(filters),
  });
}

/**
 * Hook to fetch recent announcements
 */
export function useRecentAnnouncements(limit: number = 5) {
  return useQuery({
    queryKey: announcementKeys.recent(limit),
    queryFn: () => getRecentAnnouncements(limit),
  });
}

/**
 * Hook to fetch a single announcement by ID
 */
export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => getAnnouncementById(id),
    enabled: !!id,
  });
}

/**
 * Mutation: Create a new announcement
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) =>
      createAnnouncement(announcementData),
    onSuccess: () => {
      // Invalidate all announcement queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

/**
 * Mutation: Update an announcement
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      announcementId,
      updates,
    }: {
      announcementId: string;
      updates: Partial<Omit<Announcement, 'id' | 'created_at' | 'created_by'>>;
    }) => updateAnnouncement(announcementId, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific announcement
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.announcementId) });
      // Invalidate all announcement lists
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}

/**
 * Mutation: Delete an announcement
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
    onSuccess: () => {
      // Invalidate all announcement queries
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}
