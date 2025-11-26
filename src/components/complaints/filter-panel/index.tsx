'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusFilter } from './StatusFilter';
import { CategoryFilter } from './CategoryFilter';
import { PriorityFilter } from './PriorityFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { SortOptions } from './SortOptions';
import { ActiveFilters } from './ActiveFilters';
import type { FilterState, SortOption, FilterPanelProps } from './types';

export function FilterPanel({
  filters,
  onFiltersChange,
  onSavePreset,
  availableTags = [],
  availableLecturers = [],
  isCollapsible = true,
  defaultCollapsed = false,
  className,
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleRemoveFilter = (filterType: keyof FilterState, value?: string) => {
    const newFilters = { ...filters };

    if (filterType === 'status' && value) {
      newFilters.status = filters.status.filter((s) => s !== value);
    } else if (filterType === 'category' && value) {
      newFilters.category = filters.category.filter((c) => c !== value);
    } else if (filterType === 'priority' && value) {
      newFilters.priority = filters.priority.filter((p) => p !== value);
    } else if (filterType === 'tags' && value) {
      newFilters.tags = filters.tags.filter((t) => t !== value);
    } else if (filterType === 'dateFrom') {
      newFilters.dateFrom = '';
    } else if (filterType === 'dateTo') {
      newFilters.dateTo = '';
    } else if (filterType === 'assignedTo') {
      newFilters.assignedTo = '';
    }

    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    onFiltersChange({
      status: [],
      category: [],
      priority: [],
      dateFrom: '',
      dateTo: '',
      tags: [],
      assignedTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.category.length > 0 ||
    filters.priority.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.tags.length > 0 ||
    filters.assignedTo;

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-card-foreground">Filters</h3>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {filters.status.length +
                filters.category.length +
                filters.priority.length +
                (filters.dateFrom ? 1 : 0) +
                (filters.dateTo ? 1 : 0) +
                filters.tags.length +
                (filters.assignedTo ? 1 : 0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2">
              <RotateCcw className="h-4 w-4" />
              <span className="ml-1">Reset</span>
            </Button>
          )}
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {!isCollapsed && hasActiveFilters && (
        <div className="border-b border-border p-4">
          <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
        </div>
      )}

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="space-y-6">
            {/* Status Filter */}
            <StatusFilter
              selected={filters.status}
              onChange={(status) => handleFilterChange('status', status)}
            />

            {/* Category Filter */}
            <CategoryFilter
              selected={filters.category}
              onChange={(category) => handleFilterChange('category', category)}
            />

            {/* Priority Filter */}
            <PriorityFilter
              selected={filters.priority}
              onChange={(priority) => handleFilterChange('priority', priority)}
            />

            {/* Date Range Filter */}
            <DateRangeFilter
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onDateFromChange={(date) => handleFilterChange('dateFrom', date)}
              onDateToChange={(date) => handleFilterChange('dateTo', date)}
            />

            {/* Sort Options */}
            <SortOptions
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortByChange={(sortBy) => handleFilterChange('sortBy', sortBy)}
              onSortOrderChange={(sortOrder) => handleFilterChange('sortOrder', sortOrder)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export types
export type { FilterState, SortOption } from './types';
