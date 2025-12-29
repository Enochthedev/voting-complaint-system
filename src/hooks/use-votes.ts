'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Vote, VoteResponse } from '@/types/database.types';
import {
  getVotes,
  hasStudentVoted,
  createVote,
  updateVote,
  deleteVote,
  submitVoteResponse,
  closeVote,
  reopenVote,
} from '@/lib/api/votes';

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

/**
 * Mutation: Create a new vote
 */
export function useCreateVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteData: Omit<Vote, 'id' | 'created_at'>) => createVote(voteData),
    onSuccess: () => {
      // Invalidate all vote queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: voteKeys.all });
    },
  });
}

/**
 * Mutation: Update a vote
 */
export function useUpdateVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      voteId,
      updates,
    }: {
      voteId: string;
      updates: Partial<Omit<Vote, 'id' | 'created_at' | 'created_by'>>;
    }) => updateVote(voteId, updates),
    onSuccess: () => {
      // Invalidate all vote queries
      queryClient.invalidateQueries({ queryKey: voteKeys.all });
    },
  });
}

/**
 * Mutation: Delete a vote
 */
export function useDeleteVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteId: string) => deleteVote(voteId),
    onSuccess: () => {
      // Invalidate all vote queries
      queryClient.invalidateQueries({ queryKey: voteKeys.all });
    },
  });
}

/**
 * Mutation: Submit vote response (student casts a vote)
 */
export function useSubmitVoteResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      voteId,
      studentId,
      selectedOption,
    }: {
      voteId: string;
      studentId: string;
      selectedOption: string;
    }) => submitVoteResponse(voteId, studentId, selectedOption),
    onSuccess: (_, variables) => {
      // Invalidate vote queries
      queryClient.invalidateQueries({ queryKey: voteKeys.all });
      // Invalidate hasVoted query for this specific vote and student
      queryClient.invalidateQueries({
        queryKey: voteKeys.hasVoted(variables.voteId, variables.studentId),
      });
    },
  });
}

/**
 * Mutation: Close a vote
 */
export function useCloseVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteId: string) => closeVote(voteId),
    onSuccess: () => {
      // Invalidate all vote queries
      queryClient.invalidateQueries({ queryKey: voteKeys.all });
    },
  });
}

/**
 * Mutation: Reopen a vote
 */
export function useReopenVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteId: string) => reopenVote(voteId),
    onSuccess: () => {
      // Invalidate all vote queries
      queryClient.invalidateQueries({ queryKey: voteKeys.all });
    },
  });
}
