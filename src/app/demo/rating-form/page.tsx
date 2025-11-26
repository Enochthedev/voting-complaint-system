'use client';

import * as React from 'react';
import { RatingForm, RatingPrompt } from '@/components/complaints';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

/**
 * Demo page for the Rating Form component
 *
 * This page demonstrates the rating form functionality with mock data.
 * Following the UI-first development approach, this uses temporary data
 * and mock submission handlers.
 *
 * Task: 8.2 - Build rating form (1-5 stars + optional text)
 */
export default function RatingFormDemoPage() {
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [submittedRating, setSubmittedRating] = React.useState<{
    rating: number;
    feedback: string;
  } | null>(null);
  const [showPrompt, setShowPrompt] = React.useState(true);

  // Mock submission handler
  const handleSubmit = async (rating: number, feedbackText: string) => {
    console.log('Rating submitted:', { rating, feedbackText });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store the submitted data
    setSubmittedRating({ rating, feedback: feedbackText });
    setShowSuccess(true);

    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handlePromptSubmit = async (rating: number, feedbackText: string) => {
    console.log('Prompt rating submitted:', { rating, feedbackText });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Hide the prompt after submission
    setShowPrompt(false);
    setSubmittedRating({ rating, feedback: feedbackText });
    setShowSuccess(true);
  };

  const handlePromptDismiss = () => {
    console.log('Rating prompt dismissed');
    setShowPrompt(false);
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
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
        return '';
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Rating Form Demo</h1>
        <p className="mt-2 text-muted-foreground">
          Demonstration of the complaint satisfaction rating form (Task 8.2)
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && submittedRating && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Rating submitted successfully! You rated {submittedRating.rating} stars
            {submittedRating.rating && ` (${getRatingLabel(submittedRating.rating)})`}
            {submittedRating.feedback && (
              <span className="block mt-1 text-sm">
                Feedback: &quot;{submittedRating.feedback}&quot;
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Rating Prompt Demo */}
      {showPrompt && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Rating Prompt (After Resolution)</h2>
          <RatingPrompt
            complaintId="demo-complaint-1"
            complaintTitle="Broken AC in Lecture Hall"
            onSubmit={handlePromptSubmit}
            onDismiss={handlePromptDismiss}
          />
        </div>
      )}

      {/* Standalone Rating Form Demo */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Standalone Rating Form</h2>
        <Card className="p-6">
          <RatingForm onSubmit={handleSubmit} onCancel={() => console.log('Form cancelled')} />
        </Card>
      </div>

      {/* Compact Rating Form (No Feedback) */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Compact Form (Stars Only)</h2>
        <Card className="p-6">
          <RatingForm
            onSubmit={handleSubmit}
            showFeedback={false}
            showCancel={false}
            submitText="Rate"
          />
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Component Features</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Interactive 1-5 star rating system with hover effects</li>
          <li>✓ Optional text feedback field (up to 500 characters)</li>
          <li>✓ Form validation (rating is required)</li>
          <li>✓ Loading states during submission</li>
          <li>✓ Accessible with ARIA labels</li>
          <li>✓ Responsive design</li>
          <li>✓ Two variants: Prompt (dismissible) and Form (standalone)</li>
          <li>✓ Customizable button text and behavior</li>
        </ul>
      </Card>

      {/* Implementation Notes */}
      <Card className="p-6 bg-muted/50">
        <h2 className="mb-4 text-xl font-semibold">Implementation Notes</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Task:</strong> 8.2 - Build rating form (1-5 stars + optional text)
          </p>
          <p>
            <strong>Status:</strong> ✅ Complete
          </p>
          <p>
            <strong>Components:</strong>
          </p>
          <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
            <li>
              <code className="text-xs">RatingForm</code> - Standalone reusable form component
            </li>
            <li>
              <code className="text-xs">RatingPrompt</code> - Dismissible prompt shown after
              resolution
            </li>
          </ul>
          <p className="mt-4">
            <strong>Next Steps:</strong>
          </p>
          <ul className="ml-6 list-disc space-y-1 text-muted-foreground">
            <li>Task 8.2.3: Implement rating submission (API integration)</li>
            <li>Task 8.2.4: Enforce one rating per complaint (database constraint)</li>
            <li>Task 8.2.5: Display ratings in analytics</li>
            <li>Task 8.2.6: Show average rating on dashboard</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
