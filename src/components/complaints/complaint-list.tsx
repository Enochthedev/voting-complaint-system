'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loading, LoadingSkeleton } from '@/components/ui/loading';
import { HighlightText, HighlightHTML } from '@/components/ui/highlight-text';
import { AlertCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type {
  Complaint,
  ComplaintTag,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  User,
} from '@/types/database.types';
import { cn } from '@/lib/utils';

interface ComplaintWithTags extends Complaint {
  complaint_tags?: ComplaintTag[];
  assigned_lecturer?: User | null;
}

interface ComplaintListProps {
  complaints?: ComplaintWithTags[];
  isLoading?: boolean;
  error?: string;
  onComplaintClick?: (complaintId: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  showPagination?: boolean;
  searchQuery?: string; // Search query for highlighting
  isSearchResult?: boolean; // Whether the list is showing search results
  onClearSearch?: () => void; // Callback to clear search
  // Bulk selection props
  selectionMode?: boolean; // Whether selection mode is enabled
  selectedIds?: Set<string>; // Set of selected complaint IDs
  onSelectionChange?: (selectedIds: Set<string>) => void; // Callback when selection changes
}

// Status badge configuration
const STATUS_CONFIG: Record<ComplaintStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground border-border',
  },
  new: {
    label: 'New',
    className:
      'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  },
  opened: {
    label: 'Opened',
    className:
      'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  },
  in_progress: {
    label: 'In Progress',
    className:
      'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30',
  },
  resolved: {
    label: 'Resolved',
    className:
      'bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30',
  },
  closed: {
    label: 'Closed',
    className: 'bg-secondary text-secondary-foreground border-border',
  },
  reopened: {
    label: 'Reopened',
    className:
      'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  },
};

// Priority indicator configuration
const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { label: string; className: string; dotColor: string }
> = {
  low: {
    label: 'Low',
    className: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  medium: {
    label: 'Medium',
    className: 'text-yellow-700 dark:text-yellow-300',
    dotColor: 'bg-yellow-500',
  },
  high: {
    label: 'High',
    className: 'text-orange-700 dark:text-orange-300',
    dotColor: 'bg-orange-500',
  },
  critical: {
    label: 'Critical',
    className: 'text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
};

// Category labels
const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  academic: 'Academic',
  facilities: 'Facilities',
  harassment: 'Harassment',
  course_content: 'Course Content',
  administrative: 'Administrative',
  other: 'Other',
};

/**
 * Format date to relative time or absolute date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    const days = Math.floor(diffInDays);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Complaint List Item Component
 */
function ComplaintListItem({
  complaint,
  onClick,
  searchQuery,
  selectionMode,
  isSelected,
  onSelectionToggle,
}: {
  complaint: ComplaintWithTags;
  onClick?: (id: string) => void;
  searchQuery?: string;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionToggle?: (id: string) => void;
}) {
  const statusConfig = STATUS_CONFIG[complaint.status];
  const priorityConfig = PRIORITY_CONFIG[complaint.priority];
  const categoryLabel = CATEGORY_LABELS[complaint.category];

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.stopPropagation();
      onSelectionToggle?.(complaint.id);
    } else {
      onClick?.(complaint.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    onSelectionToggle?.(complaint.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all hover:border-ring hover:shadow-md',
        (onClick || selectionMode) && 'cursor-pointer',
        isSelected && 'border-primary bg-primary/5'
      )}
    >
      {/* Header: Title and Status */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          {/* Checkbox for selection mode */}
          {selectionMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxClick}
              onClick={handleCheckboxClick}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Select ${complaint.title}`}
            />
          )}
          <h3 className="flex-1 text-lg font-semibold text-card-foreground">
            <HighlightText text={complaint.title} query={searchQuery} />
          </h3>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            statusConfig.className
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Description Preview */}
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        <HighlightHTML
          html={
            complaint.description.substring(0, 150) +
            (complaint.description.length > 150 ? '...' : '')
          }
          query={searchQuery}
        />
      </p>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {/* Priority */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn('h-2 w-2 rounded-full', priorityConfig.dotColor)}
            aria-label={`${priorityConfig.label} priority`}
          />
          <span className={priorityConfig.className}>{priorityConfig.label}</span>
        </div>

        {/* Category */}
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          <span>{categoryLabel}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <span>{formatDate(complaint.created_at)}</span>
        </div>

        {/* Assigned Lecturer */}
        {complaint.assigned_lecturer && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">•</span>
            <span className="font-medium text-foreground">
              Assigned to: {complaint.assigned_lecturer.full_name}
            </span>
          </div>
        )}

        {/* Anonymous indicator */}
        {complaint.is_anonymous && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            Anonymous
          </span>
        )}
      </div>

      {/* Tags */}
      {complaint.complaint_tags && complaint.complaint_tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {complaint.complaint_tags.slice(0, 5).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag.tag_name}
            </span>
          ))}
          {complaint.complaint_tags.length > 5 && (
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              +{complaint.complaint_tags.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({
  message,
  isSearchResult = false,
  searchQuery,
  onClearSearch,
}: {
  message: string;
  isSearchResult?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-12 text-center">
      <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {isSearchResult ? 'No search results found' : 'No complaints found'}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">{message}</p>

      {/* Search-specific suggestions */}
      {isSearchResult && searchQuery && (
        <div className="mt-4 w-full max-w-md space-y-3">
          <div className="rounded-lg bg-card p-4 text-left">
            <p className="mb-2 text-sm font-medium text-card-foreground">Try these suggestions:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Check your spelling or try different keywords</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>
                  Use more general terms (e.g., "wifi" instead of "wifi connection problem")
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Try searching by category or priority instead</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Remove filters to see more results</span>
              </li>
            </ul>
          </div>

          {onClearSearch && (
            <Button onClick={onClearSearch} variant="outline" className="w-full">
              Clear search and show all complaints
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold text-destructive-foreground">
        Error loading complaints
      </h3>
      <p className="text-sm text-destructive-foreground/80">{message}</p>
    </div>
  );
}

/**
 * Loading Skeleton for Complaint List
 */
function ComplaintListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <LoadingSkeleton className="h-6 w-3/4" />
            <LoadingSkeleton className="h-6 w-20" />
          </div>
          <LoadingSkeleton className="mb-3 h-10 w-full" />
          <div className="flex gap-3">
            <LoadingSkeleton className="h-4 w-16" />
            <LoadingSkeleton className="h-4 w-24" />
            <LoadingSkeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pagination Component
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Complaint List Component
 *
 * Displays a list of complaints with pagination, loading states, and empty states.
 * Supports role-based filtering (handled by parent component).
 */
export function ComplaintList({
  complaints = [],
  isLoading = false,
  error,
  onComplaintClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'No complaints to display. Submit your first complaint to get started.',
  showPagination = true,
  searchQuery,
  isSearchResult = false,
  onClearSearch,
  selectionMode = false,
  selectedIds = new Set(),
  onSelectionChange,
}: ComplaintListProps) {
  // Handle selection toggle
  const handleSelectionToggle = (id: string) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };
  // Loading state
  if (isLoading) {
    return <ComplaintListSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Empty state
  if (complaints.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        isSearchResult={isSearchResult}
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Complaint List */}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <ComplaintListItem
            key={complaint.id}
            complaint={complaint}
            onClick={onComplaintClick}
            searchQuery={searchQuery}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(complaint.id)}
            onSelectionToggle={handleSelectionToggle}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}
