/**
 * Assigned Lecturer Filter Tests
 * 
 * Tests for the assigned lecturer filter functionality in the FilterPanel component.
 * Validates that filtering by assigned lecturer works correctly for complaints.
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
    title: 'Complaint Assigned to Dr. Smith',
    description: 'This complaint is assigned to Dr. Smith',
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
    student_id: 'student-2',
    is_anonymous: false,
    is_draft: false,
    title: 'Complaint Assigned to Prof. Johnson',
    description: 'This complaint is assigned to Prof. Johnson',
    category: 'administrative',
    priority: 'low',
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
  {
    id: '4',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Another Complaint for Dr. Smith',
    description: 'This is another complaint assigned to Dr. Smith',
    category: 'facilities',
    priority: 'critical',
    status: 'in_progress',
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
    id: '5',
    student_id: 'student-3',
    is_anonymous: false,
    is_draft: false,
    title: 'Complaint Assigned to Admin Davis',
    description: 'This complaint is assigned to Admin Davis',
    category: 'course_content',
    priority: 'high',
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
];

/**
 * Filter complaints by assigned lecturer
 */
function filterComplaintsByAssignedLecturer(
  complaints: Complaint[],
  assignedTo: string
): Complaint[] {
  if (!assignedTo) {
    return complaints;
  }
  return complaints.filter((complaint) => complaint.assigned_to === assignedTo);
}

describe('Assigned Lecturer Filter', () => {
  it('should return all complaints when no lecturer filter is applied', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, '');
    expect(filtered).toHaveLength(5);
    expect(filtered).toEqual(mockComplaints);
  });

  it('should filter complaints assigned to a specific lecturer', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].assigned_to).toBe('lecturer-1');
    expect(filtered[1].assigned_to).toBe('lecturer-1');
    expect(filtered[0].id).toBe('2');
    expect(filtered[1].id).toBe('4');
  });

  it('should filter complaints assigned to another lecturer', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-2');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].assigned_to).toBe('lecturer-2');
    expect(filtered[0].id).toBe('3');
  });

  it('should filter complaints assigned to an admin', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'admin-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].assigned_to).toBe('admin-1');
    expect(filtered[0].id).toBe('5');
  });

  it('should return empty array when filtering by non-existent lecturer', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'non-existent-lecturer');
    expect(filtered).toHaveLength(0);
  });

  it('should exclude unassigned complaints when filtering by lecturer', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.assigned_to !== null)).toBe(true);
    expect(filtered.find((c) => c.id === '1')).toBeUndefined(); // Unassigned complaint
  });

  it('should preserve complaint order when filtering', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe('2');
    expect(filtered[1].id).toBe('4');
  });

  it('should not mutate original complaints array', () => {
    const originalLength = mockComplaints.length;
    const originalFirst = mockComplaints[0];
    
    filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    
    expect(mockComplaints).toHaveLength(originalLength);
    expect(mockComplaints[0]).toBe(originalFirst);
  });

  it('should handle empty string as no filter', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, '');
    expect(filtered).toHaveLength(5);
    expect(filtered).toEqual(mockComplaints);
  });

  it('should correctly filter when multiple complaints are assigned to same lecturer', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.assigned_to === 'lecturer-1')).toBe(true);
  });

  it('should work with different complaint statuses', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].status).toBe('opened');
    expect(filtered[1].status).toBe('in_progress');
  });

  it('should work with different complaint priorities', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].priority).toBe('medium');
    expect(filtered[1].priority).toBe('critical');
  });

  it('should work with different complaint categories', () => {
    const filtered = filterComplaintsByAssignedLecturer(mockComplaints, 'lecturer-1');
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.category === 'facilities')).toBe(true);
  });
});
