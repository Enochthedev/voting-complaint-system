'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AlertCircle, Loader2, Send, X, CheckCircle } from 'lucide-react';
import type { Feedback } from '@/types/database.types';

interface FeedbackFormProps {
  complaintId: string;
  onSubmit?: (content: string) => Promise<void>;
  onCancel?: () => void;
  existingFeedback?: Feedback;
  isEditing?: boolean;
}

interface FormErrors {
  content?: string;
  general?: string;
}

const MIN_CONTENT_LENGTH = 10;
const MAX_CONTENT_LENGTH = 5000;

/**
 * Feedback Form Component for Lecturers
 * 
 * Allows lecturers to write and send feedback on student complaints.
 * Follows UI-first development approach with mock data.
 * 
 * Features:
 * - Rich text editor for formatted feedback
 * - Character count and validation
 * - Loading states
 * - Error handling
 * - Edit existing feedback (within time limit)
 * 
 * @param complaintId - ID of the complaint to provide feedback for
 * @param onSubmit - Callback when feedback is submitted
 * @param onCancel - Callback when form is cancelled
 * @param existingFeedback - Existing feedback to edit (optional)
 * @param isEditing - Whether this is editing existing feedback
 */
export function FeedbackForm({
  complaintId,
  onSubmit,
  onCancel,
  existingFeedback,
  isEditing = false,
}: FeedbackFormProps) {
  const [content, setContent] = React.useState(existingFeedback?.content || '');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  /**
   * Helper function to strip HTML tags and get text content
   */
  const getTextContent = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  /**
   * Validate feedback content
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const textContent = getTextContent(content).trim();

    if (!textContent) {
      newErrors.content = 'Feedback content is required';
    } else if (textContent.length < MIN_CONTENT_LENGTH) {
      newErrors.content = `Feedback must be at least ${MIN_CONTENT_LENGTH} characters`;
    } else if (textContent.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Feedback must be ${MAX_CONTENT_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(content);
      } else {
        // Mock submission for UI development (Phase 12 will implement real API)
        console.log('Feedback submitted:', {
          complaintId,
          content,
          isEditing,
        });
        
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // In Phase 12, this will be replaced with actual Supabase call:
        // if (isEditing && existingFeedback) {
        //   await supabase
        //     .from('feedback')
        //     .update({ content, updated_at: new Date().toISOString() })
        //     .eq('id', existingFeedback.id);
        // } else {
        //   await supabase.from('feedback').insert({
        //     complaint_id: complaintId,
        //     lecturer_id: currentUser.id,
        //     content,
        //   });
        // }
        //
        // Note: Notification and history logging are handled automatically by database triggers
        // See: supabase/migrations/029_create_feedback_notification_trigger.sql
        // - notify_student_on_feedback() creates notification for student
        // - log_feedback_addition() logs feedback in complaint_history
      }

      // Show success message
      setShowSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        setContent('');
        setShowSuccess(false);
        if (onCancel) {
          onCancel();
        }
      }, 2000);
    } catch (error) {
      console.error('Feedback submission error:', error);
      setErrors({
        general: 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Get character count for display
   */
  const textContent = getTextContent(content);
  const characterCount = textContent.trim().length;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {isEditing ? 'Edit Feedback' : 'Provide Feedback'}
        </h3>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Alert variant="success" className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Feedback {isEditing ? 'updated' : 'submitted'} successfully! The student will be notified.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errors.general && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Info Message */}
      {!isEditing && (
        <Alert variant="info" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your feedback will be visible to the student and will trigger a notification.
            {existingFeedback && ' You can edit feedback within 24 hours of submission.'}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback Content */}
        <div className="space-y-2">
          <Label htmlFor="feedback-content">
            Feedback Content <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Provide detailed feedback to help the student understand the status and next steps.
          </p>
          <RichTextEditor
            value={content}
            onChange={(value) => {
              setContent(value);
              if (errors.content) {
                setErrors((prev) => ({ ...prev, content: undefined }));
              }
            }}
            placeholder="Write your feedback here... You can use formatting to make your feedback clear and easy to read."
            disabled={isSubmitting}
            maxLength={MAX_CONTENT_LENGTH}
            error={!!errors.content}
          />
          
          {/* Character Count and Error */}
          <div className="flex items-center justify-between text-xs">
            {errors.content ? (
              <span className="text-red-500">{errors.content}</span>
            ) : (
              <span className="text-muted-foreground">
                Minimum {MIN_CONTENT_LENGTH} characters
              </span>
            )}
            <span
              className={`${
                characterCount < MIN_CONTENT_LENGTH
                  ? 'text-orange-500'
                  : characterCount > MAX_CONTENT_LENGTH
                  ? 'text-red-500'
                  : 'text-muted-foreground'
              }`}
            >
              {characterCount}/{MAX_CONTENT_LENGTH}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Feedback' : 'Send Feedback'}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Edit Time Limit Notice */}
      {isEditing && existingFeedback && (
        <div className="mt-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="mr-1 inline h-3 w-3" />
            Note: Feedback can only be edited within 24 hours of submission.
          </p>
        </div>
      )}
    </div>
  );
}
