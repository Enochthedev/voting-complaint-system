'use client';

import * as React from 'react';
import { SearchBar, SearchSuggestion } from '@/components/ui/search-bar';

/**
 * Search Bar Demo Component
 *
 * Demonstrates the SearchBar component with mock data and functionality.
 * This shows how the search bar will work once integrated with the backend.
 */
export function SearchBarDemo() {
  const [searchValue, setSearchValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<string[]>([]);

  // Mock suggestions based on common complaint topics
  const mockSuggestions: SearchSuggestion[] = React.useMemo(() => {
    if (!searchValue.trim()) return [];

    const allSuggestions = [
      { id: '1', text: 'broken air conditioning', type: 'recent' as const },
      { id: '2', text: 'lecture hall facilities', type: 'suggestion' as const },
      { id: '3', text: 'course material access', type: 'suggestion' as const },
      { id: '4', text: 'assignment deadline', type: 'recent' as const },
      { id: '5', text: 'library resources', type: 'suggestion' as const },
      { id: '6', text: 'parking issues', type: 'suggestion' as const },
      { id: '7', text: 'wifi connectivity', type: 'recent' as const },
      { id: '8', text: 'exam schedule conflict', type: 'suggestion' as const },
    ];

    // Filter suggestions based on input
    return allSuggestions.filter((s) => s.text.toLowerCase().includes(searchValue.toLowerCase()));
  }, [searchValue]);

  // Mock search handler
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock search results
      const mockResults = [
        `Result 1 for "${query}"`,
        `Result 2 for "${query}"`,
        `Result 3 for "${query}"`,
      ];
      setSearchResults(mockResults);
      setIsLoading(false);
    }, 1000);
  };

  // Handle clear
  const handleClear = () => {
    setSearchResults([]);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Search Bar Demo</h2>
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          Try typing to see autocomplete suggestions. Press Enter or click a suggestion to search.
        </p>

        {/* Search Bar */}
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onSearch={handleSearch}
          onClear={handleClear}
          suggestions={mockSuggestions}
          isLoading={isLoading}
          showSuggestions={true}
          placeholder="Search complaints by title, description, or tags..."
        />
      </div>

      {/* Search Results Display */}
      {searchResults.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Search Results
          </h3>
          <ul className="space-y-2">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Usage Example */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Usage Example
        </h3>
        <pre className="overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300">
          {`<SearchBar
  value={searchValue}
  onChange={setSearchValue}
  onSearch={handleSearch}
  onClear={handleClear}
  suggestions={suggestions}
  isLoading={isLoading}
  showSuggestions={true}
  placeholder="Search complaints..."
/>`}
        </pre>
      </div>
    </div>
  );
}
