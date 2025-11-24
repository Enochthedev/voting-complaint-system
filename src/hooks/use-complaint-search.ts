/**
 * useComplaintSearch Hook
 * 
 * React hook for managing complaint search state and operations.
 * Provides search functionality with debouncing, loading states, and error handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  searchComplaints,
  getSearchSuggestions,
  validateSearchQuery,
  type SearchOptions,
  type SearchResult,
} from '@/lib/search';

export interface UseComplaintSearchOptions extends SearchOptions {
  debounceMs?: number;
  autoSearch?: boolean;
}

export interface UseComplaintSearchReturn {
  // Search state
  query: string;
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  
  // Search actions
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  clearSearch: () => void;
  
  // Pagination
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

/**
 * Hook for managing complaint search
 * 
 * @param options - Search options including filters, sorting, and debouncing
 * @returns Search state and actions
 */
export function useComplaintSearch(
  options: UseComplaintSearchOptions = {}
): UseComplaintSearchReturn {
  const {
    debounceMs = 300,
    autoSearch = false,
    ...searchOptions
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Performs the search operation
   */
  const search = useCallback(
    async (searchQuery?: string) => {
      const queryToSearch = searchQuery ?? query;

      // Validate query
      const validation = validateSearchQuery(queryToSearch);
      if (!validation.valid) {
        setError(validation.error || 'Invalid search query');
        setResults(null);
        return;
      }

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchComplaints(queryToSearch, {
          ...searchOptions,
          page: currentPage,
        });

        setResults(searchResults);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to search complaints';
        setError(errorMessage);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [query, currentPage, searchOptions]
  );

  /**
   * Fetches search suggestions
   */
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionResults = await getSearchSuggestions(searchQuery, 5);
      setSuggestions(suggestionResults);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions([]);
    }
  }, []);

  /**
   * Handles query changes with debouncing
   */
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      setError(null);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Fetch suggestions immediately (no debounce for suggestions)
      fetchSuggestions(newQuery);

      // Debounce the actual search
      if (autoSearch && newQuery.trim().length >= 2) {
        debounceTimerRef.current = setTimeout(() => {
          search(newQuery);
        }, debounceMs);
      }
    },
    [autoSearch, debounceMs, search, fetchSuggestions]
  );

  /**
   * Clears the search
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setSuggestions([]);
    setCurrentPage(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  /**
   * Pagination handlers
   */
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (results && currentPage < results.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [results, currentPage]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  /**
   * Re-run search when page changes
   */
  useEffect(() => {
    if (query && results) {
      search();
    }
  }, [currentPage]); // Only depend on currentPage to avoid infinite loops

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    results,
    isLoading,
    error,
    suggestions,
    setQuery: handleQueryChange,
    search,
    clearSearch,
    goToPage,
    nextPage,
    previousPage,
  };
}
