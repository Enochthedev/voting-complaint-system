'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface TagsFieldProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

// Mock tag suggestions for UI development
const MOCK_TAG_SUGGESTIONS = [
  'urgent',
  'facilities',
  'lecture-hall',
  'equipment',
  'maintenance',
  'safety',
  'accessibility',
  'wifi',
  'parking',
  'library',
];

/**
 * Tags Field Component
 * Tag input with autocomplete suggestions
 */
export function TagsField({ tags, onAddTag, onRemoveTag }: TagsFieldProps) {
  const [tagInput, setTagInput] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);
  const tagInputRef = React.useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  React.useEffect(() => {
    if (tagInput.trim()) {
      const filtered = MOCK_TAG_SUGGESTIONS.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [tagInput, tags]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setTagInput('');
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <div>
      <Label htmlFor="tags">Tags (optional)</Label>
      <div className="mt-2">
        {/* Tag Display */}
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        <div className="relative">
          <Input
            ref={tagInputRef}
            id="tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a tag and press Enter"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
              <ul className="max-h-60 overflow-auto py-1">
                {filteredSuggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => handleAddTag(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Add tags to help categorize your complaint
      </p>
    </div>
  );
}
