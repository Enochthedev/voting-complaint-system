'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import type { FilterState } from './types';
import { STATUS_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './types';

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (filterType: keyof FilterState, value?: string) => void;
}

export function ActiveFilters({ filters, onRemoveFilter }: ActiveFiltersProps) {
  const activeFilters: Array<{ type: keyof FilterState; label: string; value?: string }> = [];

  // Status filters
  filters.status.forEach((status) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    if (option) {
      activeFilters.push({ type: 'status', label: `Status: ${option.label}`, value: status });
    }
  });

  // Category filters
  filters.category.forEach((category) => {
    const option = CATEGORY_OPTIONS.find((o) => o.value === category);
    if (option) {
      activeFilters.push({ type: 'category', label: `Category: ${option.label}`, value: category });
    }
  });

  // Priority filters
  filters.priority.forEach((priority) => {
    const option = PRIORITY_OPTIONS.find((o) => o.value === priority);
    if (option) {
      activeFilters.push({ type: 'priority', label: `Priority: ${option.label}`, value: priority });
    }
  });

  // Date filters
  if (filters.dateFrom) {
    activeFilters.push({ type: 'dateFrom', label: `From: ${filters.dateFrom}` });
  }
  if (filters.dateTo) {
    activeFilters.push({ type: 'dateTo', label: `To: ${filters.dateTo}` });
  }

  // Tag filters
  filters.tags.forEach((tag) => {
    activeFilters.push({ type: 'tags', label: `Tag: ${tag}`, value: tag });
  });

  // Assigned to filter
  if (filters.assignedTo) {
    activeFilters.push({ type: 'assignedTo', label: `Assigned to: ${filters.assignedTo}` });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-card-foreground">Active Filters:</p>
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, index) => (
          <span
            key={`${filter.type}-${filter.value || index}`}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {filter.label}
            <button
              type="button"
              onClick={() => onRemoveFilter(filter.type, filter.value)}
              className="ml-1 hover:text-destructive"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
