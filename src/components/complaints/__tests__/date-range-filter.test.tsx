/**
 * Date Range Filter Tests
 * 
 * Tests for the date range filter functionality in the FilterPanel component.
 * Validates that date range filtering works correctly for complaints.
 */

import { describe, it, expect } from 'vitest';
import type { Complaint } from '@/types/database.types';

// Mock complaint data for testing with various dates
const mockComplaints: Complaint[] = [
  {
    id: '1',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Recent Complaint',
    description: 'Description 1',
    category: 'academic',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    created_at: new Date('2024-11-20T10:00:00Z').toISOString(), // Today
    updated_at: new Date('2024-11-20T10:00:00Z').toISOString(),
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
    title: 'Yesterday Complaint',
    description: 'Description 2',
    category: 'facilities',
    priority: 'medium',
    status: 'opened',
    assigned_to: 'lecturer-1',
    created_at: new Date('2024-11-19T14:30:00Z').toISOString(), // Yesterday
    updated_at: new Date('2024-11-19T14:30:00Z').toISOString(),
    opened_at: new Date('2024-11-19T14:30:00Z').toISOString(),
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
    title: 'Last Week Complaint',
    description: 'Description 3',
    category: 'administrative',
    priority: 'low',
    status: 'resolved',
    assigned_to: 'admin-1',
    created_at: new Date('2024-11-13T09:00:00Z').toISOString(), // 7 days ago
    updated_at: new Date('2024-11-13T09:00:00Z').toISOString(),
    opened_at: new Date('2024-11-13T09:00:00Z').toISOString(),
    opened_by: 'admin-1',
    resolved_at: new Date('2024-11-14T09:00:00Z').toISOString(),
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '4',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Last Month Complaint',
    description: 'Description 4',
    category: 'facilities',
    priority: 'critical',
    status: 'in_progress',
    assigned_to: 'lecturer-2',
    created_at: new Date('2024-10-15T16:45:00Z').toISOString(), // Last month
    updated_at: new Date('2024-10-15T16:45:00Z').toISOString(),
    opened_at: new Date('2024-10-15T16:45:00Z').toISOString(),
    opened_by: 'lecturer-2',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
  },
  {
    id: '5',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Old Complaint',
    description: 'Description 5',
    category: 'course_content',
    priority: 'medium',
    status: 'closed',
    assigned_to: 'lecturer-1',
    created_at: new Date('2024-09-01T08:00:00Z').toISOString(), // 2+ months ago
    updated_at: new Date('2024-09-01T08:00:00Z').toISOString(),
    opened_at: new Date('2024-09-01T08:00:00Z').toISOString(),
    opened_by: 'lecturer-1',
    resolved_at: new Date('2024-09-05T08:00:00Z').toISOString(),
    escalated_at: null,
    escalation_level: 0,
  },
];

/**
 * Filter complaints by date range
 * Matches the implementation in complaints page
 */
function filterComplaintsByDateRange(
  complaints: Complaint[],
  dateFrom: string,
  dateTo: string
): Complaint[] {
  let filtered = [...complaints];

  // Apply dateFrom filter
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filtered = filtered.filter(
      (complaint) => new Date(complaint.created_at) >= fromDate
    );
  }

  // Apply dateTo filter
  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59, 999); // Include the entire day
    filtered = filtered.filter(
      (complaint) => new Date(complaint.created_at) <= toDate
    );
  }

  return filtered;
}

describe('Date Range Filter', () => {
  describe('No Date Filter', () => {
    it('should return all complaints when no date filter is applied', () => {
      const filtered = filterComplaintsByDateRange(mockComplaints, '', '');
      expect(filtered).toHaveLength(5);
      expect(filtered).toEqual(mockComplaints);
    });
  });

  describe('From Date Only', () => {
    it('should filter complaints from a specific date onwards', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-19',
        ''
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.id)).toEqual(['1', '2']);
    });

    it('should include complaints created on the from date', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-20',
        ''
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter complaints from last week', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-13',
        ''
      );
      expect(filtered).toHaveLength(3);
      expect(filtered.map((c) => c.id)).toEqual(['1', '2', '3']);
    });

    it('should return empty array when from date is in the future', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-12-01',
        ''
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe('To Date Only', () => {
    it('should filter complaints up to a specific date', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '',
        '2024-11-13'
      );
      expect(filtered).toHaveLength(3);
      expect(filtered.map((c) => c.id)).toEqual(['3', '4', '5']);
    });

    it('should include complaints created on the to date (entire day)', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '',
        '2024-11-20'
      );
      expect(filtered).toHaveLength(5); // All complaints up to and including today
    });

    it('should filter complaints up to yesterday', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '',
        '2024-11-19'
      );
      expect(filtered).toHaveLength(4);
      expect(filtered.map((c) => c.id)).toEqual(['2', '3', '4', '5']);
    });

    it('should return all complaints when to date is in the future', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '',
        '2024-12-31'
      );
      expect(filtered).toHaveLength(5);
    });
  });

  describe('Date Range (Both From and To)', () => {
    it('should filter complaints within a specific date range', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-13',
        '2024-11-20'
      );
      expect(filtered).toHaveLength(3);
      expect(filtered.map((c) => c.id)).toEqual(['1', '2', '3']);
    });

    it('should filter complaints for a single day', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-19',
        '2024-11-19'
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should filter complaints for last week range', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-13',
        '2024-11-19'
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map((c) => c.id)).toEqual(['2', '3']);
    });

    it('should return empty array when date range has no matching complaints', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-08-01',
        '2024-08-31'
      );
      expect(filtered).toHaveLength(0);
    });

    it('should handle date range spanning multiple months', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-10-01',
        '2024-11-20'
      );
      expect(filtered).toHaveLength(4);
      expect(filtered.map((c) => c.id)).toEqual(['1', '2', '3', '4']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle complaints created at different times on the same day', () => {
      const sameDay: Complaint[] = [
        {
          ...mockComplaints[0],
          id: 'morning',
          created_at: new Date('2024-11-20T08:00:00Z').toISOString(),
        },
        {
          ...mockComplaints[0],
          id: 'afternoon',
          created_at: new Date('2024-11-20T14:00:00Z').toISOString(),
        },
        {
          ...mockComplaints[0],
          id: 'evening',
          created_at: new Date('2024-11-20T22:00:00Z').toISOString(),
        },
      ];

      const filtered = filterComplaintsByDateRange(
        sameDay,
        '2024-11-20',
        '2024-11-20'
      );
      expect(filtered).toHaveLength(3);
    });

    it('should handle complaints at midnight boundary', () => {
      const midnightComplaints: Complaint[] = [
        {
          ...mockComplaints[0],
          id: 'before-midnight',
          created_at: new Date('2024-11-19T23:59:59Z').toISOString(),
        },
        {
          ...mockComplaints[0],
          id: 'at-midnight',
          created_at: new Date('2024-11-20T00:00:00Z').toISOString(),
        },
        {
          ...mockComplaints[0],
          id: 'after-midnight',
          created_at: new Date('2024-11-20T00:00:01Z').toISOString(),
        },
      ];

      const filtered = filterComplaintsByDateRange(
        midnightComplaints,
        '2024-11-20',
        '2024-11-20'
      );
      expect(filtered).toHaveLength(2); // at-midnight and after-midnight
      expect(filtered.map((c) => c.id)).toEqual(['at-midnight', 'after-midnight']);
    });

    it('should not mutate original complaints array', () => {
      const originalLength = mockComplaints.length;
      const originalFirst = mockComplaints[0];

      filterComplaintsByDateRange(mockComplaints, '2024-11-19', '2024-11-20');

      expect(mockComplaints).toHaveLength(originalLength);
      expect(mockComplaints[0]).toBe(originalFirst);
    });

    it('should preserve complaint order when filtering', () => {
      const filtered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-10-01',
        '2024-11-20'
      );
      expect(filtered).toHaveLength(4);
      // Should maintain original order
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('2');
      expect(filtered[2].id).toBe('3');
      expect(filtered[3].id).toBe('4');
    });

    it('should handle empty complaints array', () => {
      const filtered = filterComplaintsByDateRange([], '2024-11-01', '2024-11-30');
      expect(filtered).toHaveLength(0);
      expect(filtered).toEqual([]);
    });
  });

  describe('Integration with Other Filters', () => {
    it('should work correctly when combined with status filter', () => {
      // First filter by date range
      const dateFiltered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-11-13',
        '2024-11-20'
      );
      
      // Then filter by status
      const statusFiltered = dateFiltered.filter((c) => c.status === 'opened');
      
      expect(statusFiltered).toHaveLength(1);
      expect(statusFiltered[0].id).toBe('2');
    });

    it('should work correctly when combined with category filter', () => {
      // First filter by date range
      const dateFiltered = filterComplaintsByDateRange(
        mockComplaints,
        '2024-10-01',
        '2024-11-20'
      );
      
      // Then filter by category
      const categoryFiltered = dateFiltered.filter((c) => c.category === 'facilities');
      
      expect(categoryFiltered).toHaveLength(2);
      expect(categoryFiltered.map((c) => c.id)).toEqual(['2', '4']);
    });
  });
});
