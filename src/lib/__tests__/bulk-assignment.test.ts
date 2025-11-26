/**
 * Tests for bulk complaint assignment functionality
 *
 * These tests verify that the bulkAssignComplaints function:
 * 1. Assigns multiple complaints to a lecturer
 * 2. Logs each assignment in complaint_history
 * 3. Creates notifications for the assigned lecturer
 * 4. Handles errors gracefully and reports results
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getSupabaseClient: () => mockSupabase,
}));

describe('bulkAssignComplaints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should assign multiple complaints to a lecturer', async () => {
    const complaintIds = ['complaint-1', 'complaint-2', 'complaint-3'];
    const lecturerId = 'lecturer-456';
    const performedBy = 'admin-789';

    // Mock lecturer fetch
    const mockLecturerSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: lecturerId,
            full_name: 'Dr. Smith',
            email: 'smith@university.edu',
          },
          error: null,
        }),
      }),
    });

    // Mock complaint fetch
    const mockComplaintSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'complaint-1',
            title: 'Test Complaint',
            assigned_to: null,
          },
          error: null,
        }),
      }),
    });

    // Mock complaint update
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    // Mock history and notification inserts
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockLecturerSelect };
      }
      if (table === 'complaints') {
        if (callCount === 0) {
          callCount++;
          return { select: mockComplaintSelect };
        }
        return { update: mockUpdate };
      }
      if (table === 'complaint_history' || table === 'notifications') {
        return { insert: mockInsert };
      }
      return {};
    });

    const { bulkAssignComplaints } = await import('@/lib/api/complaints');

    const results = await bulkAssignComplaints(complaintIds, lecturerId, performedBy);

    expect(results.success).toBe(3);
    expect(results.failed).toBe(0);
    expect(results.errors).toHaveLength(0);
  });

  it('should log assignment in complaint_history for each complaint', async () => {
    const complaintIds = ['complaint-1'];
    const lecturerId = 'lecturer-456';
    const performedBy = 'admin-789';

    // Mock lecturer fetch
    const mockLecturerSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: lecturerId,
            full_name: 'Dr. Smith',
            email: 'smith@university.edu',
          },
          error: null,
        }),
      }),
    });

    // Mock complaint fetch
    const mockComplaintSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'complaint-1',
            title: 'Test Complaint',
            assigned_to: null,
          },
          error: null,
        }),
      }),
    });

    // Mock complaint update
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    let historyInsertData: any = null;
    const mockHistoryInsert = vi.fn().mockImplementation((data: any) => {
      historyInsertData = data;
      return Promise.resolve({ error: null });
    });

    const mockNotificationInsert = vi.fn().mockResolvedValue({ error: null });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockLecturerSelect };
      }
      if (table === 'complaints') {
        if (callCount === 0) {
          callCount++;
          return { select: mockComplaintSelect };
        }
        return { update: mockUpdate };
      }
      if (table === 'complaint_history') {
        return { insert: mockHistoryInsert };
      }
      if (table === 'notifications') {
        return { insert: mockNotificationInsert };
      }
      return {};
    });

    const { bulkAssignComplaints } = await import('@/lib/api/complaints');

    await bulkAssignComplaints(complaintIds, lecturerId, performedBy);

    expect(mockHistoryInsert).toHaveBeenCalled();
    expect(historyInsertData).toMatchObject({
      complaint_id: 'complaint-1',
      action: 'assigned',
      old_value: 'unassigned',
      new_value: lecturerId,
      performed_by: performedBy,
      details: {
        lecturer_name: 'Dr. Smith',
        bulk_action: true,
      },
    });
  });

  it('should create notification for assigned lecturer', async () => {
    const complaintIds = ['complaint-1'];
    const lecturerId = 'lecturer-456';
    const performedBy = 'admin-789';

    // Mock lecturer fetch
    const mockLecturerSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: lecturerId,
            full_name: 'Dr. Smith',
            email: 'smith@university.edu',
          },
          error: null,
        }),
      }),
    });

    // Mock complaint fetch
    const mockComplaintSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'complaint-1',
            title: 'Test Complaint',
            assigned_to: null,
          },
          error: null,
        }),
      }),
    });

    // Mock complaint update
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockHistoryInsert = vi.fn().mockResolvedValue({ error: null });

    let notificationInsertData: any = null;
    const mockNotificationInsert = vi.fn().mockImplementation((data: any) => {
      notificationInsertData = data;
      return Promise.resolve({ error: null });
    });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockLecturerSelect };
      }
      if (table === 'complaints') {
        if (callCount === 0) {
          callCount++;
          return { select: mockComplaintSelect };
        }
        return { update: mockUpdate };
      }
      if (table === 'complaint_history') {
        return { insert: mockHistoryInsert };
      }
      if (table === 'notifications') {
        return { insert: mockNotificationInsert };
      }
      return {};
    });

    const { bulkAssignComplaints } = await import('@/lib/api/complaints');

    await bulkAssignComplaints(complaintIds, lecturerId, performedBy);

    expect(mockNotificationInsert).toHaveBeenCalled();
    expect(notificationInsertData).toMatchObject({
      user_id: lecturerId,
      type: 'complaint_assigned',
      title: 'New Complaint Assigned',
      related_id: 'complaint-1',
      is_read: false,
    });
  });

  it('should handle errors gracefully and report results', async () => {
    const complaintIds = ['complaint-1', 'complaint-2', 'complaint-3'];
    const lecturerId = 'lecturer-456';
    const performedBy = 'admin-789';

    // Mock lecturer fetch
    const mockLecturerSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: lecturerId,
            full_name: 'Dr. Smith',
            email: 'smith@university.edu',
          },
          error: null,
        }),
      }),
    });

    let complaintFetchCount = 0;
    const mockComplaintSelect = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockImplementation(() => ({
        single: vi.fn().mockImplementation(() => {
          complaintFetchCount++;
          if (complaintFetchCount === 2) {
            // Second complaint fails
            return Promise.resolve({
              data: null,
              error: { message: 'Complaint not found' },
            });
          }
          return Promise.resolve({
            data: {
              id: `complaint-${complaintFetchCount}`,
              title: 'Test Complaint',
              assigned_to: null,
            },
            error: null,
          });
        }),
      })),
    }));

    // Mock complaint update
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    let callCount = 0;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockLecturerSelect };
      }
      if (table === 'complaints') {
        if (callCount < 3) {
          callCount++;
          return { select: mockComplaintSelect };
        }
        return { update: mockUpdate };
      }
      if (table === 'complaint_history' || table === 'notifications') {
        return { insert: mockInsert };
      }
      return {};
    });

    const { bulkAssignComplaints } = await import('@/lib/api/complaints');

    const results = await bulkAssignComplaints(complaintIds, lecturerId, performedBy);

    expect(results.success).toBe(2);
    expect(results.failed).toBe(1);
    expect(results.errors).toHaveLength(1);
    expect(results.errors[0]).toContain('complaint-2');
  });

  it('should throw error if no complaints selected', async () => {
    const { bulkAssignComplaints } = await import('@/lib/api/complaints');

    await expect(bulkAssignComplaints([], 'lecturer-456', 'admin-789')).rejects.toThrow(
      'No complaints selected for assignment'
    );
  });

  it('should throw error if invalid lecturer selected', async () => {
    const complaintIds = ['complaint-1'];
    const lecturerId = 'invalid-lecturer';
    const performedBy = 'admin-789';

    // Mock lecturer fetch with error
    const mockLecturerSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Lecturer not found' },
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockLecturerSelect };
      }
      return {};
    });

    const { bulkAssignComplaints } = await import('@/lib/api/complaints');

    await expect(bulkAssignComplaints(complaintIds, lecturerId, performedBy)).rejects.toThrow(
      'Invalid lecturer selected'
    );
  });
});
