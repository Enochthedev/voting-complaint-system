/**
 * Tests for CSV Export Utility
 * Validates: Requirements AC20 (Export Functionality)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Complaint, ComplaintTag } from '@/types/database.types';

// Mock the CSV export functions
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

describe('CSV Export Utility', () => {
  beforeEach(() => {
    // Setup DOM mocks
    mockCreateElement.mockReturnValue({
      setAttribute: vi.fn(),
      click: mockClick,
      style: {},
    });

    global.document = {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    } as any;

    global.URL = {
      createObjectURL: mockCreateObjectURL.mockReturnValue('blob:mock-url'),
      revokeObjectURL: mockRevokeObjectURL,
    } as any;

    global.Blob = vi.fn() as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should export complaints to CSV format', async () => {
    const { exportComplaintsToCSV } = await import('../csv-export');

    const mockComplaints = [
      {
        id: '1',
        title: 'Test Complaint',
        status: 'new',
        priority: 'high',
        category: 'facilities',
        student_id: 'student-1',
        is_anonymous: false,
        is_draft: false,
        description: '<p>Test description</p>',
        assigned_to: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        opened_at: null,
        opened_by: null,
        resolved_at: null,
        escalated_at: null,
        escalation_level: 0,
        student: {
          id: 'student-1',
          full_name: 'John Doe',
          email: 'john@example.com',
        },
        tags: [
          { id: 't1', complaint_id: '1', tag_name: 'urgent', created_at: '2024-01-01T10:00:00Z' },
        ],
      },
    ] as any;

    exportComplaintsToCSV(mockComplaints, 'test.csv');

    // Verify Blob was created with CSV content
    expect(global.Blob).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining('ID,Title,Status')]),
      { type: 'text/csv;charset=utf-8;' }
    );

    // Verify download link was created and clicked
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it('should handle empty complaints list', async () => {
    const { exportComplaintsToCSV } = await import('../csv-export');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    exportComplaintsToCSV([]);

    expect(consoleSpy).toHaveBeenCalledWith('No complaints to export');
    expect(mockCreateElement).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should escape CSV special characters', async () => {
    const { exportComplaintsToCSV } = await import('../csv-export');

    const mockComplaints = [
      {
        id: '1',
        title: 'Test "Quote" Complaint, with comma',
        status: 'new',
        priority: 'high',
        category: 'facilities',
        student_id: 'student-1',
        is_anonymous: false,
        is_draft: false,
        description: '<p>Description with "quotes" and, commas</p>',
        assigned_to: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        opened_at: null,
        opened_by: null,
        resolved_at: null,
        escalated_at: null,
        escalation_level: 0,
        tags: [],
      },
    ] as any;

    exportComplaintsToCSV(mockComplaints);

    // Verify Blob contains properly escaped content
    const blobCall = (global.Blob as any).mock.calls[0];
    const csvContent = blobCall[0][0];

    // Should contain escaped quotes and wrapped in quotes
    expect(csvContent).toContain('""Quote""');
  });

  it('should strip HTML tags from description', async () => {
    const { exportComplaintsToCSV } = await import('../csv-export');

    const mockComplaints = [
      {
        id: '1',
        title: 'Test Complaint',
        status: 'new',
        priority: 'high',
        category: 'facilities',
        student_id: 'student-1',
        is_anonymous: false,
        is_draft: false,
        description: '<p>Test <strong>description</strong> with <em>HTML</em></p>',
        assigned_to: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        opened_at: null,
        opened_by: null,
        resolved_at: null,
        escalated_at: null,
        escalation_level: 0,
        tags: [],
      },
    ] as any;

    exportComplaintsToCSV(mockComplaints);

    const blobCall = (global.Blob as any).mock.calls[0];
    const csvContent = blobCall[0][0];

    // Should not contain HTML tags
    expect(csvContent).not.toContain('<p>');
    expect(csvContent).not.toContain('<strong>');
    expect(csvContent).toContain('Test description with HTML');
  });

  it('should handle anonymous complaints', async () => {
    const { exportComplaintsToCSV } = await import('../csv-export');

    const mockComplaints = [
      {
        id: '1',
        title: 'Anonymous Complaint',
        status: 'new',
        priority: 'high',
        category: 'facilities',
        student_id: null,
        is_anonymous: true,
        is_draft: false,
        description: '<p>Test description</p>',
        assigned_to: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        opened_at: null,
        opened_by: null,
        resolved_at: null,
        escalated_at: null,
        escalation_level: 0,
        tags: [],
      },
    ] as any;

    exportComplaintsToCSV(mockComplaints);

    const blobCall = (global.Blob as any).mock.calls[0];
    const csvContent = blobCall[0][0];

    expect(csvContent).toContain('Anonymous');
  });

  it('should include tags in export', async () => {
    const { exportComplaintsToCSV } = await import('../csv-export');

    const mockComplaints = [
      {
        id: '1',
        title: 'Test Complaint',
        status: 'new',
        priority: 'high',
        category: 'facilities',
        student_id: 'student-1',
        is_anonymous: false,
        is_draft: false,
        description: '<p>Test description</p>',
        assigned_to: null,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        opened_at: null,
        opened_by: null,
        resolved_at: null,
        escalated_at: null,
        escalation_level: 0,
        tags: [
          { id: 't1', complaint_id: '1', tag_name: 'urgent', created_at: '2024-01-01T10:00:00Z' },
          {
            id: 't2',
            complaint_id: '1',
            tag_name: 'facilities',
            created_at: '2024-01-01T10:00:00Z',
          },
        ],
      },
    ] as any;

    exportComplaintsToCSV(mockComplaints);

    const blobCall = (global.Blob as any).mock.calls[0];
    const csvContent = blobCall[0][0];

    // Tags should be joined with semicolons
    expect(csvContent).toContain('urgent; facilities');
  });
});
