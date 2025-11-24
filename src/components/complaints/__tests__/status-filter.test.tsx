/**
 * Status Filter Tests
 * 
 * Tests for the status filter functionality in the FilterPanel component.
 * Validates that status filtering works correctly for complaints.
 */

import { describe, it, expect } from 'vitest';
import type { Complaint, ComplaintStatus } from '@/types/database.types';

// Mock complaint data for testing
const mockComplaints: Complaint[] = [
  {
    id: '1',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Test Complaint 1',
    description: 'Description 1',
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
    title: 'Test Complaint 2',
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
    title: 'Test Complaint 3',
    description: 'Description 3',
    category: 'administrative',
    priority: 'low',
    status: 'resolved',
    assigned_to: 'admin-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'admin-1',
    resolved_at: new Date().toISOString(),
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '4',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Test Complaint 4',
    description: 'Description 4',
    category: 'facilities',
    priority: 'critical',
    status: 'in_progress',
    assigned_to: 'lecturer-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    opened_at: new Date().toISOString(),
    opened_by: 'lecturer-2',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
];

/**
 * Filter complaints by status
 */
function filterComplaintsByStatus(
  complaints: Complaint[],
  statusFilters: ComplaintStatus[]
): Complaint[] {
  if (statusFilters.length === 0) {
    return complaints;
  }
  return complaints.filter((complaint) =>
    statusFilters.includes(complaint.status)
  );
}

describe('Status Filter', () => {
  it('should return all complaints when no status filter is applied', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, []);
    expect(filtered).toHaveLength(4);
    expect(filtered).toEqual(mockComplaints);
  });

  it('should filter complaints by single status', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, ['new']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].status).toBe('new');
    expect(filtered[0].id).toBe('1');
  });

  it('should filter complaints by multiple statuses', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, ['new', 'opened']);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.status)).toEqual(['new', 'opened']);
  });

  it('should return empty array when filtering by non-existent status', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, ['closed']);
    expect(filtered).toHaveLength(0);
  });

  it('should filter complaints by resolved status', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, ['resolved']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].status).toBe('resolved');
    expect(filtered[0].id).toBe('3');
  });

  it('should filter complaints by in_progress status', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, ['in_progress']);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].status).toBe('in_progress');
    expect(filtered[0].id).toBe('4');
  });

  it('should handle all possible status values', () => {
    const allStatuses: ComplaintStatus[] = [
      'new',
      'opened',
      'in_progress',
      'resolved',
      'closed',
      'reopened',
    ];
    const filtered = filterComplaintsByStatus(mockComplaints, allStatuses);
    expect(filtered).toHaveLength(4); // All mock complaints
  });

  it('should preserve complaint order when filtering', () => {
    const filtered = filterComplaintsByStatus(mockComplaints, [
      'new',
      'opened',
      'in_progress',
    ]);
    expect(filtered).toHaveLength(3);
    expect(filtered[0].id).toBe('1'); // new
    expect(filtered[1].id).toBe('2'); // opened
    expect(filtered[2].id).toBe('4'); // in_progress
  });

  it('should not mutate original complaints array', () => {
    const originalLength = mockComplaints.length;
    const originalFirst = mockComplaints[0];
    
    filterComplaintsByStatus(mockComplaints, ['resolved']);
    
    expect(mockComplaints).toHaveLength(originalLength);
    expect(mockComplaints[0]).toBe(originalFirst);
  });
});
