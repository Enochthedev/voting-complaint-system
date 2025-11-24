import * as React from 'react';
import { Button } from '@/components/ui/button';
import { FilterPanel, type FilterState } from '@/components/complaints/filter-panel';
import { FilterPresetManager, type FilterPreset } from '@/components/complaints/filter-preset-manager';

export interface ComplaintsFiltersProps {
    /**
     * The role of the current user
     */
    userRole: 'student' | 'lecturer' | 'admin';

    /**
     * Current user ID for filtering
     */
    userId: string;

    /**
     * Current filter state
     */
    filters: FilterState;

    /**
     * Available tags for filtering
     */
    availableTags: string[];

    /**
     * Available lecturers for filtering
     */
    availableLecturers: Array<{ id: string; name: string }>;

    /**
     * Whether search mode is active
     */
    useSearch: boolean;

    /**
     * Key for forcing FilterPresetManager re-render
     */
    presetManagerKey: number;

    /**
     * Callback when filters change
     */
    onFiltersChange: (filters: FilterState) => void;

    /**
     * Callback when page should reset to first page
     */
    onResetPage: () => void;

    /**
     * Callback when search should be cleared
     */
    onClearSearch: () => void;

    /**
     * Callback when filter preset is saved
     */
    onSavePreset: (name: string, filters: FilterState) => void;

    /**
     * Callback when filter preset is loaded
     */
    onLoadPreset: (preset: FilterPreset) => void;
}

/**
 * ComplaintsFilters Component
 * 
 * Provides filtering capabilities for complaints, including:
 * - Quick filters (for lecturers/admins)
 * - Advanced filter panel
 * - Filter preset management
 */
export function ComplaintsFilters({
    userRole,
    userId,
    filters,
    availableTags,
    availableLecturers,
    useSearch,
    presetManagerKey,
    onFiltersChange,
    onResetPage,
    onClearSearch,
    onSavePreset,
    onLoadPreset,
}: ComplaintsFiltersProps) {
    const handleQuickFilterClick = (filterUpdate: Partial<FilterState>) => {
        onFiltersChange({ ...filters, ...filterUpdate });
        onResetPage();
        if (useSearch) {
            onClearSearch();
        }
    };

    return (
        <div className="space-y-6">
            {/* Quick Filters (Lecturer/Admin only) */}
            {(userRole === 'lecturer' || userRole === 'admin') && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={filters.assignedTo === userId ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                handleQuickFilterClick({
                                    assignedTo: filters.assignedTo === userId ? '' : userId,
                                });
                            }}
                            className="transition-all"
                        >
                            Assigned to Me
                        </Button>
                        <Button
                            variant={
                                filters.priority.includes('high') || filters.priority.includes('critical')
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                                handleQuickFilterClick({
                                    priority:
                                        filters.priority.includes('high') || filters.priority.includes('critical')
                                            ? []
                                            : ['high', 'critical'],
                                });
                            }}
                            className="transition-all"
                        >
                            High Priority
                        </Button>
                        <Button
                            variant={
                                filters.status.includes('new') ||
                                    filters.status.includes('opened') ||
                                    filters.status.includes('in_progress') ||
                                    filters.status.includes('reopened')
                                    ? 'default'
                                    : 'outline'
                            }
                            size="sm"
                            onClick={() => {
                                handleQuickFilterClick({
                                    status:
                                        filters.status.includes('new') ||
                                            filters.status.includes('opened') ||
                                            filters.status.includes('in_progress') ||
                                            filters.status.includes('reopened')
                                            ? []
                                            : ['new', 'opened', 'in_progress', 'reopened'],
                                });
                            }}
                            className="transition-all"
                        >
                            Unresolved
                        </Button>
                    </div>
                </div>
            )}

            {/* Filter Panel and Preset Manager */}
            <div className="space-y-4">
                <FilterPanel
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    onSavePreset={onSavePreset}
                    availableTags={availableTags}
                    availableLecturers={availableLecturers}
                    isCollapsible={true}
                    defaultCollapsed={false}
                />

                <FilterPresetManager
                    key={presetManagerKey}
                    onLoadPreset={onLoadPreset}
                />
            </div>
        </div>
    );
}
