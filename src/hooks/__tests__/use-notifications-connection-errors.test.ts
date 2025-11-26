/**
 * Test for useNotifications hook connection error handling
 *
 * This test verifies that the hook properly handles connection errors,
 * implements retry logic with exponential backoff, and provides
 * manual retry functionality.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotifications } from '../use-notifications';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

// Mock the API functions
jest.mock('@/lib/api/notifications', () => ({
  fetchNotifications: jest.fn().mockResolvedValue([]),
  markNotificationAsRead: jest.fn().mockResolvedValue(undefined),
  markAllNotificationsAsRead: jest.fn().mockResolvedValue(undefined),
}));

// Mock the toast hook
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastInfo = jest.fn();

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    info: mockToastInfo,
    error: mockToastError,
    success: mockToastSuccess,
  }),
}));

describe('useNotifications - Connection Error Handling', () => {
  let mockChannel: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create a mock channel with subscribe method
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    };

    // Mock supabase.channel to return our mock channel
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should set connection state to error on CHANNEL_ERROR', async () => {
    // Mock subscription to fail
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for subscription attempt
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Should set error state
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('Failed to connect');
  });

  it('should set connection state to error on TIMED_OUT', async () => {
    // Mock subscription to timeout
    mockChannel.subscribe = jest.fn((callback) => {
      callback('TIMED_OUT');
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for subscription attempt
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Should set error state
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('timed out');
  });

  it('should set connection state to connected on SUBSCRIBED', async () => {
    // Mock successful subscription
    mockChannel.subscribe = jest.fn((callback) => {
      callback('SUBSCRIBED');
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for subscription
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Should clear error state
    expect(result.current.error).toBeNull();
  });

  it('should retry connection with exponential backoff on error', async () => {
    let attemptCount = 0;

    // Mock subscription to fail initially, then succeed
    mockChannel.subscribe = jest.fn((callback) => {
      attemptCount++;
      if (attemptCount === 1) {
        callback('CHANNEL_ERROR');
      } else {
        callback('SUBSCRIBED');
      }
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Fast-forward time to trigger retry (1 second for first retry)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for retry and success
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Should have attempted twice
    expect(mockChannel.subscribe).toHaveBeenCalledTimes(2);
  });

  it('should provide manual retry function', async () => {
    // Mock subscription to fail
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Clear the mock to track new calls
    mockChannel.subscribe.mockClear();

    // Mock successful retry
    mockChannel.subscribe = jest.fn((callback) => {
      callback('SUBSCRIBED');
      return mockChannel;
    });

    // Call manual retry
    act(() => {
      result.current.retryConnection();
    });

    // Wait for retry
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Should have retried
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should stop retrying after max retries', async () => {
    // Mock subscription to always fail
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    const initialCallCount = mockChannel.subscribe.mock.calls.length;

    // Fast-forward through all retry attempts (5 retries with exponential backoff)
    // 1s, 2s, 4s, 8s, 16s = 31s total
    act(() => {
      jest.advanceTimersByTime(35000);
    });

    // Wait a bit for any pending operations
    await waitFor(() => {
      expect(mockChannel.subscribe.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    // Should have stopped retrying (initial + 5 retries = 6 total)
    expect(mockChannel.subscribe.mock.calls.length).toBeLessThanOrEqual(6);
  });

  it('should show error toast after max retries', async () => {
    // Mock subscription to always fail
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Render the hook
    renderHook(() => useNotifications());

    // Fast-forward through all retry attempts
    act(() => {
      jest.advanceTimersByTime(35000);
    });

    // Wait for error toast
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it('should handle authentication errors gracefully', async () => {
    // Mock authentication failure
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for error state
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Should set appropriate error
    expect(result.current.error?.message).toContain('Authentication required');
  });

  it('should clean up retry timeout on unmount', async () => {
    // Mock subscription to fail
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Render the hook
    const { unmount } = renderHook(() => useNotifications());

    // Wait for initial failure
    await waitFor(() => {
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    // Unmount before retry
    unmount();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should not retry after unmount
    expect(mockChannel.subscribe).toHaveBeenCalledTimes(1);
  });

  it('should reset retry count on successful connection', async () => {
    let attemptCount = 0;

    // Mock subscription to fail once, then succeed
    mockChannel.subscribe = jest.fn((callback) => {
      attemptCount++;
      if (attemptCount === 1) {
        callback('CHANNEL_ERROR');
      } else {
        callback('SUBSCRIBED');
      }
      return mockChannel;
    });

    // Render the hook
    const { result } = renderHook(() => useNotifications());

    // Wait for initial failure
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });

    // Fast-forward to trigger retry
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for success
    await waitFor(() => {
      expect(result.current.connectionState).toBe('connected');
    });

    // Now simulate another failure
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Trigger manual retry
    act(() => {
      result.current.retryConnection();
    });

    // Should start from first retry delay (1s) not continue from previous count
    await waitFor(() => {
      expect(result.current.connectionState).toBe('error');
    });
  });
});
