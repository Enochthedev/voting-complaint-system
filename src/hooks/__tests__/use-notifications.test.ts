import { act, waitFor } from '@testing-library/react';
import { renderHook } from '@/lib/__tests__/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useNotifications } from '../use-notifications';
import { supabase } from '@/lib/supabase';
import * as notificationsApi from '@/lib/api/notifications';
import { useToast } from '@/components/ui/toast';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));
vi.mock('@/lib/api/notifications');
vi.mock('@/components/ui/toast');
vi.mock('@/lib/realtime-manager', () => ({
  realtimeManager: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    onConnectionStateChange: vi.fn(),
    retryConnection: vi.fn(),
  },
}));

describe('useNotifications - Connection Error Handling', () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: mockToast });
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });
    (supabase.channel as any).mockReturnValue(mockChannel);
    (supabase.removeChannel as any).mockResolvedValue({ status: 'ok', error: null });
    (notificationsApi.fetchNotifications as any).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle CHANNEL_ERROR status and show error toast', async () => {
    // Setup: Make subscribe call the callback with CHANNEL_ERROR
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      setTimeout(() => callback('CHANNEL_ERROR'), 0);
      return mockChannel;
    });

    const { result } = renderHook(() => useNotifications());

    // Wait for the subscription to be set up and error to occur
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('Failed to connect');
  });

  it('should handle TIMED_OUT status and attempt retry', async () => {
    vi.useFakeTimers();

    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      setTimeout(() => callback('TIMED_OUT'), 0);
      return mockChannel;
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    expect(result.current.error?.message).toContain('timed out');

    // Fast-forward time to trigger retry
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Verify retry was attempted
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });

  it('should handle CLOSED status and attempt reconnection', async () => {
    vi.useFakeTimers();

    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      setTimeout(() => callback('CLOSED'), 0);
      return mockChannel;
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.connectionState).toBe('disconnected');
    });

    // Fast-forward time to trigger reconnection
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Verify reconnection was attempted
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });

  it('should successfully connect and reset retry count', async () => {
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      setTimeout(() => callback('SUBSCRIBED'), 0);
      return mockChannel;
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    expect(result.current.error).toBeNull();
  });

  it('should allow manual retry via retryConnection', async () => {
    // First connection fails
    mockChannel.subscribe.mockImplementationOnce((callback: (status: string) => void) => {
      setTimeout(() => callback('CHANNEL_ERROR'), 0);
      return mockChannel;
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Setup successful connection for retry
    mockChannel.subscribe.mockImplementationOnce((callback: (status: string) => void) => {
      setTimeout(() => callback('SUBSCRIBED'), 0);
      return mockChannel;
    });

    // Manually retry
    act(() => {
      result.current.retryConnection();
    });

    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    expect(result.current.error).toBeNull();
  });

  it('should use exponential backoff for retries', async () => {
    vi.useFakeTimers();

    let callCount = 0;
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      callCount++;
      setTimeout(() => callback('CHANNEL_ERROR'), 0);
      return mockChannel;
    });

    renderHook(() => useNotifications());

    // Wait for initial connection attempt
    await waitFor(() => {
      expect(callCount).toBe(1);
    });

    // First retry after 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(callCount).toBe(2);
    });

    // Second retry after 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(callCount).toBe(3);
    });

    // Third retry after 4 seconds
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(callCount).toBe(4);
    });

    vi.useRealTimers();
  });

  it('should stop retrying after max retries', async () => {
    vi.useFakeTimers();

    let callCount = 0;
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      callCount++;
      setTimeout(() => callback('CHANNEL_ERROR'), 0);
      return mockChannel;
    });

    renderHook(() => useNotifications());

    // Wait for initial connection attempt
    await waitFor(() => {
      expect(callCount).toBe(1);
    });

    // Advance through all retries (5 retries max)
    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(Math.pow(2, i) * 1000);
      });

      await waitFor(() => {
        expect(callCount).toBe(i + 2);
      });
    }

    // Advance time further - should not retry anymore
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Should still be at 6 total attempts (1 initial + 5 retries)
    expect(callCount).toBe(6);

    // Verify error toast was shown
    expect(mockToast.error).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should clean up channel and timeout on unmount', async () => {
    vi.useFakeTimers();

    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      setTimeout(() => callback('CHANNEL_ERROR'), 0);
      return mockChannel;
    });

    const { unmount } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalled();
    });

    // Unmount before retry timeout
    unmount();

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Verify channel was removed
    expect(supabase.removeChannel).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should handle authentication errors gracefully', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    expect(result.current.error?.message).toContain('Authentication required');
  });
});
