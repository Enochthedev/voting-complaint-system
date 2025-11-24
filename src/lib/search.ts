/**
 * Full-Text Search Utilities
 * 
 * Implements full-text search functionality for complaints using PostgreSQL's
 * full-text search capabilities via Supabase.
 * 
 * Features:
 * - Full-text search across complaint titles and descriptions
 * - Search vector indexing for performance
 * - Relevance ranking
 * - Support for multiple search terms
 * - Integration with existing complaint queries
 */

import { supabase } from './supabase';
import type { Complaint, ComplaintTag } from '@/types/database.types';
import { mockSearchComplaints, mockGetSearchSuggestions } from './search-mock';

// Feature flag for using mock data during development
// Set to false in Phase 12 when connecting real APIs
const USE_MOCK_DATA = true;

export interface SearchFilters {
  status?: string[];
  category?: string[];
  priority?: string[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  assignedTo?: string;
}

export interface SearchOptions {
  filters?: SearchFilters;
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  complaints: (Complaint & { complaint_tags?: ComplaintTag[] })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Performs full-text search on complaints table
 * 
 * Uses PostgreSQL's full-text search with the search_vector column
 * that indexes both title and description fields.
 * 
 * @param query - Search query string
 * @param options - Search options including filters, sorting, and pagination
 * @returns Search results with complaints and pagination info
 */
export async function searchComplaints(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  // Use mock data during UI development (Phase 3-11)
  if (USE_MOCK_DATA) {
    return mockSearchComplaints(query, options);
  }

  const {
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 20,
  } = options;

  // Build the base query
  let queryBuilder = supabase
    .from('complaints')
    .select('*, complaint_tags(*)', { count: 'exact' });

  // Apply full-text search if query is provided
  if (query && query.trim()) {
    // Use textSearch for full-text search on the search_vector column
    // The search_vector column is automatically maintained by a database trigger
    queryBuilder = queryBuilder.textSearch('search_vector', query.trim(), {
      type: 'websearch',
      config: 'english',
    });
  }

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    queryBuilder = queryBuilder.in('status', filters.status);
  }

  if (filters.category && filters.category.length > 0) {
    queryBuilder = queryBuilder.in('category', filters.category);
  }

  if (filters.priority && filters.priority.length > 0) {
    queryBuilder = queryBuilder.in('priority', filters.priority);
  }

  if (filters.dateFrom) {
    queryBuilder = queryBuilder.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    queryBuilder = queryBuilder.lte('created_at', filters.dateTo);
  }

  if (filters.assignedTo) {
    queryBuilder = queryBuilder.eq('assigned_to', filters.assignedTo);
  }

  // Apply tag filter if specified
  // Note: This requires a join or subquery, handled differently
  if (filters.tags && filters.tags.length > 0) {
    // For tag filtering, we need to check if the complaint has any of the specified tags
    // This is done by checking if the complaint_id exists in complaint_tags with matching tag_name
    const { data: taggedComplaintIds } = await supabase
      .from('complaint_tags')
      .select('complaint_id')
      .in('tag_name', filters.tags);

    if (taggedComplaintIds && taggedComplaintIds.length > 0) {
      const complaintIds = taggedComplaintIds.map((t) => t.complaint_id);
      queryBuilder = queryBuilder.in('id', complaintIds);
    } else {
      // No complaints match the tag filter, return empty result
      return {
        complaints: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  }

  // Apply sorting
  queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  queryBuilder = queryBuilder.range(start, end);

  // Execute query
  const { data, error, count } = await queryBuilder;

  if (error) {
    console.error('Search error:', error);
    throw new Error(`Failed to search complaints: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    complaints: data || [],
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Searches complaints with simple query (for backward compatibility)
 * 
 * @param query - Search query string
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of results per page
 * @returns Search results
 */
export async function simpleSearchComplaints(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  return searchComplaints(query, { page, pageSize });
}

/**
 * Gets search suggestions based on partial query
 * 
 * This can be used for autocomplete functionality.
 * Returns recent search terms or common complaint titles.
 * 
 * @param partialQuery - Partial search query
 * @param limit - Maximum number of suggestions
 * @returns Array of suggestion strings
 */
export async function getSearchSuggestions(
  partialQuery: string,
  limit: number = 5
): Promise<string[]> {
  // Use mock data during UI development (Phase 3-11)
  if (USE_MOCK_DATA) {
    return mockGetSearchSuggestions(partialQuery, limit);
  }

  if (!partialQuery || partialQuery.trim().length < 2) {
    return [];
  }

  // Search for complaints with titles that start with or contain the query
  const { data, error } = await supabase
    .from('complaints')
    .select('title')
    .ilike('title', `%${partialQuery.trim()}%`)
    .limit(limit);

  if (error) {
    console.error('Suggestion error:', error);
    return [];
  }

  // Extract unique titles
  const suggestions = data?.map((c) => c.title) || [];
  return [...new Set(suggestions)];
}

/**
 * Highlights search terms in text
 * 
 * Utility function to highlight matching search terms in complaint text.
 * Useful for displaying search results with highlighted matches.
 * 
 * @param text - Text to highlight
 * @param query - Search query
 * @returns Text with <mark> tags around matches
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query || !text) {
    return text;
  }

  // Split query into individual terms
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  let highlightedText = text;

  // Highlight each term
  terms.forEach((term) => {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    highlightedText = highlightedText.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>'
    );
  });

  return highlightedText;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validates search query
 * 
 * Checks if the search query is valid and not too short/long.
 * 
 * @param query - Search query to validate
 * @returns Validation result with error message if invalid
 */
export function validateSearchQuery(query: string): {
  valid: boolean;
  error?: string;
} {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Search query cannot be empty' };
  }

  if (query.trim().length < 2) {
    return {
      valid: false,
      error: 'Search query must be at least 2 characters',
    };
  }

  if (query.length > 200) {
    return {
      valid: false,
      error: 'Search query is too long (max 200 characters)',
    };
  }

  return { valid: true };
}
