import type { Vote, VoteResponse } from '@/types/database.types';
import { supabase } from '@/lib/supabase';

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
export async function createVote(voteData: Omit<Vote, 'id' | 'created_at'>): Promise<Vote> {
  const { data, error } = await supabase.from('votes').insert(voteData).select().single();

  if (error) {
    throw new Error(error.message || 'Failed to create vote');
  }

  // Note: Vote notifications are created automatically via database trigger
  // See: supabase/migrations/*_create_vote_notification_trigger.sql

  return data;
}

/**
 * Get all votes (with optional filtering)
 * @param options - Filter options
 * @returns Array of votes
 */
export async function getVotes(options?: {
  isActive?: boolean;
  createdBy?: string;
}): Promise<Vote[]> {
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

/**
 * Get a single vote by ID
 * @param voteId - Vote ID
 * @returns Vote or null if not found
 */
export async function getVoteById(voteId: string): Promise<Vote | null> {
  const { data, error } = await supabase.from('votes').select('*').eq('id', voteId).maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch vote');
  }

  return data;
}

/**
 * Update a vote
 * @param voteId - Vote ID
 * @param updates - Partial vote data to update
 * @returns Updated vote
 */
export async function updateVote(
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

/**
 * Delete a vote
 * @param voteId - Vote ID
 */
export async function deleteVote(voteId: string): Promise<void> {
  const { error } = await supabase.from('votes').delete().eq('id', voteId);

  if (error) {
    throw new Error(error.message || 'Failed to delete vote');
  }

  // Note: Associated vote_responses are automatically deleted via CASCADE foreign key
}

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
export async function submitVoteResponse(
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

/**
 * Get vote responses for a specific vote
 * @param voteId - Vote ID
 * @returns Array of vote responses
 */
export async function getVoteResponses(voteId: string): Promise<VoteResponse[]> {
  const { data, error } = await supabase
    .from('vote_responses')
    .select('*')
    .eq('vote_id', voteId);

  if (error) {
    throw new Error(error.message || 'Failed to fetch vote responses');
  }

  return data || [];
}

/**
 * Check if a student has voted on a specific vote
 * @param voteId - Vote ID
 * @param studentId - Student ID
 * @returns true if student has voted, false otherwise
 */
export async function hasStudentVoted(voteId: string, studentId: string): Promise<boolean> {
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

/**
 * Get vote results (aggregated by option)
 * @param voteId - Vote ID
 * @returns Object with option counts
 */
export async function getVoteResults(voteId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('vote_responses')
    .select('selected_option')
    .eq('vote_id', voteId);

  if (error) {
    throw new Error(error.message || 'Failed to fetch vote results');
  }

  const results: Record<string, number> = {};
  (data || []).forEach((response) => {
    results[response.selected_option] = (results[response.selected_option] || 0) + 1;
  });

  return results;
}

/**
 * Close a vote (set is_active to false)
 * @param voteId - Vote ID
 * @returns Updated vote
 */
export async function closeVote(voteId: string): Promise<Vote> {
  return updateVote(voteId, { is_active: false });
}

/**
 * Reopen a vote (set is_active to true)
 * @param voteId - Vote ID
 * @returns Updated vote
 */
export async function reopenVote(voteId: string): Promise<Vote> {
  return updateVote(voteId, { is_active: true });
}
