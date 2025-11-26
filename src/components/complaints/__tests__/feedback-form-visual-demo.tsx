'use client';

import * as React from 'react';
import { FeedbackForm } from '../feedback-form';
import { FeedbackDisplay } from '../feedback-display';
import type { Feedback, User } from '@/types/database.types';

/**
 * Visual Demo Component for Feedback Form
 *
 * This component demonstrates the feedback form functionality with mock data.
 * It shows different states and interactions for testing and development.
 */
export function FeedbackFormVisualDemo() {
  const [activeDemo, setActiveDemo] = React.useState<'add' | 'edit' | 'display'>('display');

  // Mock data
  const mockComplaintId = 'complaint-demo-123';
  const mockCurrentUserId = 'lecturer-456';

  const mockLecturer: User = {
    id: 'lecturer-456',
    email: 'dr.smith@university.edu',
    role: 'lecturer',
    full_name: 'Dr. Sarah Smith',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
  };

  const mockFeedback: (Feedback & { lecturer?: User })[] = [
    {
      id: 'feedback-1',
      complaint_id: mockComplaintId,
      lecturer_id: 'lecturer-456',
      content:
        '<p>Thank you for reporting this issue. I have reviewed your complaint and contacted the facilities management team.</p><p>They have confirmed that the AC unit in Lecture Hall B is scheduled for repair this Friday, November 22nd. The maintenance team will arrive at 8:00 AM and expects to complete the work by noon.</p><p>In the meantime, we have arranged for your classes to be temporarily moved to Lecture Hall C, which has a functioning AC system.</p>',
      created_at: '2024-11-18T10:30:00Z',
      updated_at: '2024-11-18T10:30:00Z',
      lecturer: mockLecturer,
    },
    {
      id: 'feedback-2',
      complaint_id: mockComplaintId,
      lecturer_id: 'lecturer-789',
      content:
        '<p><strong>Update:</strong> The repair has been completed successfully!</p><p>The facilities team has tested the AC unit and confirmed it is now working properly. The temperature in Lecture Hall B should be comfortable for your next class.</p><p>Please let us know if you experience any further issues.</p>',
      created_at: '2024-11-22T14:15:00Z',
      updated_at: '2024-11-22T14:20:00Z',
      lecturer: {
        id: 'lecturer-789',
        email: 'prof.johnson@university.edu',
        role: 'lecturer',
        full_name: 'Prof. Michael Johnson',
        created_at: '2024-08-01T00:00:00Z',
        updated_at: '2024-08-01T00:00:00Z',
      },
    },
  ];

  const mockExistingFeedback: Feedback = {
    id: 'feedback-edit-demo',
    complaint_id: mockComplaintId,
    lecturer_id: mockCurrentUserId,
    content:
      '<p>This is existing feedback that can be edited.</p><p>It was created recently, so it is still within the 24-hour edit window.</p>',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  };

  const handleSubmit = async (content: string) => {
    console.log('Feedback submitted:', content);
    alert('Feedback submitted successfully! (This is a demo)');
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Feedback Form Visual Demo
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Interactive demonstration of the feedback form components
          </p>
        </div>

        {/* Demo Selector */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Select Demo Mode
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveDemo('display')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeDemo === 'display'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700'
              }`}
            >
              Display Feedback
            </button>
            <button
              onClick={() => setActiveDemo('add')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeDemo === 'add'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700'
              }`}
            >
              Add Feedback Form
            </button>
            <button
              onClick={() => setActiveDemo('edit')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeDemo === 'edit'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700'
              }`}
            >
              Edit Feedback Form
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="space-y-6">
          {activeDemo === 'display' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Feedback Display Component
              </h2>
              <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                Shows all feedback entries with lecturer information, timestamps, and edit
                capabilities.
              </p>
              <FeedbackDisplay
                complaintId={mockComplaintId}
                feedback={mockFeedback}
                userRole="lecturer"
                currentUserId={mockCurrentUserId}
                onAddFeedback={() => console.log('Add feedback clicked')}
                onEditFeedback={(id) => console.log('Edit feedback clicked:', id)}
              />
            </div>
          )}

          {activeDemo === 'add' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Add Feedback Form
              </h2>
              <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                Form for lecturers to provide new feedback on a complaint.
              </p>
              <FeedbackForm
                complaintId={mockComplaintId}
                onSubmit={handleSubmit}
                onCancel={() => console.log('Cancel clicked')}
              />
            </div>
          )}

          {activeDemo === 'edit' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Edit Feedback Form
              </h2>
              <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                Form for editing existing feedback (within 24-hour window).
              </p>
              <FeedbackForm
                complaintId={mockComplaintId}
                existingFeedback={mockExistingFeedback}
                isEditing={true}
                onSubmit={handleSubmit}
                onCancel={() => console.log('Cancel clicked')}
              />
            </div>
          )}
        </div>

        {/* Feature List */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Features Demonstrated
          </h2>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Rich text editor with formatting options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Character count validation (10-5000 characters)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Loading states during submission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Success and error messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Edit capability within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Lecturer information display</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Relative timestamps (e.g., "2 hours ago")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Edit indicator for modified feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Empty state when no feedback exists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Inline editing mode</span>
            </li>
          </ul>
        </div>

        {/* Implementation Notes */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-50">
            Implementation Notes
          </h2>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            This is a UI-first implementation using mock data. Real API integration with Supabase
            will be implemented in Phase 12. All form submissions currently log to console and show
            alerts for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeedbackFormVisualDemo;
