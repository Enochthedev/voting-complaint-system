'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MOCK_POPULAR_TAGS } from './mock-data';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  popularTags?: string[];
}

export function TagInput({
  tags,
  onChange,
  disabled = false,
  popularTags = MOCK_POPULAR_TAGS,
}: TagInputProps) {
  const [tagInput, setTagInput] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = React.useState(-1);
  const tagInputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  React.useEffect(() => {
    if (tagInput.trim()) {
      const input = tagInput.toLowerCase();
      const suggestions = popularTags
        .filter((tag) => tag.toLowerCase().includes(input) && !tags.includes(tag))
        .slice(0, 8); // Limit to 8 suggestions
      setFilteredSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setActiveSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [tagInput, tags, popularTags]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tag?: string) => {
    const tagToAdd = (tag || tagInput).trim().toLowerCase();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      onChange([...tags, tagToAdd]);
      setTagInput('');
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      tagInputRef.current?.focus();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && filteredSuggestions[activeSuggestionIndex]) {
        handleAddTag(filteredSuggestions[activeSuggestionIndex]);
      } else {
        handleAddTag();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setActiveSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleSuggestionClick = (tag: string) => {
    handleAddTag(tag);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Tags (Optional)</Label>
      <p className="text-sm text-muted-foreground">
        Add tags to help categorize your complaint. Start typing to see suggestions.
      </p>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={tagInputRef}
              id="tags"
              type="text"
              placeholder="Type to search tags or create new..."
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onFocus={() => {
                if (tagInput.trim() && filteredSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              disabled={disabled}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="tag-suggestions"
              aria-expanded={showSuggestions}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                id="tag-suggestions"
                role="listbox"
                className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                <ul className="max-h-60 overflow-auto py-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={suggestion}
                      role="option"
                      aria-selected={index === activeSuggestionIndex}
                      className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                        index === activeSuggestionIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'text-card-foreground hover:bg-accent/50'
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                    >
                      <span className="font-medium">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddTag()}
            disabled={!tagInput.trim() || disabled}
          >
            Add
          </Button>
        </div>
        {tagInput.trim() && !filteredSuggestions.some((s) => s === tagInput.toLowerCase()) && (
          <p className="mt-1 text-xs text-muted-foreground">
            Press Enter or click Add to create new tag: &quot;{tagInput.toLowerCase()}&quot;
          </p>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove ${tag} tag`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
