import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, CheckSquare, X } from 'lucide-react';

export interface ComplaintsHeaderProps {
  /**
   * The role of the current user
   */
  userRole: 'student' | 'lecturer' | 'admin';

  /**
   * Callback when "New Complaint" button is clicked
   */
  onNewComplaint: () => void;

  /**
   * Callback when "Export CSV" button is clicked
   */
  onExportCSV?: () => void;

  /**
   * Whether export is in progress
   */
  isExporting?: boolean;

  /**
   * Whether selection mode is active
   */
  selectionMode?: boolean;

  /**
   * Callback when selection mode is toggled
   */
  onToggleSelectionMode?: () => void;
}

/**
 * ComplaintsHeader Component
 *
 * Displays the page header with title, description, and action buttons.
 * Students see "My Complaints" with a "New Complaint" button.
 * Lecturers and admins see "All Complaints" with an "Export CSV" button.
 */
export function ComplaintsHeader({
  userRole,
  onNewComplaint,
  onExportCSV,
  isExporting = false,
  selectionMode = false,
  onToggleSelectionMode,
}: ComplaintsHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="bg-gradient-ocean p-6 rounded-xl text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          {userRole === 'student' ? 'My Complaints' : 'All Complaints'}
        </h1>
        <p className="mt-2 text-sm text-white/90">
          {selectionMode
            ? 'Select complaints to export'
            : userRole === 'student'
              ? 'View and manage your submitted complaints'
              : 'View and manage all student complaints'}
        </p>
      </div>
      <div className="flex gap-2">
        {onExportCSV && !selectionMode && (
          <Button
            variant="outline"
            onClick={onExportCSV}
            disabled={isExporting}
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        )}
        {onToggleSelectionMode && (
          <Button
            variant={selectionMode ? 'secondary' : 'outline'}
            onClick={onToggleSelectionMode}
            className={
              selectionMode
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'border-purple-300 text-purple-700 hover:bg-purple-50'
            }
          >
            {selectionMode ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Select
              </>
            )}
          </Button>
        )}
        {userRole === 'student' && !selectionMode && (
          <Button
            onClick={onNewComplaint}
            className="bg-gradient-sunset text-white hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </Button>
        )}
      </div>
    </div>
  );
}
