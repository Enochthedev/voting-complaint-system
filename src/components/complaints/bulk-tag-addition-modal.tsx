'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';

export interface BulkTagAdditionModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when modal is closed
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Number of items to add tags to
   */
  itemCount: number;

  /**
   * Available tags for suggestions
   */
  availableTags?: string[];

  /**
   * Callback when tag addition is confirmed
   */
  onConfirm: (tags: string[]) => void;

  /**
   * Whether the action is in progress
   */
  isLoading?: boolean;
}

/**
 * BulkTagAdditionModal Component
 *
 * Modal for adding tags to multiple complaints at once.
 */
export function BulkTagAdditionModal({
  open,
  onOpenChange,
  itemCount,
  availableTags = [],
  onConfirm,
  isLoading = false,
}: BulkTagAdditionModalProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);

  // Filter suggestions based on input
  React.useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(
        (tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag)
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, availableTags, selectedTags]);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      setSelectedTags([...selectedTags, normalizedTag]);
      setInputValue('');
      setFilteredSuggestions([]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedTags.length > 0) {
      onConfirm(selectedTags);
    }
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setInputValue('');
      setSelectedTags([]);
      setFilteredSuggestions([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>Add Tags to Complaints</DialogTitle>
              <DialogDescription className="mt-2">
                Add tags to {itemCount} {itemCount === 1 ? 'complaint' : 'complaints'}. Tags help
                organize and categorize complaints.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tag-input">Tags</Label>
            <div className="relative">
              <Input
                id="tag-input"
                placeholder="Type a tag and press Enter"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              {/* Tag suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                  {filteredSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter to add a tag. Click on suggestions to add them quickly.
            </p>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Tags ({selectedTags.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isLoading}
                      className="ml-1 rounded-full p-0.5 hover:bg-secondary-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              These tags will be added to all selected complaints. Existing tags on each complaint
              will be preserved.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedTags.length === 0 || isLoading}>
            {isLoading ? 'Adding Tags...' : `Add Tags to ${itemCount} Complaints`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
