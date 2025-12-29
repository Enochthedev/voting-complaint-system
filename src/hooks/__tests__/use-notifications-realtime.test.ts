import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/lib/__tests__/test-utils';
import { useNotifications } from '../use-notifications';
import { realtimeManager } from '@/lib/realtime-manager';

// Mock the realtime manager
vi.mock('@/lib/realtime-manager', () => ({
  realtimeManager: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    onConnectionStateChange: vi.fn(),
    retryConnection: vi.fn(),
  },
}));

// Mock the API
vi.mock('@/lib/api/notifications', () => ({
  fetchNotifications: vi.fn().mockResolvedValue([]),
}));

// Mock the toast
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: {
      error: vi.fn(),
      success: vi.fn(),
    },
  }),
}));

describe('useNotifications - Real-time Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the connection state listener to return a cleanup function
    (realtimeManager.onConnectionStateChange as any).mockReturnValue(() => {});

    // Mock successful subscription
    (realtimeManager.subscribe as any).mockResolvedValue({});
  });

  it('should set up real-time subscription on mount', async () => {
    renderHook(() => useNotifications());

    await waitFor(() => {
      expect(realtimeManager.onConnectionStateChange).toHaveBeenCalled();
      expect(realtimeManager.subscribe).toHaveBeenCalledWith({
        channelName: 'notifications-channel',
        event: '*',
        schema: 'public',
        table: 'notifications',
        onInsert: expect.any(Function),
        onUpdate: expect.any(Function),
        onDelete: expect.any(Function),
        onError: expect.any(Function),
      });
    });
  });

  it('should clean up subscription on unmount', async () => {
    const { unmount } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(realtimeManager.subscribe).toHaveBeenCalled();
    });

    unmount();

    expect(realtimeManager.unsubscribe).toHaveBeenCalledWith('notifications-channel');
  });

  it('should provide retry connection function', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(typeof result.current.retryConnection).toBe('function');
    });

    // Test retry function
    result.current.retryConnection();

    expect(realtimeManager.retryConnection).toHaveBeenCalledWith(
      'notifications-channel',
      expect.objectContaining({
        channelName: 'notifications-channel',
      })
    );
  });

  it('should expose connection state', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.connectionState).toBeDefined();
    });
  });
});
