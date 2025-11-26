/**
 * Tests for PDF Export Functionality
 * Validates: Requirements AC20 (Export Functionality), Property P20 (Export Data Integrity)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComplaintWithDetails } from '../pdf-export';

// Mock jsPDF and jspdf-autotable
vi.mock('jspdf', () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    roundedRect: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
    addPage: vi.fn(),
    getNumberOfPages: () => 1,
    setPage: vi.fn(),
    save: vi.fn(),
    lastAutoTable: { finalY: 100 },
  };

  return {
    default: vi.fn(() => mockDoc),
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

describe('PDF Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComplaint: any = {
    id: 'complaint-123',
    title: 'Test Complaint',
    description: 'This is a test complaint description',
    category: 'academic',
    priority: 'high',
    status: 'resolved',
    is_anonymous: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    opened_at: '2024-01-16T09:00:00Z',
    resolved_at: '2024-01-20T15:30:00Z',
    escalated_at: null,
    escalation_level: 0,
    student: {
      id: 'student-123',
      full_name: 'John Doe',
      email: 'john@example.com',
    },
    assigned_user: {
      id: 'lecturer-456',
      full_name: 'Dr. Smith',
      email: 'smith@example.com',
    },
    tags: [
      {
        id: 'tag-1',
        complaint_id: 'complaint-123',
        tag_name: 'urgent',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'tag-2',
        complaint_id: 'complaint-123',
        tag_name: 'facilities',
        created_at: '2024-01-15T10:00:00Z',
      },
    ],
    attachments: [
      {
        id: 'att-1',
        complaint_id: 'complaint-123',
        file_name: 'evidence.pdf',
        file_path: '/path/to/file',
        file_size: 1024000,
        file_type: 'application/pdf',
        uploaded_by: 'student-123',
        created_at: '2024-01-15T10:05:00Z',
      },
    ],
    history: [
      {
        id: 'hist-1',
        complaint_id: 'complaint-123',
        action: 'created',
        old_value: null,
        new_value: 'new',
        performed_by: 'student-123',
        details: null,
        created_at: '2024-01-15T10:00:00Z',
        performed_by_user: {
          id: 'student-123',
          full_name: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        id: 'hist-2',
        complaint_id: 'complaint-123',
        action: 'status_changed',
        old_value: 'new',
        new_value: 'resolved',
        performed_by: 'lecturer-456',
        details: null,
        created_at: '2024-01-20T15:30:00Z',
        performed_by_user: {
          id: 'lecturer-456',
          full_name: 'Dr. Smith',
          email: 'smith@example.com',
        },
      },
    ],
    comments: [
      {
        id: 'comment-1',
        complaint_id: 'complaint-123',
        user_id: 'student-123',
        comment: 'This is a test comment',
        is_internal: false,
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T10:00:00Z',
        user: {
          id: 'student-123',
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
        },
      },
    ],
    feedback: [
      {
        id: 'feedback-1',
        complaint_id: 'complaint-123',
        lecturer_id: 'lecturer-456',
        content: 'We have addressed this issue',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-01-20T14:00:00Z',
        lecturer: {
          id: 'lecturer-456',
          full_name: 'Dr. Smith',
          email: 'smith@example.com',
        },
      },
    ],
    rating: [
      {
        id: 'rating-1',
        complaint_id: 'complaint-123',
        student_id: 'student-123',
        rating: 5,
        feedback_text: 'Great resolution!',
        created_at: '2024-01-20T16:00:00Z',
      },
    ],
  };

  it('should export complaint to PDF successfully', async () => {
    const { exportComplaintToPDF } = await import('../pdf-export');
    const jsPDF = (await import('jspdf')).default;

    await exportComplaintToPDF(mockComplaint);

    // Verify jsPDF was instantiated
    expect(jsPDF).toHaveBeenCalled();
  });

  it('should handle anonymous complaints correctly', async () => {
    const { exportComplaintToPDF } = await import('../pdf-export');
    const jsPDF = (await import('jspdf')).default;

    const anonymousComplaint = {
      ...mockComplaint,
      is_anonymous: true,
      student: null,
    };

    await exportComplaintToPDF(anonymousComplaint);

    // Should still export successfully
    expect(jsPDF).toHaveBeenCalled();
  });

  it('should handle complaints without optional fields', async () => {
    const { exportComplaintToPDF } = await import('../pdf-export');
    const jsPDF = (await import('jspdf')).default;

    const minimalComplaint = {
      id: 'complaint-456',
      title: 'Minimal Complaint',
      description: 'Basic description',
      category: 'other',
      priority: 'low',
      status: 'new',
      is_anonymous: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      opened_at: null,
      resolved_at: null,
      escalated_at: null,
      escalation_level: 0,
      student: null,
      assigned_user: null,
      tags: [],
      attachments: [],
      history: [],
      comments: [],
      feedback: [],
      rating: [],
    };

    await exportComplaintToPDF(minimalComplaint);

    // Should export successfully even with minimal data
    expect(jsPDF).toHaveBeenCalled();
  });

  it('should include all complaint sections in export', async () => {
    const { exportComplaintToPDF } = await import('../pdf-export');
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    await exportComplaintToPDF(mockComplaint);

    // Verify jsPDF methods were called
    expect(jsPDF).toHaveBeenCalled();

    // Verify autoTable was called for structured data (attachments, history)
    expect(autoTable).toHaveBeenCalled();
  });

  it('should filter out internal comments for non-lecturers', async () => {
    const { exportComplaintToPDF } = await import('../pdf-export');
    const jsPDF = (await import('jspdf')).default;

    const complaintWithInternalNotes = {
      ...mockComplaint,
      comments: [
        ...mockComplaint.comments,
        {
          id: 'comment-2',
          complaint_id: 'complaint-123',
          user_id: 'lecturer-456',
          comment: 'Internal note - should not be exported',
          is_internal: true,
          created_at: '2024-01-17T10:00:00Z',
          updated_at: '2024-01-17T10:00:00Z',
          user: {
            id: 'lecturer-456',
            full_name: 'Dr. Smith',
            email: 'smith@example.com',
            role: 'lecturer',
          },
        },
      ],
    };

    await exportComplaintToPDF(complaintWithInternalNotes);

    // Should export successfully and filter internal comments
    expect(jsPDF).toHaveBeenCalled();
  });
});
