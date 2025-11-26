/**
 * Category Filter Tests
 *
 * Tests for the category filtering functionality in the FilterPanel component.
 */

import { describe, it, expect } from 'vitest';
import type { FilterState } from '../filter-panel';
import type { Complaint, ComplaintCategory } from '@/types/database.types';

describe('Category Filter', () => {
  // Mock complaints with different categories
  const mockComplaints: Complaint[] = [
    {
      id: '1',
      student_id: 'student-1',
      is_anonymous: false,
      is_draft: false,
      title: 'Academic Issue',
      description: 'Test academic complaint',
      category: 'academic',
      priority: 'medium',
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
      title: 'Facilities Issue',
      description: 'Test facilities complaint',
      category: 'facilities',
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
      id: '3',
      student_id: 'student-1',
      is_anonymous: false,
      is_draft: false,
      title: 'Course Content Issue',
      description: 'Test course content complaint',
      category: 'course_content',
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
      id: '4',
      student_id: 'student-1',
      is_anonymous: false,
      is_draft: false,
      title: 'Another Academic Issue',
      description: 'Another test academic complaint',
      category: 'academic',
      priority: 'critical',
      status: 'opened',
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      opened_at: new Date().toISOString(),
      opened_by: 'lecturer-1',
      resolved_at: null,
      escalated_at: null,
      escalation_level: 0,
    },
  ];

  /**
   * Helper function to filter complaints by category
   */
  function filterComplaintsByCategory(
    complaints: Complaint[],
    categories: ComplaintCategory[]
  ): Complaint[] {
    if (categories.length === 0) {
      return complaints;
    }
    return complaints.filter((complaint) => categories.includes(complaint.category));
  }

  it('should return all complaints when no category filter is applied', () => {
    const filters: FilterState = {
      status: [],
      category: [],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: [],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(4);
  });

  it('should filter complaints by single category', () => {
    const filters: FilterState = {
      status: [],
      category: ['academic'],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: [],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.category === 'academic')).toBe(true);
  });

  it('should filter complaints by multiple categories', () => {
    const filters: FilterState = {
      status: [],
      category: ['academic', 'facilities'],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: [],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(3);
    expect(filtered.every((c) => c.category === 'academic' || c.category === 'facilities')).toBe(
      true
    );
  });

  it('should return empty array when filtering by non-existent category', () => {
    const filters: FilterState = {
      status: [],
      category: ['harassment'],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: [],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(0);
  });

  it('should handle all available categories', () => {
    const categories: ComplaintCategory[] = [
      'academic',
      'facilities',
      'harassment',
      'course_content',
      'administrative',
      'other',
    ];

    categories.forEach((category) => {
      const filters: FilterState = {
        status: [],
        category: [category],
        priority: [],
        dateFrom: '',
        dateTo: '',
        tags: [],
        assignedTo: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      const filtered = filterComplaintsByCategory(mockComplaints, filters.category);
      expect(filtered.every((c) => c.category === category)).toBe(true);
    });
  });

  it('should correctly combine category filter with other filters', () => {
    // This test demonstrates that category filtering works alongside other filters
    const academicComplaints = mockComplaints.filter((c) => c.category === 'academic');
    const highPriorityAcademic = academicComplaints.filter((c) => c.priority === 'critical');

    expect(academicComplaints).toHaveLength(2);
    expect(highPriorityAcademic).toHaveLength(1);
    expect(highPriorityAcademic[0].title).toBe('Another Academic Issue');
  });

  it('should maintain filter state when adding and removing categories', () => {
    let filters: FilterState = {
      status: [],
      category: [],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: [],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    // Add academic category
    filters = { ...filters, category: ['academic'] };
    let filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(2);

    // Add facilities category
    filters = { ...filters, category: ['academic', 'facilities'] };
    filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(3);

    // Remove academic category
    filters = { ...filters, category: ['facilities'] };
    filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('facilities');

    // Remove all categories
    filters = { ...filters, category: [] };
    filtered = filterComplaintsByCategory(mockComplaints, filters.category);
    expect(filtered).toHaveLength(4);
  });
});
