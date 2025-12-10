import type { Vote, VoteResponse } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';

/**
 * Vote API functions
 *
 * Connected to Supabase API (Phase 12).
 */

/**
 * Create a new vote
 * @param voteData - Partial vote data (without id and created_at)
 * @returns Created vote
 */
async function createVoteImpl(voteData: Omit<Vote, 'id' | 'created_at'>): Promise<Vote> {
  const { data, error } = await supabase.from('votes').insert(voteData).select().single();

  if (error) {
    throw new Error(error.message || 'Failed to create vote');
  }

  // Note: Vote notifications are created automatically via database trigger
  // See: supabase/migrations/*_create_vote_notification_trigger.sql

  return data;
}

export const createVote = withRateLimit(createVoteImpl, 'write');

/**
 * Get all votes (with optional filtering)
 * @param options - Filter options
 * @returns Array of votes
 */
async function getVotesImpl(options?: { isActive?: boolean; createdBy?: string }): Promise<Vote[]> {
  let query = supabase.from('votes').select('*');

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }

  if (options?.createdBy) {
    query = query.eq('created_by', options.createdBy);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to fetch votes');
  }

  return data || [];
}

export const getVotes = withRateLimit(getVotesImpl, 'read');

/**
 * Get a single vote by ID
 * @param voteId - Vote ID
 * @returns Vote or null if not found
 */
async function getVoteByIdImpl(voteId: string): Promise<Vote | null> {
  const { data, error } = await supabase.from('votes').select('*').eq('id', voteId).maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch vote');
  }

  return data;
}

export const getVoteById = withRateLimit(getVoteByIdImpl, 'read');

/**
 * Update a vote
 * @param voteId - Vote ID
 * @param updates - Partial vote data to update
 * @returns Updated vote
 */
async function updateVoteImpl(
  voteId: string,
  updates: Partial<Omit<Vote, 'id' | 'created_at' | 'created_by'>>
): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .update(updates)
    .eq('id', voteId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update vote');
  }

  return data;
}

export const updateVote = withRateLimit(updateVoteImpl, 'write');

/**
 * Delete a vote
 * @param voteId - Vote ID
 */
async function deleteVoteImpl(voteId: string): Promise<void> {
  const { error } = await supabase.from('votes').delete().eq('id', voteId);

  if (error) {
    throw new Error(error.message || 'Failed to delete vote');
  }

  // Note: Associated vote_responses are automatically deleted via CASCADE foreign key
}

export const deleteVote = withRateLimit(deleteVoteImpl, 'write');

/**
 * Submit a vote response (student casts a vote)
 * @param voteId - Vote ID
 * @param studentId - Student ID
 * @param selectedOption - Selected option text
 * @returns Created vote response
 *
 * Note: The database enforces one vote per student per poll via a UNIQUE constraint
 * on (vote_id, student_id). If a student tries to vote twice, the database will
 * reject the insert with a constraint violation error.
 */
async function submitVoteResponseImpl(
  voteId: string,
  studentId: string,
  selectedOption: string
): Promise<VoteResponse> {
  // The database has a UNIQUE constraint on (vote_id, student_id) which enforces
  // one vote per student per poll. The constraint will automatically prevent duplicates.

  const { data, error } = await supabase
    .from('vote_responses')
    .insert({ vote_id: voteId, student_id: studentId, selected_option: selectedOption })
    .select()
    .single();

  if (error) {
    // Check if error is due to unique constraint violation (duplicate vote)
    if (error.code === '23505' && error.message.includes('vote_responses_vote_id_student_id_key')) {
      throw new Error('You have already voted on this poll');
    }
    throw new Error(error.message || 'Failed to submit vote');
  }

  return data;
}

export const submitVoteResponse = withRateLimit(submitVoteResponseImpl, 'write');

/**
 * Get vote responses for a specific vote
 * @param voteId - Vote ID
 * @returns Array of vote responses
 */
async function getVoteResponsesImpl(voteId: string): Promise<VoteResponse[]> {
  const { data, error } = await supabase.from('vote_responses').select('*').eq('vote_id', voteId);

  if (error) {
    throw new Error(error.message || 'Failed to fetch vote responses');
  }

  return data || [];
}

export const getVoteResponses = withRateLimit(getVoteResponsesImpl, 'read');

/**
 * Check if a student has voted on a specific vote
 * @param voteId - Vote ID
 * @param studentId - Student ID
 * @returns true if student has voted, false otherwise
 */
async function hasStudentVotedImpl(voteId: string, studentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('vote_responses')
    .select('id')
    .eq('vote_id', voteId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if student voted:', error);
    return false;
  }

  return !!data;
}

export const hasStudentVoted = withRateLimit(hasStudentVotedImpl, 'read');

/**
 * Get vote results (aggregated by option)
 * @param voteId - Vote ID
 * @returns Object with option counts
 */
async function getVoteResultsImpl(voteId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('vote_responses')
    .select('selected_option')
    .eq('vote_id', voteId);

  if (error) {
    throw new Error(error.message || 'Failed to fetch vote results');
  }

  const results: Record<string, number> = {};
  (data || []).forEach((response: any) => {
    results[response.selected_option] = (results[response.selected_option] || 0) + 1;
  });

  return results;
}

export const getVoteResults = withRateLimit(getVoteResultsImpl, 'read');

/**
 * Close a vote (set is_active to false)
 * @param voteId - Vote ID
 * @returns Updated vote
 */
async function closeVoteImpl(voteId: string): Promise<Vote> {
  return updateVoteImpl(voteId, { is_active: false });
}

export const closeVote = withRateLimit(closeVoteImpl, 'write');

/**
 * Reopen a vote (set is_active to true)
 * @param voteId - Vote ID
 * @returns Updated vote
 */
async function reopenVoteImpl(voteId: string): Promise<Vote> {
  return updateVoteImpl(voteId, { is_active: true });
}

export const reopenVote = withRateLimit(reopenVoteImpl, 'write');
