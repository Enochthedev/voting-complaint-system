'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingPromptProps {
  complaintId: string;
  complaintTitle: string;
  onSubmit: (rating: number, feedbackText: string) => Promise<void>;
  onDismiss: () => void;
}

/**
 * Rating Prompt Component
 *
 * Displays after a complaint is resolved to collect student satisfaction rating.
 * Features:
 * - 1-5 star rating system
 * - Optional text feedback
 * - Anonymous submission
 * - Can be dismissed
 *
 * Validates: Requirements AC16
 */
export function RatingPrompt({
  complaintId,
  complaintTitle,
  onSubmit,
  onDismiss,
}: RatingPromptProps) {
  const [rating, setRating] = React.useState<number>(0);
  const [hoveredRating, setHoveredRating] = React.useState<number>(0);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate rating
    if (rating === 0) {
      setError('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, feedbackText.trim());
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
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

  return (
    <Card className="relative border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-8 w-8 p-0"
        onClick={onDismiss}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">Rate Your Experience</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your complaint &quot;{complaintTitle}&quot; has been resolved. Please rate your
          satisfaction with the resolution.
        </p>
        <p className="mt-2 text-xs text-muted-foreground italic">
          Your rating is anonymous and helps us improve our service.
        </p>
      </div>

      {/* Star Rating */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                'transition-all duration-200 hover:scale-110',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
                isSubmitting && 'cursor-not-allowed opacity-50'
              )}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={isSubmitting}
              aria-label={`Rate ${value} stars`}
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  hoveredRating >= value || rating >= value
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-card-foreground">
          {getRatingLabel(hoveredRating || rating)}
        </p>
      </div>

      {/* Optional Feedback Text */}
      <div className="mb-4">
        <label
          htmlFor={`feedback-${complaintId}`}
          className="mb-2 block text-sm font-medium text-card-foreground"
        >
          Additional Feedback (Optional)
        </label>
        <Textarea
          id={`feedback-${complaintId}`}
          placeholder="Tell us more about your experience..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          maxLength={500}
          className="resize-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">{feedbackText.length}/500 characters</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="flex-1">
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
        <Button variant="outline" onClick={onDismiss} disabled={isSubmitting}>
          Skip
        </Button>
      </div>
    </Card>
  );
}

// Export type for external use
export type { RatingPromptProps };
