'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import type { ComplaintStatus } from '@/types/database.types';
import { STATUS_OPTIONS } from './types';

interface StatusFilterProps {
  selected: ComplaintStatus[];
  onChange: (statuses: ComplaintStatus[]) => void;
}

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  const handleToggle = (status: ComplaintStatus) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  return (
    <div>
      <Label className="mb-2 block text-sm font-medium">Status</Label>
      <div className="space-y-2">
        {STATUS_OPTIONS.map((option) => (
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
