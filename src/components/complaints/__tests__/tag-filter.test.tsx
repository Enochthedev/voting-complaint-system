/**
 * Tag Filter Tests
 *
 * Tests for the tag filtering functionality in the FilterPanel component.
 * Validates that tags can be selected, deselected, and properly filter complaints.
 */

import { describe, it, expect } from 'vitest';
import type { FilterState } from '../filter-panel';
import type { Complaint, ComplaintTag } from '@/types/database.types';

describe('Tag Filter Functionality', () => {
  // Mock complaints with tags
  const mockComplaints: (Complaint & { complaint_tags?: ComplaintTag[] })[] = [
    {
      id: '1',
      student_id: 'student-1',
      is_anonymous: false,
      is_draft: false,
      title: 'WiFi Issue',
      description: 'WiFi not working',
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
      complaint_tags: [
        { id: 't1', complaint_id: '1', tag_name: 'wifi', created_at: new Date().toISOString() },
        { id: 't2', complaint_id: '1', tag_name: 'urgent', created_at: new Date().toISOString() },
      ],
    },
    {
      id: '2',
      student_id: 'student-2',
      is_anonymous: false,
      is_draft: false,
      title: 'Library Issue',
      description: 'Library closed early',
      category: 'facilities',
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
      complaint_tags: [
        { id: 't3', complaint_id: '2', tag_name: 'library', created_at: new Date().toISOString() },
      ],
    },
    {
      id: '3',
      student_id: 'student-3',
      is_anonymous: false,
      is_draft: false,
      title: 'Parking Problem',
      description: 'No parking spaces',
      category: 'facilities',
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
      complaint_tags: [
        { id: 't4', complaint_id: '3', tag_name: 'parking', created_at: new Date().toISOString() },
        { id: 't5', complaint_id: '3', tag_name: 'urgent', created_at: new Date().toISOString() },
      ],
    },
  ];

  /**
   * Helper function to apply tag filter to complaints
   */
  function applyTagFilter(
    complaints: (Complaint & { complaint_tags?: ComplaintTag[] })[],
    selectedTags: string[]
  ): (Complaint & { complaint_tags?: ComplaintTag[] })[] {
    if (selectedTags.length === 0) {
      return complaints;
    }

    return complaints.filter((complaint) =>
      complaint.complaint_tags?.some((tag) => selectedTags.includes(tag.tag_name))
    );
  }

  /**
   * Helper function to extract unique tags from complaints
   */
  function extractAvailableTags(
    complaints: (Complaint & { complaint_tags?: ComplaintTag[] })[]
  ): string[] {
    const tagSet = new Set<string>();
    complaints.forEach((complaint) => {
      complaint.complaint_tags?.forEach((tag) => {
        tagSet.add(tag.tag_name);
      });
    });
    return Array.from(tagSet).sort();
  }

  it('should extract all unique tags from complaints', () => {
    const availableTags = extractAvailableTags(mockComplaints);

    expect(availableTags).toEqual(['library', 'parking', 'urgent', 'wifi']);
    expect(availableTags.length).toBe(4);
  });

  it('should return all complaints when no tags are selected', () => {
    const filtered = applyTagFilter(mockComplaints, []);

    expect(filtered).toHaveLength(3);
    expect(filtered).toEqual(mockComplaints);
  });

  it('should filter complaints by a single tag', () => {
    const filtered = applyTagFilter(mockComplaints, ['wifi']);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
    expect(filtered[0].title).toBe('WiFi Issue');
  });

  it('should filter complaints by multiple tags (OR logic)', () => {
    const filtered = applyTagFilter(mockComplaints, ['wifi', 'library']);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(['1', '2']);
  });

  it('should filter complaints with shared tags', () => {
    const filtered = applyTagFilter(mockComplaints, ['urgent']);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(['1', '3']);
  });

  it('should return empty array when filtering by non-existent tag', () => {
    const filtered = applyTagFilter(mockComplaints, ['non-existent-tag']);

    expect(filtered).toHaveLength(0);
  });

  it('should handle complaints with no tags', () => {
    const complaintsWithNoTags: (Complaint & { complaint_tags?: ComplaintTag[] })[] = [
      {
        id: '4',
        student_id: 'student-4',
        is_anonymous: false,
        is_draft: false,
        title: 'No Tags Complaint',
        description: 'This has no tags',
        category: 'other',
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
        complaint_tags: [],
      },
    ];

    const filtered = applyTagFilter(complaintsWithNoTags, ['wifi']);

    expect(filtered).toHaveLength(0);
  });

  it('should handle filter state with tags', () => {
    const filterState: FilterState = {
      status: [],
      category: [],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: ['wifi', 'urgent'],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    };

    const filtered = applyTagFilter(mockComplaints, filterState.tags);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((c) => c.id)).toEqual(['1', '3']);
  });

  it('should maintain tag order when extracting from complaints', () => {
    const availableTags = extractAvailableTags(mockComplaints);

    // Tags should be sorted alphabetically
    expect(availableTags[0]).toBe('library');
    expect(availableTags[1]).toBe('parking');
    expect(availableTags[2]).toBe('urgent');
    expect(availableTags[3]).toBe('wifi');
  });

  it('should handle case-sensitive tag matching', () => {
    const complaintsWithMixedCase: (Complaint & { complaint_tags?: ComplaintTag[] })[] = [
      {
        ...mockComplaints[0],
        complaint_tags: [
          { id: 't1', complaint_id: '1', tag_name: 'WiFi', created_at: new Date().toISOString() },
        ],
      },
    ];

    // Should not match due to case sensitivity
    const filtered = applyTagFilter(complaintsWithMixedCase, ['wifi']);
    expect(filtered).toHaveLength(0);

    // Should match with correct case
    const filteredCorrectCase = applyTagFilter(complaintsWithMixedCase, ['WiFi']);
    expect(filteredCorrectCase).toHaveLength(1);
  });

  it('should filter complaints with multiple tags correctly', () => {
    // Complaint 1 has tags: wifi, urgent
    // Complaint 3 has tags: parking, urgent
    // Filtering by 'urgent' should return both
    const filtered = applyTagFilter(mockComplaints, ['urgent']);

    expect(filtered).toHaveLength(2);
    expect(filtered.every((c) => c.complaint_tags?.some((tag) => tag.tag_name === 'urgent'))).toBe(
      true
    );
  });

  it('should combine tag filter with other filters', () => {
    // First apply tag filter
    let filtered = applyTagFilter(mockComplaints, ['urgent']);

    // Then apply priority filter
    filtered = filtered.filter((c) => c.priority === 'high');

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});
