/**
 * Test for useNotifications hook cleanup functionality
 *
 * This test verifies that the Realtime channel subscription is properly
 * cleaned up when the component unmounts to prevent memory leaks.
 */

import { renderHook, waitFor } from '@testing-library/react';
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
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    info: jest.fn(),
  }),
}));

describe('useNotifications - Cleanup', () => {
  let mockChannel: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create a mock channel with subscribe method
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn((callback) => {
        // Simulate successful subscription
        callback('SUBSCRIBED');
        return mockChannel;
      }),
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

  it('should unsubscribe from channel on unmount', async () => {
    // Render the hook
    const { unmount } = renderHook(() => useNotifications());

    // Wait for the subscription to be set up
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith('notifications-channel');
    });

    // Verify channel was created and subscribed
    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.subscribe).toHaveBeenCalled();

    // Unmount the component
    unmount();

    // Verify cleanup was called
    await waitFor(() => {
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });

  it('should handle cleanup when channel is null', () => {
    // Mock channel to return null
    (supabase.channel as jest.Mock).mockReturnValue(null);

    // Render and unmount
    const { unmount } = renderHook(() => useNotifications());
    unmount();

    // Should not throw error even if channel is null
    expect(supabase.removeChannel).not.toHaveBeenCalled();
  });

  it('should only set up subscription once', async () => {
    // Render the hook
    const { rerender } = renderHook(() => useNotifications());

    // Wait for initial subscription
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledTimes(1);
    });

    // Rerender multiple times
    rerender();
    rerender();
    rerender();

    // Should still only have one subscription (empty dependency array)
    expect(supabase.channel).toHaveBeenCalledTimes(1);
  });

  it('should clean up on unmount even after multiple rerenders', async () => {
    // Render the hook
    const { rerender, unmount } = renderHook(() => useNotifications());

    // Wait for subscription
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalled();
    });

    // Rerender multiple times
    rerender();
    rerender();

    // Unmount
    unmount();

    // Should clean up exactly once
    await waitFor(() => {
      expect(supabase.removeChannel).toHaveBeenCalledTimes(1);
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });

  it('should handle cleanup when subscription fails', async () => {
    // Mock subscription failure
    mockChannel.subscribe = jest.fn((callback) => {
      callback('CHANNEL_ERROR');
      return mockChannel;
    });

    // Render the hook
    const { unmount } = renderHook(() => useNotifications());

    // Wait for subscription attempt
    await waitFor(() => {
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    // Unmount
    unmount();

    // Should still attempt cleanup
    await waitFor(() => {
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });
});
