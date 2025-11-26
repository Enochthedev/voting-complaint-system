import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../use-notifications';
import { supabase } from '@/lib/supabase';
import * as notificationsApi from '@/lib/api/notifications';
import { useToast } from '@/components/ui/toast';

// Mock dependencies
jest.mock('@/lib/supabase');
jest.mock('@/lib/api/notifications');
jest.mock('@/components/ui/toast');

describe('useNotifications - Connection Error Handling', () => {
  const mockToast = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  };

  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
    (supabase.removeChannel as jest.Mock).mockResolvedValue({ status: 'ok', error: null });
    (notificationsApi.fetchNotifications as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
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
    jest.useFakeTimers();

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
      jest.advanceTimersByTime(1000);
    });

    // Verify retry was attempted
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });

  it('should handle CLOSED status and attempt reconnection', async () => {
    jest.useFakeTimers();

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
      jest.advanceTimersByTime(1000);
    });

    // Verify reconnection was attempted
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
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
    jest.useFakeTimers();

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
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(callCount).toBe(2);
    });

    // Second retry after 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(callCount).toBe(3);
    });

    // Third retry after 4 seconds
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    await waitFor(() => {
      expect(callCount).toBe(4);
    });

    jest.useRealTimers();
  });

  it('should stop retrying after max retries', async () => {
    jest.useFakeTimers();

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
        jest.advanceTimersByTime(Math.pow(2, i) * 1000);
      });

      await waitFor(() => {
        expect(callCount).toBe(i + 2);
      });
    }

    // Advance time further - should not retry anymore
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // Should still be at 6 total attempts (1 initial + 5 retries)
    expect(callCount).toBe(6);

    // Verify error toast was shown
    expect(mockToast.error).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should clean up channel and timeout on unmount', async () => {
    jest.useFakeTimers();

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
      jest.advanceTimersByTime(5000);
    });

    // Verify channel was removed
    expect(supabase.removeChannel).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('should handle authentication errors gracefully', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
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
