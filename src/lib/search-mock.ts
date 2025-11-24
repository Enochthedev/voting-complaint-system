/**
 * Mock Search Utilities
 * 
 * Mock implementation of search functionality for UI development.
 * This allows testing the search UI without requiring database setup.
 * 
 * NOTE: This is temporary for UI development. Will be replaced with
 * real search implementation in Phase 12.
 */

import type { Complaint, ComplaintTag } from '@/types/database.types';
import type { SearchOptions, SearchResult } from './search';

// Mock complaints data for search testing
const MOCK_SEARCH_COMPLAINTS: (Complaint & { complaint_tags?: ComplaintTag[] })[] = [
  {
    id: '1',
    student_id: 'mock-student-id',
    is_anonymous: false,
    is_draft: false,
    title: 'Broken Air Conditioning in Lecture Hall A',
    description: '<p>The air conditioning system in Lecture Hall A has been malfunctioning for the past week. The temperature is unbearable during afternoon classes, making it difficult to concentrate.</p>',
    category: 'facilities',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't1', complaint_id: '1', tag_name: 'air-conditioning', created_at: new Date().toISOString() },
      { id: 't2', complaint_id: '1', tag_name: 'lecture-hall', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '2',
    student_id: null,
    is_anonymous: true,
    is_draft: false,
    title: 'Unfair Grading in CS101',
    description: '<p>I believe the grading criteria for the recent CS101 assignment were not clearly communicated. Several students received lower grades than expected without proper feedback.</p>',
    category: 'academic',
    priority: 'medium',
    status: 'opened',
    assigned_to: 'lecturer-1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    opened_by: 'lecturer-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't4', complaint_id: '2', tag_name: 'grading', created_at: new Date().toISOString() },
      { id: 't5', complaint_id: '2', tag_name: 'cs101', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '3',
    student_id: 'mock-student-id',
    is_anonymous: false,
    is_draft: false,
    title: 'Library WiFi Connection Issues',
    description: '<p>The WiFi in the library keeps disconnecting every 10-15 minutes. This is affecting my ability to complete online assignments and research.</p>',
    category: 'facilities',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 'admin-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'admin-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't6', complaint_id: '3', tag_name: 'wifi', created_at: new Date().toISOString() },
      { id: 't7', complaint_id: '3', tag_name: 'library', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '4',
    student_id: 'mock-student-id',
    is_anonymous: false,
    is_draft: false,
    title: 'Cafeteria Food Quality Concerns',
    description: '<p>The quality of food served in the cafeteria has declined. Multiple students have reported stomach issues after eating there.</p>',
    category: 'facilities',
    priority: 'high',
    status: 'new',
    assigned_to: null,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't8', complaint_id: '4', tag_name: 'cafeteria', created_at: new Date().toISOString() },
      { id: 't9', complaint_id: '4', tag_name: 'food-quality', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '5',
    student_id: null,
    is_anonymous: true,
    is_draft: false,
    title: 'Parking Lot Safety Issues',
    description: '<p>The parking lot lighting is inadequate, creating safety concerns for students leaving evening classes.</p>',
    category: 'facilities',
    priority: 'critical',
    status: 'opened',
    assigned_to: 'admin-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'admin-1',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't10', complaint_id: '5', tag_name: 'parking', created_at: new Date().toISOString() },
      { id: 't11', complaint_id: '5', tag_name: 'safety', created_at: new Date().toISOString() },
      { id: 't12', complaint_id: '5', tag_name: 'lighting', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '6',
    student_id: 'mock-student-id',
    is_anonymous: false,
    is_draft: false,
    title: 'Course Registration System Error',
    description: '<p>Unable to register for courses. The system shows an error message when trying to add classes to my schedule.</p>',
    category: 'administrative',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'admin-2',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    opened_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    opened_by: 'admin-2',
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't13', complaint_id: '6', tag_name: 'registration', created_at: new Date().toISOString() },
      { id: 't14', complaint_id: '6', tag_name: 'system-error', created_at: new Date().toISOString() },
    ],
  },
  {
    id: '7',
    student_id: 'mock-student-id',
    is_anonymous: false,
    is_draft: false,
    title: 'Classroom Projector Not Working',
    description: '<p>The projector in Room 301 has been broken for two weeks. This is affecting our ability to follow lectures.</p>',
    category: 'facilities',
    priority: 'medium',
    status: 'new',
    assigned_to: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    opened_at: null,
    opened_by: null,
    resolved_at: null,
    escalated_at: null,
    escalation_level: 0,
    complaint_tags: [
      { id: 't15', complaint_id: '7', tag_name: 'classroom', created_at: new Date().toISOString() },
      { id: 't16', complaint_id: '7', tag_name: 'equipment', created_at: new Date().toISOString() },
    ],
  },
];

/**
 * Mock implementation of searchComplaints
 * 
 * Performs simple text matching on title and description.
 * Used for UI development only.
 */
export async function mockSearchComplaints(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const {
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = options;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...MOCK_SEARCH_COMPLAINTS];

  // Apply text search
  if (query && query.trim()) {
    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    results = results.filter((complaint) => {
      const searchableText = `${complaint.title} ${complaint.description}`.toLowerCase();
      // Also search in tags
      const tagText = complaint.complaint_tags?.map(t => t.tag_name).join(' ').toLowerCase() || '';
      const fullSearchText = `${searchableText} ${tagText}`;
      
      return searchTerms.some((term) => fullSearchText.includes(term));
    });
  }

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    results = results.filter((c) => filters.status!.includes(c.status));
  }

  if (filters.category && filters.category.length > 0) {
    results = results.filter((c) => filters.category!.includes(c.category));
  }

  if (filters.priority && filters.priority.length > 0) {
    results = results.filter((c) => filters.priority!.includes(c.priority));
  }

  // Apply sorting
  results.sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Apply pagination
  const total = results.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedResults = results.slice(start, end);

  return {
    complaints: paginatedResults,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Common search terms and keywords for suggestions
 */
const COMMON_SEARCH_TERMS = [
  'air conditioning',
  'wifi',
  'library',
  'grading',
  'parking',
  'cafeteria',
  'registration',
  'course materials',
  'lighting',
  'safety',
  'classroom',
  'facilities',
  'academic',
  'administrative',
];

/**
 * Mock implementation of getSearchSuggestions
 * 
 * Provides intelligent autocomplete suggestions based on:
 * 1. Matching complaint titles
 * 2. Common search terms
 * 3. Tags from existing complaints
 */
export async function mockGetSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  if (!partialQuery || partialQuery.trim().length < 2) {
    return [];
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const query = partialQuery.toLowerCase().trim();
  const suggestions: string[] = [];

  // 1. Find matching complaint titles (prioritize exact matches at start)
  const titleMatches = MOCK_SEARCH_COMPLAINTS
    .filter((c) => c.title.toLowerCase().includes(query))
    .sort((a, b) => {
      // Prioritize titles that start with the query
      const aStarts = a.title.toLowerCase().startsWith(query);
      const bStarts = b.title.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    })
    .map((c) => c.title);

  suggestions.push(...titleMatches);

  // 2. Find matching common search terms
  const termMatches = COMMON_SEARCH_TERMS
    .filter((term) => term.toLowerCase().includes(query))
    .filter((term) => !suggestions.some((s) => s.toLowerCase().includes(term.toLowerCase())));

  suggestions.push(...termMatches);

  // 3. Find matching tags
  const tagMatches = MOCK_SEARCH_COMPLAINTS
    .flatMap((c) => c.complaint_tags?.map((t) => t.tag_name) || [])
    .filter((tag) => tag.toLowerCase().includes(query))
    .filter((tag) => !suggestions.some((s) => s.toLowerCase().includes(tag.toLowerCase())));

  // Remove duplicates and limit results
  const uniqueSuggestions = Array.from(new Set(suggestions));
  
  return uniqueSuggestions.slice(0, limit);
}
