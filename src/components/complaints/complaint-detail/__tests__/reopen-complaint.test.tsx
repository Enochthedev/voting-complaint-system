/**
 * Test for Reopen Complaint Functionality
 *
 * This test verifies that students can reopen resolved complaints
 * with a justification as per AC15 and Task 5.3
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionButtons } from '../ActionButtons';
import type { ComplaintWithRelations } from '../types';

describe('Reopen Complaint Functionality', () => {
  const mockResolvedComplaint: ComplaintWithRelations = {
    id: 'test-complaint-1',
    student_id: 'student-1',
    is_anonymous: false,
    is_draft: false,
    title: 'Test Resolved Complaint',
    description: 'This is a test complaint',
    category: 'academic',
    priority: 'medium',
    status: 'resolved',
    assigned_to: 'lecturer-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    opened_at: '2024-01-01T01:00:00Z',
    opened_by: 'lecturer-1',
    resolved_at: '2024-01-02T00:00:00Z',
    escalated_at: null,
    escalation_level: 0,
  };

  it('should show reopen button for students on resolved complaints', () => {
    render(<ActionButtons complaint={mockResolvedComplaint} userRole="student" />);

    const reopenButton = screen.getByRole('button', { name: /reopen complaint/i });
    expect(reopenButton).toBeDefined();
  });

  it('should not show reopen button for non-resolved complaints', () => {
    const inProgressComplaint = { ...mockResolvedComplaint, status: 'in_progress' as const };

    render(<ActionButtons complaint={inProgressComplaint} userRole="student" />);

    const reopenButton = screen.queryByRole('button', { name: /reopen complaint/i });
    expect(reopenButton).toBeNull();
  });

  it('should open modal when reopen button is clicked', async () => {
    render(<ActionButtons complaint={mockResolvedComplaint} userRole="student" />);

    const reopenButton = screen.getByRole('button', { name: /reopen complaint/i });
    fireEvent.click(reopenButton);

    await waitFor(() => {
      expect(screen.getByText(/reopen complaint/i)).toBeDefined();
      expect(screen.getByText(/please provide a justification/i)).toBeDefined();
    });
  });

  it('should require justification to reopen complaint', async () => {
    const mockOnStatusChange = vi.fn();

    render(
      <ActionButtons
        complaint={mockResolvedComplaint}
        userRole="student"
        onStatusChange={mockOnStatusChange}
      />
    );

    // Open modal
    const reopenButton = screen.getByRole('button', { name: /reopen complaint/i });
    fireEvent.click(reopenButton);

    await waitFor(() => {
      expect(screen.getByText(/reopen complaint/i)).toBeDefined();
    });

    // Try to submit without justification
    const confirmButton = screen.getByRole('button', { name: /^reopen complaint$/i });

    // Button should be disabled when justification is empty
    expect(confirmButton).toHaveProperty('disabled', true);
  });

  it('should allow reopening with valid justification', async () => {
    const mockOnStatusChange = vi.fn();

    render(
      <ActionButtons
        complaint={mockResolvedComplaint}
        userRole="student"
        onStatusChange={mockOnStatusChange}
      />
    );

    // Open modal
    const reopenButton = screen.getByRole('button', { name: /reopen complaint/i });
    fireEvent.click(reopenButton);

    await waitFor(() => {
      expect(screen.getByText(/reopen complaint/i)).toBeDefined();
    });

    // Enter justification
    const textarea = screen.getByPlaceholderText(
      /explain why this complaint needs to be reopened/i
    );
    fireEvent.change(textarea, {
      target: { value: 'The issue has not been fully resolved and still persists.' },
    });

    // Submit
    const confirmButton = screen.getByRole('button', { name: /^reopen complaint$/i });
    expect(confirmButton).toHaveProperty('disabled', false);

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith('reopened');
    });
  });

  it('should show character count for justification', async () => {
    render(<ActionButtons complaint={mockResolvedComplaint} userRole="student" />);

    // Open modal
    const reopenButton = screen.getByRole('button', { name: /reopen complaint/i });
    fireEvent.click(reopenButton);

    await waitFor(() => {
      expect(screen.getByText(/0 characters/i)).toBeDefined();
    });

    // Enter text
    const textarea = screen.getByPlaceholderText(
      /explain why this complaint needs to be reopened/i
    );
    const testText = 'Test justification';
    fireEvent.change(textarea, { target: { value: testText } });

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`${testText.length} characters`, 'i'))).toBeDefined();
    });
  });

  it('should allow canceling reopen action', async () => {
    const mockOnStatusChange = vi.fn();

    render(
      <ActionButtons
        complaint={mockResolvedComplaint}
        userRole="student"
        onStatusChange={mockOnStatusChange}
      />
    );

    // Open modal
    const reopenButton = screen.getByRole('button', { name: /reopen complaint/i });
    fireEvent.click(reopenButton);

    await waitFor(() => {
      expect(screen.getByText(/reopen complaint/i)).toBeDefined();
    });

    // Enter justification
    const textarea = screen.getByPlaceholderText(
      /explain why this complaint needs to be reopened/i
    );
    fireEvent.change(textarea, {
      target: { value: 'Some justification' },
    });

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/please provide a justification/i)).toBeNull();
    });

    // Status change should not have been called
    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });

  it('should not show reopen button for lecturers', () => {
    render(<ActionButtons complaint={mockResolvedComplaint} userRole="lecturer" />);

    const reopenButton = screen.queryByRole('button', { name: /reopen complaint/i });
    expect(reopenButton).toBeNull();
  });
});
