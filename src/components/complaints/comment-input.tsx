'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Send, X } from 'lucide-react';

interface CommentInputProps {
  /**
   * Placeholder text for the textarea
   */
  placeholder?: string;

  /**
   * Callback when comment is submitted
   */
  onSubmit?: (comment: string, isInternal: boolean) => Promise<void>;

  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void;

  /**
   * Whether to show the internal note toggle (lecturer-only feature)
   */
  showInternalToggle?: boolean;

  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;

  /**
   * Initial value for the comment (for editing)
   */
  initialValue?: string;

  /**
   * Initial value for internal flag (for editing)
   */
  initialIsInternal?: boolean;

  /**
   * Whether this is editing an existing comment
   */
  isEditing?: boolean;

  /**
   * Minimum character length
   */
  minLength?: number;

  /**
   * Maximum character length
   */
  maxLength?: number;

  /**
   * Whether to auto-focus the textarea on mount
   */
  autoFocus?: boolean;

  /**
   * Custom class name for the container
   */
  className?: string;
}

interface FormErrors {
  comment?: string;
  general?: string;
}

const DEFAULT_MIN_LENGTH = 1;
const DEFAULT_MAX_LENGTH = 2000;
const DEFAULT_PLACEHOLDER = 'Write your comment here...';

/**
 * Comment Input Component
 *
 * A reusable component for adding comments to complaints.
 * Follows UI-first development approach with mock data.
 *
 * Features:
 * - Character count and validation
 * - Internal notes toggle for lecturers
 * - Loading states
 * - Error handling
 * - Edit existing comments
 * - Auto-focus support
 *
 * @example
 * ```tsx
 * <CommentInput
 *   onSubmit={async (comment, isInternal) => {
 *     await addComment(complaintId, comment, isInternal);
 *   }}
 *   showInternalToggle={userRole === 'lecturer'}
 * />
 * ```
 */
export function CommentInput({
  placeholder = DEFAULT_PLACEHOLDER,
  onSubmit,
  onCancel,
  showInternalToggle = false,
  isLoading: externalIsLoading = false,
  initialValue = '',
  initialIsInternal = false,
  isEditing = false,
  minLength = DEFAULT_MIN_LENGTH,
  maxLength = DEFAULT_MAX_LENGTH,
  autoFocus = false,
  className = '',
}: CommentInputProps) {
  const [comment, setComment] = React.useState(initialValue);
  const [isInternal, setIsInternal] = React.useState(initialIsInternal);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount if requested
  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [comment]);

  /**
   * Validate comment content
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      newErrors.comment = 'Comment cannot be empty';
    } else if (trimmedComment.length < minLength) {
      newErrors.comment = `Comment must be at least ${minLength} character${minLength !== 1 ? 's' : ''}`;
    } else if (trimmedComment.length > maxLength) {
      newErrors.comment = `Comment must be ${maxLength} characters or less`;
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
        // Call the provided onSubmit handler
        await onSubmit(comment.trim(), isInternal);

        // Reset form after successful submission
        setComment('');
        setIsInternal(false);

        // Call onCancel if provided (to close edit mode)
        if (onCancel && isEditing) {
          onCancel();
        }
      } else {
        // Mock submission for UI development (Phase 12 will implement real API)
        console.log('Comment submitted:', {
          comment: comment.trim(),
          isInternal,
          isEditing,
        });

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In Phase 12, this will be replaced with actual Supabase call:
        // if (isEditing && existingCommentId) {
        //   await supabase
        //     .from('complaint_comments')
        //     .update({
        //       comment: comment.trim(),
        //       is_internal: isInternal,
        //       updated_at: new Date().toISOString()
        //     })
        //     .eq('id', existingCommentId);
        // } else {
        //   await supabase.from('complaint_comments').insert({
        //     complaint_id: complaintId,
        //     user_id: currentUser.id,
        //     comment: comment.trim(),
        //     is_internal: isInternal,
        //   });
        // }
        //
        // Note: Notification creation is handled automatically by database triggers
        // See: database trigger notify_on_comment_added()
        // - Creates notification for complaint owner (if not internal)
        // - Creates notification for assigned lecturer (if applicable)
        // - Logs comment in complaint_history

        // Reset form after successful submission
        setComment('');
        setIsInternal(false);

        // Call onCancel if provided (to close edit mode)
        if (onCancel && isEditing) {
          onCancel();
        }
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      setErrors({
        general: `Failed to ${isEditing ? 'update' : 'submit'} comment. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    // Reset form
    setComment(initialValue);
    setIsInternal(initialIsInternal);
    setErrors({});

    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Handle textarea change
   */
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);

    // Clear error when user starts typing
    if (errors.comment) {
      setErrors((prev) => ({ ...prev, comment: undefined }));
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }

    // Cancel on Escape
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault();
      handleCancel();
    }
  };

  const isLoading = externalIsLoading || isSubmitting;
  const characterCount = comment.trim().length;
  const isOverLimit = characterCount > maxLength;
  const isUnderLimit = characterCount < minLength && characterCount > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Error Message */}
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Internal Note Info */}
      {showInternalToggle && isInternal && (
        <Alert variant="info">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This internal note will only be visible to lecturers and admins.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Textarea */}
        <div className="space-y-2">
          {isEditing && (
            <Label htmlFor="comment-input">Edit Comment {isInternal && '(Internal Note)'}</Label>
          )}
          <textarea
            ref={textareaRef}
            id="comment-input"
            value={comment}
            onChange={handleCommentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={3}
            disabled={isLoading}
            className={`w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.comment
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : 'border-input focus:border-ring'
            }`}
            aria-invalid={!!errors.comment}
            aria-describedby={errors.comment ? 'comment-error' : undefined}
          />

          {/* Character Count and Error */}
          <div className="flex items-center justify-between text-xs">
            {errors.comment ? (
              <span id="comment-error" className="text-destructive">
                {errors.comment}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {minLength > 1 && `Minimum ${minLength} characters • `}
                Press Ctrl+Enter to submit
              </span>
            )}
            <span
              className={`${
                isOverLimit
                  ? 'font-medium text-destructive'
                  : isUnderLimit
                    ? 'text-orange-500'
                    : 'text-muted-foreground'
              }`}
            >
              {characterCount}/{maxLength}
            </span>
          </div>
        </div>

        {/* Internal Note Toggle (Lecturer Only) */}
        {showInternalToggle && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="internal-note"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-input bg-background focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Label
              htmlFor="internal-note"
              className="cursor-pointer text-sm font-normal text-foreground"
            >
              Internal note (visible only to lecturers and admins)
            </Label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !comment.trim() || isOverLimit}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Posting...'}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isEditing ? 'Update' : 'Post'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
