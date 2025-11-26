'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVotes, hasStudentVoted } from '@/lib/api/votes';

/**
 * Query Keys for Votes
 */
export const voteKeys = {
  all: ['votes'] as const,
  lists: () => [...voteKeys.all, 'list'] as const,
  list: (filters?: { isActive?: boolean }) => [...voteKeys.lists(), filters] as const,
  hasVoted: (voteId: string, studentId: string) =>
    [...voteKeys.all, 'hasVoted', voteId, studentId] as const,
};

/**
 * Hook to fetch votes
 */
export function useVotes(filters?: { isActive?: boolean }) {
  return useQuery({
    queryKey: voteKeys.list(filters),
    queryFn: () => getVotes(filters),
  });
}

/**
 * Hook to check if student has voted
 */
export function useHasStudentVoted(voteId: string, studentId: string) {
  return useQuery({
    queryKey: voteKeys.hasVoted(voteId, studentId),
    queryFn: () => hasStudentVoted(voteId, studentId),
    enabled: !!voteId && !!studentId,
  });
}
