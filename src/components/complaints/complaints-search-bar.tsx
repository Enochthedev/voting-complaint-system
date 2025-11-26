import * as React from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { cn } from '@/lib/utils';

export interface ComplaintsSearchBarProps {
  /**
   * Current search query value
   */
  searchQuery: string;

  /**
   * Search suggestions to display
   */
  searchSuggestions: string[];

  /**
   * Whether search is in progress
   */
  isSearching: boolean;

  /**
   * Search error message, if any
   */
  searchError: string | null;

  /**
   * Whether search mode is active
   */
  useSearch: boolean;

  /**
   * Search results metadata
   */
  searchResults?: {
    total: number;
    complaints: any[];
    totalPages: number;
  } | null;

  /**
   * Callback when search query changes
   */
  onSearchQueryChange: (query: string) => void;

  /**
   * Callback when search is triggered
   */
  onSearch: (query: string) => void;

  /**
   * Callback when search is cleared
   */
  onClearSearch: () => void;
}

/**
 * ComplaintsSearchBar Component
 *
 * Provides search functionality for complaints with suggestions,
 * error handling, and result display.
 */
export function ComplaintsSearchBar({
  searchQuery,
  searchSuggestions,
  isSearching,
  searchError,
  useSearch,
  searchResults,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
}: ComplaintsSearchBarProps) {
  return (
    <div className="mb-6">
      <SearchBar
        value={searchQuery}
        onChange={onSearchQueryChange}
        onSearch={onSearch}
        onClear={onClearSearch}
        placeholder="Search complaints by title or description..."
        suggestions={searchSuggestions.map((text, index) => ({
          id: `suggestion-${index}`,
          text,
          type: 'suggestion' as const,
        }))}
        isLoading={isSearching}
        showSuggestions={searchQuery.length >= 2}
      />

      {/* Search Error */}
      {searchError && (
        <div className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <strong>Error:</strong> {searchError}
        </div>
      )}

      {/* Search Info */}
      {useSearch && searchResults && (
        <div
          className={cn(
            'mt-2 rounded-md p-3 text-sm',
            searchResults.total === 0
              ? 'bg-muted text-muted-foreground'
              : 'bg-accent/10 text-accent-foreground'
          )}
        >
          {searchResults.total === 0 ? (
            <span>
              <strong>No results found</strong> for "{searchQuery}". Try different keywords or clear
              your search.
            </span>
          ) : (
            <span>
              Found <strong>{searchResults.total}</strong> result
              {searchResults.total !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
