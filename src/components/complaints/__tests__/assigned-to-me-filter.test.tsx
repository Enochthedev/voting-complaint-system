/**
 * Assigned to Me Quick Filter Tests
 *
 * Tests for the "Assigned to Me" quick filter button functionality.
 * Validates that the quick filter correctly filters complaints assigned to the current user.
 */

import { describe, it, expect } from 'vitest';
import type { Complaint } from '@/types/database.types';

// Mock complaint data for testing
const mockComplaints: Complaint[] = [
  {
    id: '1',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Unassigned Complaint',
    description: 'This complaint has not been assigned yet',
    category: 'academic',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '2',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Complaint Assigned to Current User',
    description: 'This complaint is assigned to the current user',
    category: 'facilities',
    priority: 'medium',
    status: 'opened',
    assigned_to: 'current-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'current-user-id',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '3',
    student_id: 'student-2',
    is_anonymous: false,
    is_draft: false,
    title: 'Complaint Assigned to Another User',
    description: 'This complaint is assigned to another user',
    category: 'administrative',
    priority: 'low',
    status: 'in_progress',
    assigned_to: 'other-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'other-user-id',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '4',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Another Complaint for Current User',
    description: 'This is another complaint assigned to the current user',
    category: 'facilities',
    priority: 'critical',
    status: 'in_progress',
    assigned_to: 'current-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'current-user-id',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '5',
    student_id: 'student-3',
    is_anonymous: false,
    is_draft: false,
    title: 'Resolved Complaint for Current User',
    description: 'This complaint is assigned to current user and resolved',
    category: 'course_content',
    priority: 'high',
    status: 'resolved',
    assigned_to: 'current-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'current-user-id',
    resolved_at: new Date().toISOString(),
    escalated_at: null,
    escalation_level: 0,
  },
];

/**
 * Apply "Assigned to Me" quick filter
 */
function applyAssignedToMeFilter(complaints: Complaint[], currentUserId: string): Complaint[] {
  return complaints.filter((complaint) => complaint.assigned_to === currentUserId);
}

describe('Assigned to Me Quick Filter', () => {
  const currentUserId = 'current-user-id';

  it('should filter complaints assigned to the current user', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered).toHaveLength(3);
    expect(filtered.every((c) => c.assigned_to === currentUserId)).toBe(true);
  });

  it('should include complaints with different statuses', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered).toHaveLength(3);

    const statuses = filtered.map((c) => c.status);
    expect(statuses).toContain('opened');
    expect(statuses).toContain('in_progress');
    expect(statuses).toContain('resolved');
  });

  it('should include complaints with different priorities', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered).toHaveLength(3);

    const priorities = filtered.map((c) => c.priority);
    expect(priorities).toContain('medium');
    expect(priorities).toContain('critical');
    expect(priorities).toContain('high');
  });

  it('should exclude unassigned complaints', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered.every((c) => c.assigned_to !== null)).toBe(true);
    expect(filtered.find((c) => c.id === '1')).toBeUndefined();
  });

  it('should exclude complaints assigned to other users', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered.find((c) => c.id === '3')).toBeUndefined();
    expect(filtered.every((c) => c.assigned_to === currentUserId)).toBe(true);
  });

  it('should return empty array when no complaints are assigned to current user', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, 'non-existent-user');
    expect(filtered).toHaveLength(0);
  });

  it('should preserve complaint order', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered).toHaveLength(3);
    expect(filtered[0].id).toBe('2');
    expect(filtered[1].id).toBe('4');
    expect(filtered[2].id).toBe('5');
  });

  it('should not mutate original complaints array', () => {
    const originalLength = mockComplaints.length;
    const originalFirst = mockComplaints[0];

    applyAssignedToMeFilter(mockComplaints, currentUserId);

    expect(mockComplaints).toHaveLength(originalLength);
    expect(mockComplaints[0]).toBe(originalFirst);
  });

  it('should work with different complaint categories', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);
    expect(filtered).toHaveLength(3);

    const categories = filtered.map((c) => c.category);
    expect(categories).toContain('facilities');
    expect(categories).toContain('course_content');
  });

  it('should handle empty complaints array', () => {
    const filtered = applyAssignedToMeFilter([], currentUserId);
    expect(filtered).toHaveLength(0);
  });

  it('should correctly identify all complaints for a specific user', () => {
    const filtered = applyAssignedToMeFilter(mockComplaints, currentUserId);

    // Verify all returned complaints belong to current user
    expect(filtered.every((c) => c.assigned_to === currentUserId)).toBe(true);

    // Verify we got all complaints for current user
    const expectedIds = ['2', '4', '5'];
    const actualIds = filtered.map((c) => c.id);
    expect(actualIds).toEqual(expectedIds);
  });

  it('should work when combined with other filters (status)', () => {
    // First apply "Assigned to Me" filter
    const assignedToMe = applyAssignedToMeFilter(mockComplaints, currentUserId);

    // Then apply status filter for unresolved complaints
    const unresolvedStatuses = ['new', 'opened', 'in_progress', 'reopened'];
    const filtered = assignedToMe.filter((c) => unresolvedStatuses.includes(c.status));

    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.assigned_to === currentUserId)).toBe(true);
    expect(filtered.every((c) => unresolvedStatuses.includes(c.status))).toBe(true);
  });

  it('should work when combined with other filters (priority)', () => {
    // First apply "Assigned to Me" filter
    const assignedToMe = applyAssignedToMeFilter(mockComplaints, currentUserId);

    // Then apply priority filter for high priority complaints
    const highPriorities = ['high', 'critical'];
    const filtered = assignedToMe.filter((c) => highPriorities.includes(c.priority));

    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.assigned_to === currentUserId)).toBe(true);
    expect(filtered.every((c) => highPriorities.includes(c.priority))).toBe(true);
  });
});
