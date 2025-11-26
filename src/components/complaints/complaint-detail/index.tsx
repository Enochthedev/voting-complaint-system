'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { ComplaintStatus } from '@/types/database.types';
import { FeedbackDisplay } from '@/components/complaints/feedback-display';
import { ComplaintHeader } from './ComplaintHeader';
import { ComplaintDescription } from './ComplaintDescription';
import { AttachmentsSection } from './AttachmentsSection';
import { TimelineSection } from './TimelineSection';
import { CommentsSection } from './CommentsSection';
import { ActionButtons } from './ActionButtons';
import { RatingPrompt } from '../rating-prompt';
import { getMockComplaintData, getMockLecturers } from './mock-data';
import type { ComplaintDetailViewProps, ComplaintWithRelations } from './types';

/**
 * Main Complaint Detail View Component
 * Orchestrates all sub-components and manages top-level state
 */
export function ComplaintDetailView({ complaintId, onBack }: ComplaintDetailViewProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [complaint, setComplaint] = React.useState<ComplaintWithRelations | null>(null);
  const [showRatingPrompt, setShowRatingPrompt] = React.useState(false);
  const [hasRated, setHasRated] = React.useState(false);
  const commentsRef = React.useRef<HTMLDivElement>(null);

  // Mock user role - in real implementation, get from auth context
  // For testing purposes, you can change this to 'lecturer' or 'admin' to see lecturer actions
  const userRole: 'student' | 'lecturer' | 'admin' = 'student';
  const currentUserId = userRole === 'student' ? 'student-123' : 'lecturer-456';

  // Function to scroll to comments section
  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus on the comment textarea after scrolling
      setTimeout(() => {
        const textarea = commentsRef.current?.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 500);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    if (!complaint) return;

    try {
      // Update local state immediately for better UX
      const oldStatus = complaint.status;

      setComplaint((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: newStatus,
          updated_at: new Date().toISOString(),
          // Add to history
          complaint_history: [
            ...(prev.complaint_history || []),
            {
              id: `hist-${Date.now()}`,
              complaint_id: prev.id,
              action: 'status_changed',
              old_value: oldStatus,
              new_value: newStatus,
              performed_by: 'lecturer-456', // Mock user ID
              details: null,
              created_at: new Date().toISOString(),
              user: {
                id: 'lecturer-456',
                email: 'dr.smith@university.edu',
                role: 'lecturer',
                full_name: 'Dr. Sarah Smith',
                created_at: '2024-08-01T00:00:00Z',
                updated_at: '2024-08-01T00:00:00Z',
              },
            },
          ],
        };
      });

      // In Phase 12, this will be replaced with actual API call
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert on error
      const mockData = getMockComplaintData(complaintId);
      setComplaint(mockData);
      throw err;
    }
  };

  // Handle assignment
  const handleAssignment = async (lecturerId: string) => {
    if (!complaint) return;

    try {
      // Get lecturer data
      const lecturers = getMockLecturers();
      const assignedLecturer = lecturers.find((l) => l.id === lecturerId);

      if (!assignedLecturer) {
        throw new Error('Lecturer not found');
      }

      // Update local state immediately for better UX
      const oldAssignment = complaint.assigned_to;
      const isReassignment = oldAssignment !== null;

      setComplaint((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assigned_to: lecturerId,
          assigned_lecturer: assignedLecturer,
          updated_at: new Date().toISOString(),
          // Add to history
          complaint_history: [
            ...(prev.complaint_history || []),
            {
              id: `hist-${Date.now()}`,
              complaint_id: prev.id,
              action: isReassignment ? 'reassigned' : 'assigned',
              old_value: oldAssignment,
              new_value: lecturerId,
              performed_by: 'lecturer-456', // Mock user ID
              details: null,
              created_at: new Date().toISOString(),
              user: {
                id: 'lecturer-456',
                email: 'dr.smith@university.edu',
                role: 'lecturer',
                full_name: 'Dr. Sarah Smith',
                created_at: '2024-08-01T00:00:00Z',
                updated_at: '2024-08-01T00:00:00Z',
              },
            },
          ],
        };
      });

      // In Phase 12, this will be replaced with actual API call
    } catch (err) {
      console.error('Error assigning complaint:', err);
      // Revert on error
      const mockData = getMockComplaintData(complaintId);
      setComplaint(mockData);
      throw err;
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating: number, feedbackText: string) => {
    if (!complaint) return;

    try {
      // Import the API function dynamically to avoid circular dependencies
      const { submitRating } = await import('@/lib/api/complaints');

      // Submit rating to database
      // This will throw an error if the user has already rated
      await submitRating(complaintId, currentUserId, rating, feedbackText);

      // Update local state
      setHasRated(true);
      setShowRatingPrompt(false);

      // Add to history for immediate UI update
      setComplaint((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          complaint_history: [
            ...(prev.complaint_history || []),
            {
              id: `hist-${Date.now()}`,
              complaint_id: prev.id,
              action: 'rated',
              old_value: null,
              new_value: rating.toString(),
              performed_by: currentUserId,
              details: feedbackText ? { feedback: feedbackText } : null,
              created_at: new Date().toISOString(),
              user: {
                id: currentUserId,
                email: 'john.doe@university.edu',
                role: 'student',
                full_name: 'John Doe',
                created_at: '2024-09-01T00:00:00Z',
                updated_at: '2024-09-01T00:00:00Z',
              },
            },
          ],
        };
      });
    } catch (err) {
      console.error('Error submitting rating:', err);

      // If the error is about already rating, update the UI state
      if (err instanceof Error && err.message.includes('already rated')) {
        setHasRated(true);
        setShowRatingPrompt(false);
      }

      throw err;
    }
  };

  // Handle rating prompt dismissal
  const handleRatingDismiss = () => {
    setShowRatingPrompt(false);
    // Store dismissal in localStorage to not show again for this complaint
    localStorage.setItem(`rating-dismissed-${complaintId}`, 'true');
  };

  React.useEffect(() => {
    // Mock data loading - real implementation in Phase 12
    const loadComplaint = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockData = getMockComplaintData(complaintId);
        setComplaint(mockData);

        // Check if complaint has been rated using the API function
        // This properly checks the complaint_ratings table
        const { hasRatedComplaint } = await import('@/lib/api/complaints');
        const hasExistingRating = await hasRatedComplaint(complaintId, currentUserId);
        setHasRated(hasExistingRating);

        // Check if rating prompt was dismissed
        const wasDismissed = localStorage.getItem(`rating-dismissed-${complaintId}`) === 'true';

        // Show rating prompt if:
        // 1. User is a student
        // 2. Complaint is resolved
        // 3. User is the complaint owner (or complaint is not anonymous)
        // 4. Hasn't been rated yet
        // 5. Hasn't been dismissed
        const shouldShowPrompt =
          userRole === 'student' &&
          mockData.status === 'resolved' &&
          mockData.student_id === currentUserId &&
          !hasExistingRating &&
          !wasDismissed;

        setShowRatingPrompt(shouldShowPrompt);
      } catch (err) {
        setError('Failed to load complaint details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaint();
  }, [complaintId, currentUserId, userRole]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !complaint) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">Error loading complaint</h3>
        <p className="mb-4 text-sm text-muted-foreground">{error || 'Complaint not found'}</p>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Complaints
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaints
        </Button>
      )}

      {/* Header */}
      <ComplaintHeader complaint={complaint} />

      {/* Action Buttons */}
      <ActionButtons
        complaint={complaint}
        userRole={userRole}
        onScrollToComments={scrollToComments}
        onStatusChange={handleStatusChange}
        onAssign={handleAssignment}
      />

      {/* Rating Prompt - shown after complaint is resolved */}
      {showRatingPrompt && !hasRated && (
        <RatingPrompt
          complaintId={complaint.id}
          complaintTitle={complaint.title}
          onSubmit={handleRatingSubmit}
          onDismiss={handleRatingDismiss}
        />
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content (Left Column - 2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <ComplaintDescription description={complaint.description} />
          <AttachmentsSection attachments={complaint.complaint_attachments || []} />
          <FeedbackDisplay
            complaintId={complaint.id}
            feedback={complaint.feedback || []}
            userRole={userRole}
            currentUserId={currentUserId}
          />
          <div ref={commentsRef}>
            <CommentsSection
              comments={complaint.complaint_comments || []}
              userRole={userRole}
              onAddComment={async (comment, isInternal) => {
                console.log('Add comment:', comment, 'Internal:', isInternal);
                // In Phase 12, this will call the actual API
              }}
            />
          </div>
        </div>

        {/* Sidebar (Right Column - 1/3) */}
        <div className="space-y-6">
          <TimelineSection history={complaint.complaint_history || []} />
        </div>
      </div>
    </div>
  );
}
