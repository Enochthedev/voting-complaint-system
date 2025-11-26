'use client';

import * as React from 'react';
import { FilterPanel, FilterState } from '../filter-panel';

/**
 * Filter Panel Demo Component
 *
 * This component demonstrates the filter panel UI with mock data.
 * It shows all the filtering capabilities including:
 * - Status, category, priority filters
 * - Date range selection
 * - Tag filtering
 * - Assigned lecturer filtering
 * - Sort options
 * - Active filter chips
 * - Save filter presets
 */
export default function FilterPanelDemo() {
  // Mock data
  const mockTags = [
    'wifi-issue',
    'classroom',
    'urgent',
    'library',
    'parking',
    'cafeteria',
    'equipment',
    'schedule',
    'exam',
    'assignment',
  ];

  const mockLecturers = [
    { id: '1', name: 'Dr. John Smith' },
    { id: '2', name: 'Prof. Sarah Johnson' },
    { id: '3', name: 'Dr. Michael Brown' },
    { id: '4', name: 'Prof. Emily Davis' },
    { id: '5', name: 'Dr. David Wilson' },
  ];

  // Filter state
  const [filters, setFilters] = React.useState<FilterState>({
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

  // Saved presets
  const [savedPresets, setSavedPresets] = React.useState<
    Array<{ name: string; filters: FilterState }>
  >([]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  // Handle save preset
  const handleSavePreset = (name: string, presetFilters: FilterState) => {
    setSavedPresets([...savedPresets, { name, filters: presetFilters }]);
    console.log('Preset saved:', name, presetFilters);
  };

  // Load preset
  const loadPreset = (preset: { name: string; filters: FilterState }) => {
    setFilters(preset.filters);
    console.log('Preset loaded:', preset.name);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Filter Panel Demo</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Interactive demonstration of the complaint filter panel UI
          </p>
        </div>

        {/* Layout: Filter Panel + Info */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSavePreset={handleSavePreset}
              availableTags={mockTags}
              availableLecturers={mockLecturers}
              isCollapsible={true}
              defaultCollapsed={false}
            />
          </div>

          {/* Info Panel */}
          <div className="space-y-6 lg:col-span-2">
            {/* Current Filter State */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Current Filter State
              </h2>
              <pre className="overflow-x-auto rounded-md bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
                {JSON.stringify(filters, null, 2)}
              </pre>
            </div>

            {/* Saved Presets */}
            {savedPresets.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Saved Presets
                </h2>
                <div className="space-y-2">
                  {savedPresets.map((preset, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {preset.name}
                      </span>
                      <button
                        onClick={() => loadPreset(preset)}
                        className="rounded-md bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features List */}
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Filter Panel Features
              </h2>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Status Filter:</strong> Filter by complaint status (New, Opened, In
                    Progress, Resolved, Closed, Reopened)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Category Filter:</strong> Filter by complaint category (Academic,
                    Facilities, Harassment, etc.)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Priority Filter:</strong> Filter by priority level (Low, Medium, High,
                    Critical)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Date Range:</strong> Filter complaints by creation date range
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Tag Filter:</strong> Filter by complaint tags with scrollable list
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Assigned Lecturer:</strong> Filter by assigned lecturer (dropdown)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Sort Options:</strong> Sort by date, priority, status, or title
                    (ascending/descending)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Active Filters:</strong> Display active filters as removable chips
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Clear All:</strong> Quick button to clear all filters at once
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Save Presets:</strong> Save current filter configuration as a named
                    preset
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Collapsible:</strong> Collapse/expand filter panel to save space
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Filter Count Badge:</strong> Shows number of active filters in header
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Expandable Sections:</strong> Each filter section can be
                    expanded/collapsed independently
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Responsive Design:</strong> Works on mobile and desktop screens
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>
                    <strong>Dark Mode Support:</strong> Full dark mode styling
                  </span>
                </li>
              </ul>
            </div>

            {/* Usage Instructions */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
              <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-50">
                How to Use
              </h2>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>
                  <strong>1.</strong> Select filters from the panel on the left
                </li>
                <li>
                  <strong>2.</strong> Watch the filter state update in real-time
                </li>
                <li>
                  <strong>3.</strong> Active filters appear as chips at the bottom
                </li>
                <li>
                  <strong>4.</strong> Click the X on a chip to remove that filter
                </li>
                <li>
                  <strong>5.</strong> Use "Clear All" to reset all filters
                </li>
                <li>
                  <strong>6.</strong> Save your filter configuration as a preset
                </li>
                <li>
                  <strong>7.</strong> Load saved presets from the list below
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
