import * as React from 'react';
import { ComplaintList } from '@/components/complaints';
import type { Complaint, User } from '@/types/database.types';

export interface ComplaintsGridProps {
    /**
     * The role of the current user
     */
    userRole: 'student' | 'lecturer' | 'admin';

    /**
     * Complaints to display
     */
    complaints: (Complaint & { assigned_lecturer?: User | null })[];

    /**
     * Whether data is loading
     */
    isLoading: boolean;

    /**
     * Current page number
     */
    currentPage: number;

    /**
     * Total number of pages
     */
    totalPages: number;

    /**
     * Whether search mode is active
     */
    useSearch: boolean;

    /**
     * Current search query (only when useSearch is true)
     */
    searchQuery?: string;

    /**
     * Callback when a complaint is clicked
     */
    onComplaintClick: (complaintId: string) => void;

    /**
     * Callback when page changes
     */
    onPageChange: (page: number) => void;

    /**
     * Callback when search is cleared
     */
    onClearSearch: () => void;
}

/**
 * ComplaintsGrid Component
 * 
 * Displays the main complaint list with pagination.
 * Handles both normal filtered view and search results view.
 */
export function ComplaintsGrid({
    userRole,
    complaints,
    isLoading,
    currentPage,
    totalPages,
    useSearch,
    searchQuery,
    onComplaintClick,
    onPageChange,
    onClearSearch,
}: ComplaintsGridProps) {
    return (
        <ComplaintList
            complaints={complaints}
            isLoading={isLoading}
            onComplaintClick={onComplaintClick}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showPagination={true}
            searchQuery={useSearch ? searchQuery : undefined}
            isSearchResult={useSearch}
            onClearSearch={onClearSearch}
            emptyMessage={
                useSearch
                    ? `No complaints found matching "${searchQuery}"`
                    : userRole === 'student'
                        ? 'No complaints to display. Submit your first complaint to get started.'
                        : 'No complaints have been submitted yet.'
            }
        />
    );
}
