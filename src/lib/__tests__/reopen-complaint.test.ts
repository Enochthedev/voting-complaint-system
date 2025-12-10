/**
 * Tests for complaint reopen functionality
 *
 * These tests verify that the reopenComplaint function:
 * 1. Updates complaint status to "reopened"
 * 2. Logs the action in complaint_history with justification
 * 3. Creates notification for assigned lecturer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('reopenComplaint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update complaint status to reopened', async () => {
    const mockComplaint = {
      id: 'complaint-123',
      title: 'Test Complaint',
      status: 'reopened',
      assigned_to: 'lecturer-456',
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockComplaint,
              error: null,
            }),
          }),
        }),
      }),
    });

    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'complaints') {
        return { update: mockUpdate };
      }
      if (table === 'complaint_history' || table === 'notifications') {
        return { insert: mockInsert };
      }
      return {};
    });

    const { reopenComplaint } = await import('@/lib/api/complaints');

    const result = await reopenComplaint('complaint-123', 'Issue not resolved', 'user-789');

    expect(result).toEqual(mockComplaint);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('should log reopen action in complaint_history with justification', async () => {
    const mockComplaint = {
      id: 'complaint-123',
      title: 'Test Complaint',
      status: 'reopened',
      assigned_to: 'lecturer-456',
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockComplaint,
              error: null,
            }),
          }),
        }),
      }),
    });

    let historyInsertData: any = null;
    const mockInsert = vi.fn().mockImplementation((data: any) => {
      historyInsertData = data;
      return Promise.resolve({ error: null });
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'complaints') {
        return { update: mockUpdate };
      }
      if (table === 'complaint_history') {
        return { insert: mockInsert };
      }
      if (table === 'notifications') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {};
    });

    const { reopenComplaint } = await import('@/lib/api/complaints');

    await reopenComplaint('complaint-123', 'Issue not resolved', 'user-789');

    expect(mockInsert).toHaveBeenCalled();
    expect(historyInsertData).toMatchObject({
      complaint_id: 'complaint-123',
      action: 'reopened',
      old_value: 'resolved',
      new_value: 'reopened',
      performed_by: 'user-789',
      details: { justification: 'Issue not resolved' },
    });
  });

  it('should create notification for assigned lecturer', async () => {
    const mockComplaint = {
      id: 'complaint-123',
      title: 'Test Complaint',
      status: 'reopened',
      assigned_to: 'lecturer-456',
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockComplaint,
              error: null,
            }),
          }),
        }),
      }),
    });

    let notificationInsertData: any = null;
    const mockNotificationInsert = vi.fn().mockImplementation((data: any) => {
      notificationInsertData = data;
      return Promise.resolve({ error: null });
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'complaints') {
        return { update: mockUpdate };
      }
      if (table === 'complaint_history') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      if (table === 'notifications') {
        return { insert: mockNotificationInsert };
      }
      return {};
    });

    const { reopenComplaint } = await import('@/lib/api/complaints');

    await reopenComplaint('complaint-123', 'Issue not resolved', 'user-789');

    expect(mockNotificationInsert).toHaveBeenCalled();
    expect(notificationInsertData).toMatchObject({
      user_id: 'lecturer-456',
      type: 'complaint_reopened',
      title: 'Complaint Reopened',
      related_id: 'complaint-123',
      is_read: false,
    });
  });

  it('should only allow reopening resolved complaints', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'No rows found' },
            }),
          }),
        }),
      }),
    });

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'complaints') {
        return { update: mockUpdate };
      }
      return {};
    });

    const { reopenComplaint } = await import('@/lib/api/complaints');

    await expect(
      reopenComplaint('complaint-123', 'Issue not resolved', 'user-789')
    ).rejects.toThrow();
  });
});
