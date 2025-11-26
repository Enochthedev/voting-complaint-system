/**
 * Filter Panel
 *
 * This file has been refactored into smaller, focused components.
 * See: src/components/complaints/filter-panel/
 *
 * Component Structure:
 * - index.tsx - Main filter panel orchestrator
 * - StatusFilter.tsx - Status checkbox filters
 * - CategoryFilter.tsx - Category checkbox filters
 * - PriorityFilter.tsx - Priority checkbox filters
 * - DateRangeFilter.tsx - Date range picker
 * - SortOptions.tsx - Sort by and order selection
 * - ActiveFilters.tsx - Display active filter chips
 * - types.ts - Shared types and constants
 */

export { FilterPanel } from './filter-panel/index';
export type { FilterState, SortOption, FilterPanelProps } from './filter-panel/types';
