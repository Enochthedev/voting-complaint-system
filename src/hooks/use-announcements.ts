'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecentAnnouncements } from '@/lib/api/announcements';

/**
 * Query Keys for Announcements
 */
export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  recent: (limit: number) => [...announcementKeys.lists(), 'recent', limit] as const,
};

/**
 * Hook to fetch recent announcements
 */
export function useRecentAnnouncements(limit: number = 5) {
  return useQuery({
    queryKey: announcementKeys.recent(limit),
    queryFn: () => getRecentAnnouncements(limit),
  });
}
