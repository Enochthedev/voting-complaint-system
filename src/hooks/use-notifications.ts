'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/lib/api/notifications';
import { realtimeManager, ConnectionState } from '@/lib/realtime-manager';
import { useToast } from '@/components/ui/toast';
import {
  useMonitoredQuery,
  useMonitoredMutation,
  useMonitoredConnection,
  useMonitoredHookUsage,
} from './use-monitored-hooks';

/**
 * Query Keys for Notifications
 */
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  recent: (limit: number) => [...notificationKeys.lists(), 'recent', limit] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

/**
 * Hook to fetch notifications with real-time updates
 */
export function useNotifications(limit?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  useMonitoredHookUsage('useNotifications', { limit });
  useMonitoredConnection(connectionState, 'notifications-realtime', 'realtime');

  // Base query for notifications
  const queryResult = useQuery({
    queryKey: limit ? notificationKeys.recent(limit) : notificationKeys.lists(),
    queryFn: () => fetchNotifications(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes (longer since we have real-time updates)
    refetchInterval: connectionState === 'connected' ? false : 2 * 60 * 1000, // Only poll if real-time is disconnected
  });

  const monitoredQuery = useMonitoredQuery(queryResult, 'fetchNotifications', 'notifications', {
    limit,
  });

  // Set up real-time subscription
  useEffect(() => {
    let unsubscribeStateListener: (() => void) | undefined;

    const setupRealtimeSubscription = async () => {
      try {
        // Listen to connection state changes
        unsubscribeStateListener = realtimeManager.onConnectionStateChange((state, err) => {
          setConnectionState(state);
          setError(err || null);

          if (state === 'error' && err) {
            console.error('Real-time connection error:', err);
            // Don't show toast for every error to avoid spam
            if (err.message.includes('Max retries')) {
              toast.error('Real-time notifications unavailable. Using polling fallback.');
            }
          }
        });

        // Subscribe to notifications channel
        await realtimeManager.subscribe({
          channelName: 'notifications-channel',
          event: '*',
          schema: 'public',
          table: 'notifications',
          onInsert: (payload) => {
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          },
          onUpdate: (payload) => {
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          },
          onDelete: (payload) => {
            // Invalidate queries to refetch notifications
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          },
          onError: (err) => {
            setError(err);
            console.error('Notification subscription error:', err);
          },
        });
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to set up real-time subscription');
        setError(error);
        console.error('Failed to set up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      unsubscribeStateListener?.();
      realtimeManager.unsubscribe('notifications-channel');
    };
  }, [queryClient, toast]);

  // Manual retry function
  const retryConnection = useCallback(async () => {
    try {
      await realtimeManager.retryConnection('notifications-channel', {
        channelName: 'notifications-channel',
        event: '*',
        schema: 'public',
        table: 'notifications',
        onInsert: (payload) => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onUpdate: (payload) => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onDelete: (payload) => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
        onError: (err) => {
          setError(err);
          console.error('Notification subscription error:', err);
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to retry connection');
      setError(error);
      console.error('Failed to retry connection:', error);
    }
  }, [queryClient]);

  return {
    ...monitoredQuery,
    connectionState,
    error,
    retryConnection,
  };
}

/**
 * Hook to mark a notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  useMonitoredHookUsage('useMarkAsRead');

  const mutationResult = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  return useMonitoredMutation(mutationResult, 'markNotificationAsRead', 'notifications');
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Hook to get unread notification count with real-time updates
 */
export function useUnreadNotificationCount() {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Base query for unread count
  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    staleTime: 2 * 60 * 1000, // 2 minutes (longer since we have real-time updates)
    refetchInterval: connectionState === 'connected' ? false : 60 * 1000, // Only poll if real-time is disconnected
  });

  // Set up real-time subscription for count updates
  useEffect(() => {
    let unsubscribeStateListener: (() => void) | undefined;

    const setupRealtimeSubscription = async () => {
      try {
        // Listen to connection state changes
        unsubscribeStateListener = realtimeManager.onConnectionStateChange((state) => {
          setConnectionState(state);
        });

        // Subscribe to notifications channel for count updates
        await realtimeManager.subscribe({
          channelName: 'notifications-count-channel',
          event: '*',
          schema: 'public',
          table: 'notifications',
          onInsert: (payload) => {
            // Invalidate unread count query
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
          },
          onUpdate: (payload) => {
            // Invalidate unread count query
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
          },
          onDelete: (payload) => {
            // Invalidate unread count query
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
          },
          onError: (err) => {
            console.error('Notification count subscription error:', err);
          },
        });
      } catch (err) {
        console.error('Failed to set up real-time count subscription:', err);
      }
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      unsubscribeStateListener?.();
      realtimeManager.unsubscribe('notifications-count-channel');
    };
  }, [queryClient]);

  return {
    ...query,
    connectionState,
  };
}
