'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Save,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from '@/types/database.types';

// Filter state interface
export interface FilterState {
  status: ComplaintStatus[];
  category: ComplaintCategory[];
  priority: ComplaintPriority[];
  dateFrom: string;
  dateTo: string;
  tags: string[];
  assignedTo: string;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

export type SortOption =
  | 'created_at'
  | 'updated_at'
  | 'priority'
  | 'status'
  | 'title';

// Filter panel props
export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSavePreset?: (name: string, filters: FilterState) => void;
  availableTags?: string[];
  availableLecturers?: Array<{ id: string; name: string }>;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

// Status options
const STATUS_OPTIONS: Array<{ value: ComplaintStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'opened', label: 'Opened' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'reopened', label: 'Reopened' },
];

// Category options
const CATEGORY_OPTIONS: Array<{ value: ComplaintCategory; label: string }> = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

// Priority options
const PRIORITY_OPTIONS: Array<{ value: ComplaintPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

// Sort options
const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
];

/**
 * Checkbox component for filter options
 */
function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    </div>
  );
}

/**
 * Filter section component
 */
function FilterSection({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <h3 className="text-sm font-semibold text-foreground">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

/**
 * Active filter chip component
 */
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 rounded-full hover:bg-accent"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/**
 * Filter Panel Component
 * 
 * Provides a comprehensive filtering interface for complaints with:
 * - Status, category, priority filters
 * - Date range selection
 * - Tag filtering
 * - Assigned lecturer filtering
 * - Sort options
 * - Active filter display
 * - Save filter presets
 */
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
  const [presetName, setPresetName] = React.useState('');
  const [showSavePreset, setShowSavePreset] = React.useState(false);

  // Check if any filters are active
  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.category.length > 0 ||
    filters.priority.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.tags.length > 0 ||
    filters.assignedTo;

  // Count active filters
  const activeFilterCount =
    filters.status.length +
    filters.category.length +
    filters.priority.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    filters.tags.length +
    (filters.assignedTo ? 1 : 0);

  // Handle status filter change
  const handleStatusChange = (status: ComplaintStatus, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter((s) => s !== status);
    onFiltersChange({ ...filters, status: newStatus });
  };

  // Handle category filter change
  const handleCategoryChange = (
    category: ComplaintCategory,
    checked: boolean
  ) => {
    const newCategory = checked
      ? [...filters.category, category]
      : filters.category.filter((c) => c !== category);
    onFiltersChange({ ...filters, category: newCategory });
  };

  // Handle priority filter change
  const handlePriorityChange = (
    priority: ComplaintPriority,
    checked: boolean
  ) => {
    const newPriority = checked
      ? [...filters.priority, priority]
      : filters.priority.filter((p) => p !== priority);
    onFiltersChange({ ...filters, priority: newPriority });
  };

  // Handle tag filter change
  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tag]
      : filters.tags.filter((t) => t !== tag);
    onFiltersChange({ ...filters, tags: newTags });
  };

  // Clear all filters
  const handleClearAll = () => {
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

  // Save preset
  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  // Get label for filter value
  const getStatusLabel = (status: ComplaintStatus) =>
    STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
  const getCategoryLabel = (category: ComplaintCategory) =>
    CATEGORY_OPTIONS.find((o) => o.value === category)?.label || category;
  const getPriorityLabel = (priority: ComplaintPriority) =>
    PRIORITY_OPTIONS.find((o) => o.value === priority)?.label || priority;

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-card-foreground">
            Filters
          </h2>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Clear All
            </Button>
          )}
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
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

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="space-y-4">
            {/* Status Filter */}
            <FilterSection title="Status">
              {STATUS_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option.value}
                  id={`status-${option.value}`}
                  label={option.label}
                  checked={filters.status.includes(option.value)}
                  onChange={(checked) =>
                    handleStatusChange(option.value, checked)
                  }
                />
              ))}
            </FilterSection>

            {/* Category Filter */}
            <FilterSection title="Category">
              {CATEGORY_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option.value}
                  id={`category-${option.value}`}
                  label={option.label}
                  checked={filters.category.includes(option.value)}
                  onChange={(checked) =>
                    handleCategoryChange(option.value, checked)
                  }
                />
              ))}
            </FilterSection>

            {/* Priority Filter */}
            <FilterSection title="Priority">
              {PRIORITY_OPTIONS.map((option) => (
                <FilterCheckbox
                  key={option.value}
                  id={`priority-${option.value}`}
                  label={option.label}
                  checked={filters.priority.includes(option.value)}
                  onChange={(checked) =>
                    handlePriorityChange(option.value, checked)
                  }
                />
              ))}
            </FilterSection>

            {/* Date Range Filter */}
            <FilterSection title="Date Range">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, dateFrom: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, dateTo: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Tag Filter */}
            {availableTags.length > 0 && (
              <FilterSection title="Tags">
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <FilterCheckbox
                      key={tag}
                      id={`tag-${tag}`}
                      label={tag}
                      checked={filters.tags.includes(tag)}
                      onChange={(checked) => handleTagChange(tag, checked)}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* Assigned Lecturer Filter */}
            {availableLecturers.length > 0 && (
              <FilterSection title="Assigned To">
                <select
                  value={filters.assignedTo}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, assignedTo: e.target.value })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Lecturers</option>
                  {availableLecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name}
                    </option>
                  ))}
                </select>
              </FilterSection>
            )}

            {/* Sort Options */}
            <FilterSection title="Sort By">
              <div className="space-y-3">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      sortBy: e.target.value as SortOption,
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      onFiltersChange({ ...filters, sortOrder: 'asc' })
                    }
                    className="flex-1"
                  >
                    Ascending
                  </Button>
                  <Button
                    variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      onFiltersChange({ ...filters, sortOrder: 'desc' })
                    }
                    className="flex-1"
                  >
                    Descending
                  </Button>
                </div>
              </div>
            </FilterSection>

            {/* Save Preset */}
            {onSavePreset && (
              <div className="border-t border-border pt-4">
                {!showSavePreset ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSavePreset(true)}
                    className="w-full"
                    disabled={!hasActiveFilters}
                  >
                    <Save className="h-4 w-4" />
                    Save Filter Preset
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSavePreset();
                        } else if (e.key === 'Escape') {
                          setShowSavePreset(false);
                          setPresetName('');
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSavePreset}
                        disabled={!presetName.trim()}
                        className="flex-1"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowSavePreset(false);
                          setPresetName('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && !isCollapsed && (
        <div className="border-t border-border p-4">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Active Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status.map((status) => (
              <FilterChip
                key={`status-${status}`}
                label={`Status: ${getStatusLabel(status)}`}
                onRemove={() => handleStatusChange(status, false)}
              />
            ))}
            {filters.category.map((category) => (
              <FilterChip
                key={`category-${category}`}
                label={`Category: ${getCategoryLabel(category)}`}
                onRemove={() => handleCategoryChange(category, false)}
              />
            ))}
            {filters.priority.map((priority) => (
              <FilterChip
                key={`priority-${priority}`}
                label={`Priority: ${getPriorityLabel(priority)}`}
                onRemove={() => handlePriorityChange(priority, false)}
              />
            ))}
            {filters.dateFrom && (
              <FilterChip
                label={`From: ${filters.dateFrom}`}
                onRemove={() =>
                  onFiltersChange({ ...filters, dateFrom: '' })
                }
              />
            )}
            {filters.dateTo && (
              <FilterChip
                label={`To: ${filters.dateTo}`}
                onRemove={() =>
                  onFiltersChange({ ...filters, dateTo: '' })
                }
              />
            )}
            {filters.tags.map((tag) => (
              <FilterChip
                key={`tag-${tag}`}
                label={`Tag: ${tag}`}
                onRemove={() => handleTagChange(tag, false)}
              />
            ))}
            {filters.assignedTo && (
              <FilterChip
                label={`Assigned: ${
                  availableLecturers.find((l) => l.id === filters.assignedTo)
                    ?.name || filters.assignedTo
                }`}
                onRemove={() =>
                  onFiltersChange({ ...filters, assignedTo: '' })
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
