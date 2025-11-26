/**
 * Visual Demo: Reopen Complaint Feature
 *
 * This file demonstrates the reopen complaint functionality
 * for visual testing and documentation purposes.
 *
 * To use: Import this component in a page and render it
 */

'use client';

import * as React from 'react';
import { ActionButtons } from '../ActionButtons';
import type { ComplaintWithRelations } from '../types';

export function ReopenComplaintDemo() {
  const [complaintStatus, setComplaintStatus] = React.useState<'resolved' | 'reopened'>('resolved');

  const mockComplaint: ComplaintWithRelations = {
    id: 'demo-complaint-1',
    student_id: 'student-123',
    is_anonymous: false,
    is_draft: false,
    title: 'Broken AC in Lecture Hall B',
    description:
      'The air conditioning unit in Lecture Hall B has been malfunctioning for the past week.',
    category: 'facilities',
    priority: 'high',
    status: complaintStatus,
    assigned_to: 'lecturer-456',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-24T15:30:00Z',
    opened_at: '2024-11-20T11:00:00Z',
    opened_by: 'lecturer-456',
    resolved_at: '2024-11-24T15:30:00Z',
    escalated_at: null,
    escalation_level: 0,
    assigned_lecturer: {
      id: 'lecturer-456',
      email: 'john.doe@university.edu',
      role: 'lecturer',
      full_name: 'Dr. John Doe',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  };

  const handleStatusChange = async (newStatus: any) => {
    console.log('Status changed to:', newStatus);
    setComplaintStatus(newStatus);

    // Simulate notification creation
    console.log('Notification created for assigned lecturer');
    console.log('History entry logged with justification');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="mb-2 text-2xl font-bold text-card-foreground">
          Reopen Complaint Feature Demo
        </h1>
        <p className="text-sm text-muted-foreground">
          This demo shows the reopen functionality for students on resolved complaints.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Complaint Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium text-card-foreground">{mockComplaint.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium text-card-foreground capitalize">{complaintStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium text-card-foreground capitalize">
              {mockComplaint.category}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Priority:</span>
            <span className="font-medium text-card-foreground capitalize">
              {mockComplaint.priority}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Assigned To:</span>
            <span className="font-medium text-card-foreground">
              {mockComplaint.assigned_lecturer?.full_name}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-card-foreground">Student Actions</h2>
        <ActionButtons
          complaint={{ ...mockComplaint, status: complaintStatus }}
          userRole="student"
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-6">
        <h3 className="mb-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          💡 Demo Instructions
        </h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-amber-600 dark:text-amber-300">
          <li>When status is "resolved", the "Reopen Complaint" button appears</li>
          <li>Click the button to open the justification modal</li>
          <li>Enter a reason for reopening (required field)</li>
          <li>Submit to change status to "reopened"</li>
          <li>The assigned lecturer will receive a notification</li>
          <li>The action is logged in the complaint history</li>
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-muted p-6">
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Expected Behavior</h3>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>✅ Reopen button only shows for resolved complaints</li>
          <li>✅ Modal requires justification before submission</li>
          <li>✅ Character counter shows justification length</li>
          <li>✅ Submit button disabled until justification entered</li>
          <li>✅ Cancel button closes modal without changes</li>
          <li>✅ Success message shown after reopening</li>
          <li>✅ Status updates to "reopened"</li>
          <li>✅ Notification created for assigned lecturer</li>
          <li>✅ History entry logged with justification</li>
        </ul>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-6">
        <h3 className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
          🔧 Phase 12 Integration
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Currently using mock implementation. In Phase 12, this will connect to:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-600 dark:text-blue-300">
          <li>Real Supabase database for status updates</li>
          <li>complaint_history table for audit logging</li>
          <li>notifications table for real-time alerts</li>
          <li>Authentication context for user identification</li>
        </ul>
      </div>
    </div>
  );
}

export default ReopenComplaintDemo;
