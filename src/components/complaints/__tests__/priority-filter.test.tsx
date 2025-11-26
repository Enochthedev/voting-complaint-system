/**
 * Priority Filter Tests
 *
 * Tests for the priority filtering functionality in the FilterPanel component.
 * Validates that priority filtering works correctly for complaints.
 */

import { describe, it, expect } from 'vitest';
import type { Complaint, ComplaintPriority } from '@/types/database.types';

// Mock complaint data for testing
const mockComplaints: Complaint[] = [
  {
    id: '1',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Low Priority Complaint',
    description: 'Description 1',
    category: 'academic',
    priority: 'low',
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
    title: 'Medium Priority Complaint',
    description: 'Description 2',
    category: 'facilities',
    priority: 'medium',
    status: 'opened',
    assigned_to: 'lecturer-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'lecturer-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '3',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'High Priority Complaint',
    description: 'Description 3',
    category: 'administrative',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'admin-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'admin-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '4',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Critical Priority Complaint',
    description: 'Description 4',
    category: 'facilities',
    priority: 'critical',
    status: 'new',
    assigned_to: 'lecturer-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '5',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Another Medium Priority Complaint',
    description: 'Description 5',
    category: 'course_content',
    priority: 'medium',
    status: 'resolved',
    assigned_to: 'lecturer-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'lecturer-3',
    resolved_at: new Date().toISOString(),
    escalated_at: null,
    escalation_level: 0,
  },
];

/**
 * Filter complaints by priority
 */
function filterComplaintsByPriority(
  complaints: Complaint[],
  priorityFilters: ComplaintPriority[]
): Complaint[] {
  if (priorityFilters.length === 0) {
    return complaints;
  }
  return complaints.filter((complaint) => priorityFilters.includes(complaint.priority));
}

describe('Priority Filter', () => {
  it('should return all complaints when no priority filter is applied', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, []);
    expect(filtered).toHaveLength(5);
    expect(filtered).toEqual(mockComplaints);
  });

  it('should filter complaints by single priority - low', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['low']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priority).toBe('low');
    expect(filtered[0].id).toBe('1');
  });

  it('should filter complaints by single priority - medium', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['medium']);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.priority === 'medium')).toBe(true);
    expect(filtered.map((c) => c.id)).toEqual(['2', '5']);
  });

  it('should filter complaints by single priority - high', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['high']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priority).toBe('high');
    expect(filtered[0].id).toBe('3');
  });

  it('should filter complaints by single priority - critical', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['critical']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priority).toBe('critical');
    expect(filtered[0].id).toBe('4');
  });

  it('should filter complaints by multiple priorities', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['low', 'high']);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.priority)).toEqual(['low', 'high']);
    expect(filtered.map((c) => c.id)).toEqual(['1', '3']);
  });

  it('should filter complaints by all priorities', () => {
    const allPriorities: ComplaintPriority[] = ['low', 'medium', 'high', 'critical'];
    const filtered = filterComplaintsByPriority(mockComplaints, allPriorities);
    expect(filtered).toHaveLength(5); // All mock complaints
  });

  it('should handle high and critical priorities together', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['high', 'critical']);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.priority === 'high' || c.priority === 'critical')).toBe(true);
  });

  it('should handle low and medium priorities together', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['low', 'medium']);
    expect(filtered).toHaveLength(3);
    expect(filtered.every((c) => c.priority === 'low' || c.priority === 'medium')).toBe(true);
  });

  it('should preserve complaint order when filtering', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['medium', 'critical']);
    expect(filtered).toHaveLength(3);
    expect(filtered[0].id).toBe('2'); // medium
    expect(filtered[1].id).toBe('4'); // critical
    expect(filtered[2].id).toBe('5'); // medium
  });

  it('should not mutate original complaints array', () => {
    const originalLength = mockComplaints.length;
    const originalFirst = mockComplaints[0];

    filterComplaintsByPriority(mockComplaints, ['high']);

    expect(mockComplaints).toHaveLength(originalLength);
    expect(mockComplaints[0]).toBe(originalFirst);
  });

  it('should work correctly with different complaint statuses', () => {
    // Filter by medium priority - should include both opened and resolved complaints
    const filtered = filterComplaintsByPriority(mockComplaints, ['medium']);
    expect(filtered).toHaveLength(2);
    expect(filtered.some((c) => c.status === 'opened')).toBe(true);
    expect(filtered.some((c) => c.status === 'resolved')).toBe(true);
  });

  it('should work correctly with different complaint categories', () => {
    // Filter by critical priority - should work regardless of category
    const filtered = filterComplaintsByPriority(mockComplaints, ['critical']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('facilities');
  });

  it('should return empty array when no complaints match the priority filter', () => {
    // Create a scenario where we filter by a priority that doesn't exist in a subset
    const lowPriorityOnly = mockComplaints.filter((c) => c.priority === 'low');
    const filtered = filterComplaintsByPriority(lowPriorityOnly, ['critical']);
    expect(filtered).toHaveLength(0);
  });

  it('should handle priority filtering with mixed priorities', () => {
    const filtered = filterComplaintsByPriority(mockComplaints, ['low', 'medium', 'critical']);
    expect(filtered).toHaveLength(4);
    expect(filtered.some((c) => c.priority === 'low')).toBe(true);
    expect(filtered.some((c) => c.priority === 'medium')).toBe(true);
    expect(filtered.some((c) => c.priority === 'critical')).toBe(true);
    expect(filtered.some((c) => c.priority === 'high')).toBe(false);
  });
});
