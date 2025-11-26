'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, X, Edit, UserPlus, Tag, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import type { ComplaintStatus } from '@/types/database.types';

export interface BulkActionBarProps {
  /**
   * Number of selected items
   */
  selectedCount: number;

  /**
   * Total number of items available
   */
  totalCount: number;

  /**
   * Whether export is in progress
   */
  isExporting?: boolean;

  /**
   * Export progress (0-100)
   */
  exportProgress?: number;

  /**
   * Export status message
   */
  exportMessage?: string;

  /**
   * Whether a bulk action is in progress
   */
  isBulkActionLoading?: boolean;

  /**
   * Bulk action progress (0-100)
   */
  bulkActionProgress?: number;

  /**
   * Bulk action status message
   */
  bulkActionMessage?: string;

  /**
   * Callback when export CSV is clicked
   */
  onExport: () => void;

  /**
   * Callback when export with attachments is clicked
   */
  onExportWithAttachments?: () => void;

  /**
   * Whether any selected complaints have attachments
   */
  hasAttachments?: boolean;

  /**
   * Callback when select all is clicked
   */
  onSelectAll: () => void;

  /**
   * Callback when clear selection is clicked
   */
  onClearSelection: () => void;

  /**
   * Callback when bulk status change is requested
   */
  onBulkStatusChange?: (status: ComplaintStatus) => void;

  /**
   * Callback when bulk assignment is requested
   */
  onBulkAssignment?: () => void;

  /**
   * Callback when bulk tag addition is requested
   */
  onBulkTagAddition?: () => void;

  /**
   * User role for conditional rendering
   */
  userRole?: 'student' | 'lecturer' | 'admin';
}

/**
 * BulkActionBar Component
 *
 * Displays a sticky action bar when items are selected,
 * allowing bulk operations like export, status change, assignment, and tag addition.
 */
export function BulkActionBar({
  selectedCount,
  totalCount,
  isExporting = false,
  exportProgress = 0,
  exportMessage = '',
  isBulkActionLoading = false,
  bulkActionProgress = 0,
  bulkActionMessage = '',
  onExport,
  onExportWithAttachments,
  hasAttachments = false,
  onSelectAll,
  onClearSelection,
  onBulkStatusChange,
  onBulkAssignment,
  onBulkTagAddition,
  userRole = 'student',
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  const allSelected = selectedCount === totalCount;
  const isLecturerOrAdmin = userRole === 'lecturer' || userRole === 'admin';
  const isAnyActionInProgress = isExporting || isBulkActionLoading;

  // Status options for bulk change
  const statusOptions: { value: ComplaintStatus; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'opened', label: 'Opened' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-6 py-3 shadow-lg">
        {/* Main action bar */}
        <div className="flex items-center gap-4">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-card-foreground">
              {selectedCount} {selectedCount === 1 ? 'complaint' : 'complaints'} selected
            </span>
            <div className="flex items-center gap-1">
              {!allSelected && (
                <>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={onSelectAll}
                    disabled={isAnyActionInProgress}
                    className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                  >
                    Select all {totalCount}
                  </Button>
                  <span className="text-xs text-muted-foreground">•</span>
                </>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={onClearSelection}
                disabled={isAnyActionInProgress}
                className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              >
                Select none
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Export Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isAnyActionInProgress}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExport} disabled={isAnyActionInProgress}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                {hasAttachments && onExportWithAttachments && (
                  <DropdownMenuItem
                    onClick={onExportWithAttachments}
                    disabled={isAnyActionInProgress}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export with Attachments
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Lecturer/Admin Actions */}
            {isLecturerOrAdmin && (
              <>
                {/* Change Status */}
                {onBulkStatusChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isAnyActionInProgress}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Change Status
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Change Status To</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {statusOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => onBulkStatusChange(option.value)}
                          disabled={isAnyActionInProgress}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Assign */}
                {onBulkAssignment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBulkAssignment}
                    disabled={isAnyActionInProgress}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                )}

                {/* Add Tags */}
                {onBulkTagAddition && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBulkTagAddition}
                    disabled={isAnyActionInProgress}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Add Tags
                  </Button>
                )}
              </>
            )}

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isAnyActionInProgress}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        {isExporting && (
          <div className="w-full min-w-[400px]">
            <Progress
              value={exportProgress}
              label={exportMessage}
              showValue
              size="sm"
              variant="default"
            />
          </div>
        )}

        {/* Bulk action progress indicator */}
        {isBulkActionLoading && (
          <div className="w-full min-w-[400px]">
            <Progress
              value={bulkActionProgress}
              label={bulkActionMessage}
              showValue
              size="sm"
              variant="default"
            />
          </div>
        )}
      </div>
    </div>
  );
}
