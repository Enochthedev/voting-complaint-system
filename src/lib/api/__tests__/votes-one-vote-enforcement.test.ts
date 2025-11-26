/**
 * Test suite for enforcing one vote per student per poll
 *
 * This test verifies that:
 * 1. A student can vote once on a poll
 * 2. A student cannot vote twice on the same poll
 * 3. Different students can vote on the same poll
 * 4. The database constraint properly prevents duplicate votes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createVote, submitVoteResponse, hasStudentVoted, getVoteResults } from '../votes';
import type { Vote } from '@/types/database.types';

describe('One Vote Per Student Per Poll Enforcement', () => {
  let testVote: Vote;
  const student1Id = 'student-1';
  const student2Id = 'student-2';
  const student3Id = 'student-3';

  beforeEach(async () => {
    // Create a fresh test vote for each test
    testVote = await createVote({
      created_by: 'lecturer-1',
      title: 'Test Poll - One Vote Enforcement',
      description: 'Testing one vote per student constraint',
      options: ['Option A', 'Option B', 'Option C'],
      is_active: true,
      related_complaint_id: null,
      closes_at: null,
    });
  });

  it('should allow a student to vote once on a poll', async () => {
    // Student 1 votes for Option A
    const response = await submitVoteResponse(testVote.id, student1Id, 'Option A');

    expect(response).toBeDefined();
    expect(response.vote_id).toBe(testVote.id);
    expect(response.student_id).toBe(student1Id);
    expect(response.selected_option).toBe('Option A');

    // Verify the student has voted
    const voted = await hasStudentVoted(testVote.id, student1Id);
    expect(voted).toBe(true);
  });

  it('should prevent a student from voting twice on the same poll', async () => {
    // Student 1 votes for Option A
    await submitVoteResponse(testVote.id, student1Id, 'Option A');

    // Student 1 tries to vote again for Option B
    await expect(submitVoteResponse(testVote.id, student1Id, 'Option B')).rejects.toThrow(
      'You have already voted on this poll'
    );

    // Verify only one vote was recorded
    const results = await getVoteResults(testVote.id);
    expect(results['Option A']).toBe(1);
    expect(results['Option B']).toBeUndefined();
  });

  it('should allow different students to vote on the same poll', async () => {
    // Student 1 votes for Option A
    await submitVoteResponse(testVote.id, student1Id, 'Option A');

    // Student 2 votes for Option B
    await submitVoteResponse(testVote.id, student2Id, 'Option B');

    // Student 3 votes for Option A
    await submitVoteResponse(testVote.id, student3Id, 'Option A');

    // Verify all votes were recorded
    const results = await getVoteResults(testVote.id);
    expect(results['Option A']).toBe(2);
    expect(results['Option B']).toBe(1);
    expect(results['Option C']).toBeUndefined();

    // Verify each student has voted
    expect(await hasStudentVoted(testVote.id, student1Id)).toBe(true);
    expect(await hasStudentVoted(testVote.id, student2Id)).toBe(true);
    expect(await hasStudentVoted(testVote.id, student3Id)).toBe(true);
  });

  it('should prevent duplicate votes even with different options', async () => {
    // Student 1 votes for Option A
    await submitVoteResponse(testVote.id, student1Id, 'Option A');

    // Student 1 tries to change vote to Option C
    await expect(submitVoteResponse(testVote.id, student1Id, 'Option C')).rejects.toThrow(
      'You have already voted on this poll'
    );

    // Verify original vote is still recorded
    const results = await getVoteResults(testVote.id);
    expect(results['Option A']).toBe(1);
    expect(results['Option C']).toBeUndefined();
  });

  it('should correctly track which students have voted', async () => {
    // Initially, no students have voted
    expect(await hasStudentVoted(testVote.id, student1Id)).toBe(false);
    expect(await hasStudentVoted(testVote.id, student2Id)).toBe(false);

    // Student 1 votes
    await submitVoteResponse(testVote.id, student1Id, 'Option A');

    // Only student 1 should show as having voted
    expect(await hasStudentVoted(testVote.id, student1Id)).toBe(true);
    expect(await hasStudentVoted(testVote.id, student2Id)).toBe(false);

    // Student 2 votes
    await submitVoteResponse(testVote.id, student2Id, 'Option B');

    // Both students should show as having voted
    expect(await hasStudentVoted(testVote.id, student1Id)).toBe(true);
    expect(await hasStudentVoted(testVote.id, student2Id)).toBe(true);
  });

  it('should allow a student to vote on multiple different polls', async () => {
    // Create a second poll
    const testVote2 = await createVote({
      created_by: 'lecturer-1',
      title: 'Second Test Poll',
      description: 'Testing voting on multiple polls',
      options: ['Yes', 'No'],
      is_active: true,
      related_complaint_id: null,
      closes_at: null,
    });

    // Student 1 votes on first poll
    await submitVoteResponse(testVote.id, student1Id, 'Option A');

    // Student 1 should be able to vote on second poll
    const response2 = await submitVoteResponse(testVote2.id, student1Id, 'Yes');

    expect(response2).toBeDefined();
    expect(response2.vote_id).toBe(testVote2.id);
    expect(response2.student_id).toBe(student1Id);

    // Verify student has voted on both polls
    expect(await hasStudentVoted(testVote.id, student1Id)).toBe(true);
    expect(await hasStudentVoted(testVote2.id, student1Id)).toBe(true);
  });

  it('should maintain vote integrity across multiple students and options', async () => {
    // Multiple students vote for different options
    await submitVoteResponse(testVote.id, student1Id, 'Option A');
    await submitVoteResponse(testVote.id, student2Id, 'Option A');
    await submitVoteResponse(testVote.id, student3Id, 'Option B');

    // Get results
    const results = await getVoteResults(testVote.id);

    // Verify correct vote counts
    expect(results['Option A']).toBe(2);
    expect(results['Option B']).toBe(1);
    expect(results['Option C']).toBeUndefined();

    // Verify total vote count
    const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
    expect(totalVotes).toBe(3);
  });
});
