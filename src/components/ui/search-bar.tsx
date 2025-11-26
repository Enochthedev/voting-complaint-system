'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchSuggestion {
  id: string;
  text: string;
  type?: 'recent' | 'suggestion';
}

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  showSuggestions?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Search Bar Component
 *
 * A reusable search bar with autocomplete suggestions, loading states,
 * and clear functionality. Designed for full-text search across complaints.
 *
 * Features:
 * - Real-time search input
 * - Autocomplete suggestions dropdown
 * - Loading indicator during search
 * - Clear button to reset search
 * - Keyboard navigation support
 * - Responsive design
 */
export function SearchBar({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search complaints...',
  suggestions = [],
  isLoading = false,
  showSuggestions = false,
  className,
  disabled = false,
}: SearchBarProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync internal state with prop value
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    onChange?.(newValue);
  };

  // Handle search submission
  const handleSearch = (query?: string) => {
    const searchQuery = query ?? inputValue;
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      setIsFocused(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    setSelectedIndex(-1);
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuggestionsDropdown =
    isFocused && showSuggestions && suggestions.length > 0 && inputValue.trim();

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-10 pr-10',
            inputValue && 'pr-20' // Extra space for clear button
          )}
          aria-label="Search complaints"
          aria-autocomplete="list"
          aria-controls={showSuggestionsDropdown ? 'search-suggestions' : undefined}
          aria-expanded={showSuggestionsDropdown ? true : undefined}
        />

        {/* Clear Button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: 'hsl(var(--card))' }}
        >
          <ul className="max-h-60 overflow-auto py-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'cursor-pointer px-4 py-2 text-sm transition-colors',
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'text-card-foreground hover:bg-accent/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <span>{suggestion.text}</span>
                  {suggestion.type === 'recent' && (
                    <span className="ml-auto text-xs text-muted-foreground">Recent</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
