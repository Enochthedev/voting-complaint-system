'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import type { ComplaintCategory } from '@/types/database.types';
import { CATEGORY_OPTIONS } from './types';

interface CategoryFilterProps {
  selected: ComplaintCategory[];
  onChange: (categories: ComplaintCategory[]) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const handleToggle = (category: ComplaintCategory) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">Category</Label>
      <div className="space-y-2">
        {CATEGORY_OPTIONS.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-card-foreground">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
