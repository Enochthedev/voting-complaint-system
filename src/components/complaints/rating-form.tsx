'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingFormProps {
  /**
   * Callback when form is submitted with valid data
   */
  onSubmit: (rating: number, feedbackText: string) => Promise<void> | void;

  /**
   * Optional callback when form is cancelled
   */
  onCancel?: () => void;

  /**
   * Whether to show the cancel button
   * @default true
   */
  showCancel?: boolean;

  /**
   * Submit button text
   * @default "Submit Rating"
   */
  submitText?: string;

  /**
   * Cancel button text
   * @default "Cancel"
   */
  cancelText?: string;

  /**
   * Whether the form is in a loading/submitting state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Optional className for the form container
   */
  className?: string;

  /**
   * Whether to show the feedback textarea
   * @default true
   */
  showFeedback?: boolean;

  /**
   * Maximum length for feedback text
   * @default 500
   */
  maxFeedbackLength?: number;
}

/**
 * RatingForm Component
 *
 * A reusable form for collecting 1-5 star ratings with optional text feedback.
 *
 * Features:
 * - Interactive 1-5 star rating system with hover effects
 * - Optional text feedback field (up to 500 characters)
 * - Form validation (rating is required)
 * - Loading states
 * - Accessible with ARIA labels
 * - Responsive design
 *
 * Validates: Requirements AC16 (Satisfaction Rating)
 *
 * @example
 * ```tsx
 * <RatingForm
 *   onSubmit={async (rating, feedback) => {
 *     await submitRating(complaintId, rating, feedback);
 *   }}
 *   onCancel={() => setShowForm(false)}
 * />
 * ```
 */
export function RatingForm({
  onSubmit,
  onCancel,
  showCancel = true,
  submitText = 'Submit Rating',
  cancelText = 'Cancel',
  isLoading = false,
  className,
  showFeedback = true,
  maxFeedbackLength = 500,
}: RatingFormProps) {
  const [rating, setRating] = React.useState<number>(0);
  const [hoveredRating, setHoveredRating] = React.useState<number>(0);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate rating
    if (rating === 0) {
      setError('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, feedbackText.trim());
      // Reset form on successful submission
      setRating(0);
      setFeedbackText('');
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (value: number): string => {
    switch (value) {
      case 1:
        return 'Very Dissatisfied';
      case 2:
        return 'Dissatisfied';
      case 3:
        return 'Neutral';
      case 4:
        return 'Satisfied';
      case 5:
        return 'Very Satisfied';
      default:
        return 'Select a rating';
    }
  };

  const disabled = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Star Rating Section */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          How satisfied are you with the resolution?
        </Label>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                'transition-all duration-200 hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={disabled}
              aria-label={`Rate ${value} stars`}
            >
              <Star
                className={cn(
                  'h-10 w-10 transition-colors',
                  hoveredRating >= value || rating >= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-foreground">
          {getRatingLabel(hoveredRating || rating)}
        </p>

        {error && rating === 0 && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Optional Feedback Text Section */}
      {showFeedback && (
        <div className="space-y-2">
          <Label htmlFor="rating-feedback" className="text-base font-semibold">
            Additional Feedback{' '}
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="rating-feedback"
            placeholder="Tell us more about your experience..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            disabled={disabled}
            rows={4}
            maxLength={maxFeedbackLength}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {feedbackText.length}/{maxFeedbackLength} characters
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && rating !== 0 && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={disabled || rating === 0} className="flex-1">
          {disabled ? 'Submitting...' : submitText}
        </Button>

        {showCancel && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
            {cancelText}
          </Button>
        )}
      </div>
    </form>
  );
}
