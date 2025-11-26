'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SORT_OPTIONS, type SortOption } from './types';

interface SortOptionsProps {
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  onSortByChange: (sortBy: SortOption) => void;
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
}

export function SortOptions({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortOptionsProps) {
  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">Sort By</Label>
      <div className="space-y-2">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortOption)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSortOrderChange('asc')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              sortOrder === 'asc'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input bg-background hover:bg-muted'
            }`}
          >
            <ChevronUp className="h-4 w-4" />
            Ascending
          </button>
          <button
            type="button"
            onClick={() => onSortOrderChange('desc')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
              sortOrder === 'desc'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input bg-background hover:bg-muted'
            }`}
          >
            <ChevronDown className="h-4 w-4" />
            Descending
          </button>
        </div>
      </div>
    </div>
  );
}
