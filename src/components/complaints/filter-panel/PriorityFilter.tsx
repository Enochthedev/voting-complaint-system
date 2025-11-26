'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import type { ComplaintPriority } from '@/types/database.types';
import { PRIORITY_OPTIONS } from './types';

interface PriorityFilterProps {
  selected: ComplaintPriority[];
  onChange: (priorities: ComplaintPriority[]) => void;
}

export function PriorityFilter({ selected, onChange }: PriorityFilterProps) {
  const handleToggle = (priority: ComplaintPriority) => {
    if (selected.includes(priority)) {
      onChange(selected.filter((p) => p !== priority));
    } else {
      onChange([...selected, priority]);
    }
  };

  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">Priority</Label>
      <div className="space-y-2">
        {PRIORITY_OPTIONS.map((option) => (
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
