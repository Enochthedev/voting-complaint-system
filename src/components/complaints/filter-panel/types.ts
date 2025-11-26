import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types/database.types';

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

export type SortOption = 'created_at' | 'updated_at' | 'priority' | 'status' | 'title';

export const STATUS_OPTIONS: Array<{ value: ComplaintStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'opened', label: 'Opened' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'reopened', label: 'Reopened' },
];

export const CATEGORY_OPTIONS: Array<{ value: ComplaintCategory; label: string }> = [
  { value: 'academic', label: 'Academic' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'course_content', label: 'Course Content' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' },
];

export const PRIORITY_OPTIONS: Array<{ value: ComplaintPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'Title' },
];

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
