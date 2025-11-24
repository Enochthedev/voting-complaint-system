'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit, Clock, User } from 'lucide-react';
import type { Feedback, User as UserType } from '@/types/database.types';
import { FeedbackForm } from './feedback-form';

interface FeedbackWithUser extends Feedback {
  lecturer?: UserType;
}

interface FeedbackDisplayProps {
  complaintId: string;
  feedback?: FeedbackWithUser[];
  userRole?: 'student' | 'lecturer' | 'admin';
  currentUserId?: string;
  onAddFeedback?: () => void;
  onEditFeedback?: (feedbackId: string) => void;
}

/**
 * Format date to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
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
    return formatDate(dateString);
  }
}

/**
 * Check if feedback can be edited (within 24 hours)
 */
function canEditFeedback(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  return diffInHours < 24;
}

/**
 * Feedback Display Component
 * 
 * Displays feedback history for a complaint and allows lecturers to add/edit feedback.
 * Follows UI-first development approach with mock data.
 * 
 * Features:
 * - Display all feedback in chronological order
 * - Show lecturer information
 * - Allow lecturers to add new feedback
 * - Allow lecturers to edit their own feedback (within 24 hours)
 * - Show edit history
 * 
 * @param complaintId - ID of the complaint
 * @param feedback - Array of feedback entries
 * @param userRole - Current user's role
 * @param currentUserId - Current user's ID
 * @param onAddFeedback - Callback when adding feedback
 * @param onEditFeedback - Callback when editing feedback
 */
export function FeedbackDisplay({
  complaintId,
  feedback = [],
  userRole = 'student',
  currentUserId,
  onAddFeedback,
  onEditFeedback,
}: FeedbackDisplayProps) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingFeedbackId, setEditingFeedbackId] = React.useState<string | null>(null);

  const isLecturer = userRole === 'lecturer' || userRole === 'admin';
  const hasFeedback = feedback && feedback.length > 0;

  /**
   * Handle add feedback button click
   */
  const handleAddFeedback = () => {
    setShowAddForm(true);
    if (onAddFeedback) {
      onAddFeedback();
    }
  };

  /**
   * Handle edit feedback button click
   */
  const handleEditFeedback = (feedbackId: string) => {
    setEditingFeedbackId(feedbackId);
    if (onEditFeedback) {
      onEditFeedback(feedbackId);
    }
  };

  /**
   * Handle form cancel
   */
  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingFeedbackId(null);
  };

  /**
   * Handle form submit
   */
  const handleFormSubmit = async (content: string) => {
    // Mock submission - real implementation in Phase 12
    console.log('Feedback submitted:', content);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In Phase 12, this will call the actual API
    // The form component handles the submission
    
    // Close form after successful submission
    setShowAddForm(false);
    setEditingFeedbackId(null);
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
          <MessageSquare className="h-5 w-5" />
          Feedback {hasFeedback && `(${feedback.length})`}
        </h2>
        
        {/* Add Feedback Button (Lecturers only) */}
        {isLecturer && !showAddForm && !editingFeedbackId && (
          <Button
            onClick={handleAddFeedback}
            size="sm"
            variant="outline"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Add Feedback
          </Button>
        )}
      </div>

      {/* Add Feedback Form */}
      {showAddForm && (
        <div className="mb-6">
          <FeedbackForm
            complaintId={complaintId}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Feedback List */}
      {hasFeedback ? (
        <div className="space-y-4">
          {feedback.map((item) => {
            const isEditing = editingFeedbackId === item.id;
            const canEdit = isLecturer && 
                           currentUserId === item.lecturer_id && 
                           canEditFeedback(item.created_at);
            const wasEdited = item.updated_at !== item.created_at;

            return (
              <div key={item.id}>
                {isEditing ? (
                  <FeedbackForm
                    complaintId={complaintId}
                    existingFeedback={item}
                    isEditing={true}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                  />
                ) : (
                  <div className="rounded-lg border bg-muted p-4">
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Lecturer Avatar */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                          {item.lecturer?.full_name?.charAt(0) || 'L'}
                        </div>
                        
                        {/* Lecturer Info */}
                        <div>
                          <p className="font-medium text-foreground">
                            {item.lecturer?.full_name || 'Lecturer'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(item.created_at)}</span>
                            {wasEdited && (
                              <>
                                <span>•</span>
                                <span className="italic">Edited</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeedback(item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Feedback Content */}
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />

                    {/* Edit Time Limit Notice */}
                    {canEdit && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Can be edited for {Math.max(0, 24 - Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60)))} more hours
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No feedback has been provided yet.
          </p>
          {isLecturer && !showAddForm && (
            <Button
              onClick={handleAddFeedback}
              size="sm"
              variant="outline"
              className="mt-4"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Be the first to provide feedback
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
