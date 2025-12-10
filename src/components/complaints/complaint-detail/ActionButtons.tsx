'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertCircle, CheckCircle, User, FileText, Download } from 'lucide-react';
import type { ComplaintStatus, User as UserType } from '@/types/database.types';
import type { ComplaintWithRelations } from './types';
import { STATUS_CONFIG } from './constants';
import { getMockLecturers } from './mock-data';
import { exportComplaintToPDF } from '@/lib/export/pdf-export';

interface ActionButtonsProps {
  complaint: ComplaintWithRelations;
  userRole: 'student' | 'lecturer' | 'admin';
  onScrollToComments?: () => void;
  onStatusChange?: (newStatus: ComplaintStatus) => Promise<void>;
  onAssign?: (lecturerId: string) => Promise<void>;
}

/**
 * Action Buttons Component (Role-based)
 * Provides role-appropriate action buttons and modals
 */
export function ActionButtons({
  complaint,
  userRole,
  onScrollToComments,
  onStatusChange,
  onAssign,
}: ActionButtonsProps) {
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<ComplaintStatus | null>(null);
  const [statusChangeNote, setStatusChangeNote] = React.useState('');
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  const [selectedLecturer, setSelectedLecturer] = React.useState<string>('');
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [availableLecturers] = React.useState<UserType[]>(getMockLecturers());
  const [showReopenModal, setShowReopenModal] = React.useState(false);
  const [reopenJustification, setReopenJustification] = React.useState('');
  const [isReopening, setIsReopening] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    if (newStatus === complaint.status) {
      return; // No change needed
    }

    setSelectedStatus(newStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedStatus) return;

    setIsChangingStatus(true);
    try {
      // Mock status change - real implementation in Phase 12
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Changing status to:', selectedStatus, 'Note:', statusChangeNote);

      if (onStatusChange) {
        await onStatusChange(selectedStatus);
      }

      alert(
        `Status changed to: ${selectedStatus}${statusChangeNote ? '\nNote: ' + statusChangeNote : ''}`
      );

      // Reset modal state
      setShowStatusModal(false);
      setSelectedStatus(null);
      setStatusChangeNote('');
    } catch (error) {
      console.error('Error changing status:', error);
      alert('Failed to change status. Please try again.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setSelectedStatus(null);
    setStatusChangeNote('');
  };

  const handleReopen = () => {
    setShowReopenModal(true);
  };

  const confirmReopen = async () => {
    if (!reopenJustification.trim()) {
      alert('Please provide a justification for reopening this complaint');
      return;
    }

    setIsReopening(true);
    try {
      // Import the reopenComplaint function
      const { reopenComplaint } = await import('@/lib/api/complaints');
      const { supabase } = await import('@/lib/supabase');

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call the API to reopen the complaint
      await reopenComplaint(complaint.id, reopenJustification, user.id);

      // Trigger status change callback if provided
      if (onStatusChange) {
        await onStatusChange('reopened');
      }

      alert(`Complaint reopened successfully.\nJustification: ${reopenJustification}`);

      // Reset modal state
      setShowReopenModal(false);
      setReopenJustification('');

      // Reload the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error reopening complaint:', error);
      alert(
        `Failed to reopen complaint: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsReopening(false);
    }
  };

  const cancelReopen = () => {
    setShowReopenModal(false);
    setReopenJustification('');
  };

  const handleAssign = () => {
    setShowAssignModal(true);
    // Pre-select current assignment if exists
    if (complaint.assigned_to) {
      setSelectedLecturer(complaint.assigned_to);
    }
  };

  const confirmAssignment = async () => {
    if (!selectedLecturer) {
      alert('Please select a lecturer to assign');
      return;
    }

    setIsAssigning(true);
    try {
      // Mock assignment - real implementation in Phase 12
      await new Promise((resolve) => setTimeout(resolve, 500));

      const selectedLecturerData = availableLecturers.find((l) => l.id === selectedLecturer);
      console.log('Assigning complaint to:', selectedLecturerData?.full_name);

      if (onAssign) {
        await onAssign(selectedLecturer);
      }

      alert(`Complaint assigned to: ${selectedLecturerData?.full_name || 'Unknown'}`);

      // Reset modal state
      setShowAssignModal(false);
      setSelectedLecturer('');
    } catch (error) {
      console.error('Error assigning complaint:', error);
      alert('Failed to assign complaint. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const cancelAssignment = () => {
    setShowAssignModal(false);
    setSelectedLecturer('');
  };

  const handleAddInternalNote = () => {
    // Scroll to comments section and focus on the textarea
    if (onScrollToComments) {
      onScrollToComments();
      // The internal toggle will be available in the comment input
      // User can check it manually to make the note internal
    }
  };

  const handleRateResolution = () => {
    // Scroll to top where the rating prompt should be visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddComment = () => {
    // Scroll to comments section
    if (onScrollToComments) {
      onScrollToComments();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportComplaintToPDF(complaint);
      // PDF will be downloaded automatically
    } catch (error) {
      console.error('Error exporting complaint:', error);
      alert('Failed to export complaint. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Get available status transitions based on current status
  const getAvailableStatuses = (): ComplaintStatus[] => {
    switch (complaint.status) {
      case 'new':
        return ['opened', 'in_progress', 'resolved', 'closed'];
      case 'opened':
        return ['in_progress', 'resolved', 'closed'];
      case 'in_progress':
        return ['resolved', 'closed'];
      case 'reopened':
        return ['in_progress', 'resolved', 'closed'];
      case 'resolved':
        return ['closed', 'reopened'];
      case 'closed':
        return ['reopened'];
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses();

  // Student actions
  if (userRole === 'student') {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAddComment} variant="default">
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Comment
          </Button>
          {complaint.status === 'resolved' && (
            <>
              <Button onClick={handleReopen} disabled={isChangingStatus} variant="outline">
                <AlertCircle className="mr-2 h-4 w-4" />
                Reopen Complaint
              </Button>
              <Button onClick={handleRateResolution} variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Rate Resolution
              </Button>
            </>
          )}
          <Button onClick={handleExport} disabled={isExporting} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>
    );
  }

  // Lecturer/Admin actions
  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {availableStatuses.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    handleStatusChange(value as ComplaintStatus);
                    // Reset select to placeholder
                    e.target.value = '';
                  }
                }}
                disabled={isChangingStatus}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value=""
              >
                <option value="" disabled>
                  Change Status
                </option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button variant="outline" onClick={handleAssign}>
            <User className="mr-2 h-4 w-4" />
            Assign
          </Button>
          <Button variant="outline" onClick={handleAddInternalNote}>
            <FileText className="mr-2 h-4 w-4" />
            Add Internal Note
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Status Change Confirmation Modal */}
      {showStatusModal && selectedStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Confirm Status Change
            </h3>

            <div className="mb-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Change complaint status from{' '}
                <span className="font-semibold text-card-foreground">
                  {STATUS_CONFIG[complaint.status].label}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-card-foreground">
                  {STATUS_CONFIG[selectedStatus].label}
                </span>
                ?
              </p>

              <div className="mt-4">
                <label
                  htmlFor="status-note"
                  className="mb-2 block text-sm font-medium text-card-foreground"
                >
                  Add a note (optional)
                </label>
                <textarea
                  id="status-note"
                  value={statusChangeNote}
                  onChange={(e) => setStatusChangeNote(e.target.value)}
                  placeholder="Explain the reason for this status change..."
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelStatusChange} disabled={isChangingStatus}>
                Cancel
              </Button>
              <Button onClick={confirmStatusChange} disabled={isChangingStatus}>
                {isChangingStatus ? 'Changing...' : 'Confirm Change'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Assign Complaint</h3>

            <div className="mb-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                {complaint.assigned_to
                  ? 'Reassign this complaint to a different lecturer or admin'
                  : 'Assign this complaint to a lecturer or admin'}
              </p>

              {/* Current Assignment Info */}
              {complaint.assigned_to && complaint.assigned_lecturer && (
                <div className="rounded-lg border border-border bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Currently assigned to:
                  </p>
                  <p className="mt-1 text-sm font-semibold text-card-foreground">
                    {complaint.assigned_lecturer.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {complaint.assigned_lecturer.email}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="lecturer-select"
                  className="mb-2 block text-sm font-medium text-card-foreground"
                >
                  Select Lecturer/Admin
                </label>
                <select
                  id="lecturer-select"
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isAssigning}
                >
                  <option value="">-- Select a person --</option>
                  {availableLecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.full_name} ({lecturer.role}) - {lecturer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show selected lecturer info */}
              {selectedLecturer && (
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                  <p className="text-xs font-medium text-primary">Will be assigned to:</p>
                  <p className="mt-1 text-sm font-semibold text-card-foreground">
                    {availableLecturers.find((l) => l.id === selectedLecturer)?.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {availableLecturers.find((l) => l.id === selectedLecturer)?.email}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelAssignment} disabled={isAssigning}>
                Cancel
              </Button>
              <Button onClick={confirmAssignment} disabled={isAssigning || !selectedLecturer}>
                {isAssigning ? 'Assigning...' : complaint.assigned_to ? 'Reassign' : 'Assign'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Complaint Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Reopen Complaint</h3>

            <div className="mb-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide a justification for reopening this complaint. This will help the
                assigned lecturer understand why the issue persists.
              </p>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  ⚠️ Important
                </p>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                  Reopening will change the status from "Resolved" to "Reopened" and notify the
                  assigned lecturer.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reopen-justification"
                  className="mb-2 block text-sm font-medium text-card-foreground"
                >
                  Justification <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="reopen-justification"
                  value={reopenJustification}
                  onChange={(e) => setReopenJustification(e.target.value)}
                  placeholder="Explain why this complaint needs to be reopened..."
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isReopening}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {reopenJustification.length} characters
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelReopen} disabled={isReopening}>
                Cancel
              </Button>
              <Button onClick={confirmReopen} disabled={isReopening || !reopenJustification.trim()}>
                {isReopening ? 'Reopening...' : 'Reopen Complaint'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
