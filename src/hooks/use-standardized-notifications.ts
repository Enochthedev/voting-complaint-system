/**
 * Standardized Notifications Hooks
 *
 * React hooks that use the standardized API layer with enhanced error handling,
 * real-time subscriptions, and consistent response formats.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import {
  fetchNotificationsStandardized,
  markNotificationAsReadStandardized,
  markAllNotificationsAsReadStandardized,
  getUnreadNotificationCountStandardized,
  notificationSubscriptionManager,
} from '@/lib/api/standardized-notifications';
import { useToast } from '@/components/ui/toast';
import { StandardizedErrorHandler } from '@/lib/api/standardization/error-handler';
import type {
  StandardApiResponse,
  PaginatedApiResponse,
} from '@/lib/api/standardization/types';
import { ErrorType } from '@/lib/api/standardization/types';
import type { Notification } from '@/types/database.types';

/**
 * Query Keys for Standardized Notifications
 */
export const standardizedNotificationKeys = {
  all: ['standardized-notifications'] as const,
  lists: () => [...standardizedNotificationKeys.all, 'list'] as const,
  recent: (limit: number, page: number) =>
    [...standardizedNotificationKeys.lists(), 'recent', limit, page] as const,
  unreadCount: () => [...standardizedNotificationKeys.all, 'unreadCount'] as const,
};

/**
 * Connection state for real-time subscriptions
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Hook to fetch notifications with standardized responses and pagination
 */
export function useStandardizedNotifications(options?: {
  limit?: number;
  page?: number;
  baseUrl?: string;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  const limit = options?.limit || 50;
  const page = options?.page || 1;

  // Base query for notifications
  const query = useQuery({
    queryKey: standardizedNotificationKeys.recent(limit, page),
    queryFn: () => fetchNotificationsStandardized(options),
    staleTime: 5 * 60 * 1000, // 5 minutes (longer since we have real-time updates)
    refetchInterval: connectionState === 'connected' ? false : 2 * 60 * 1000, // Only poll if real-time is disconnected
    select: (response: PaginatedApiResponse<Notification>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        data: response.data,
        meta: response.meta,
      };
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        setConnectionState('connecting');

        const subscriptionResponse = await notificationSubscriptionManager.subscribe(
          'standardized-notifications-channel',
          {
            onInsert: (notification) => {
              // Invalidate queries to refetch notifications
              queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });

              // Show toast for new notification
              toast.info(notification.title, 'New Notification');
            },
            onUpdate: (notification) => {
              // Invalidate queries to refetch notifications
              queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });
            },
            onDelete: (notificationId) => {
              // Invalidate queries to refetch notifications
              queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });
            },
            onError: (errorResponse) => {
              setConnectionState('error');
              if (errorResponse.error) {
                const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(
                  errorResponse.error
                );
                setError(new Error(errorMessage));

                // Only show toast for critical errors to avoid spam
                if (errorResponse.error.type === ErrorType.AUTHENTICATION) {
                  toast.error(errorMessage, 'Notification Subscription Error');
                }
              }
            },
          }
        );

        if (subscriptionResponse.error) {
          setConnectionState('error');
          const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(
            subscriptionResponse.error
          );
          setError(new Error(errorMessage));
        } else {
          setConnectionState('connected');
          setError(null);
        }
      } catch (err) {
        setConnectionState('error');
        const error =
          err instanceof Error ? err : new Error('Failed to set up real-time subscription');
        setError(error);
        console.error('Failed to set up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      notificationSubscriptionManager.unsubscribe('standardized-notifications-channel');
    };
  }, [queryClient, toast]);

  // Manual retry function
  const retryConnection = useCallback(async () => {
    try {
      setConnectionState('connecting');
      setError(null);

      // Unsubscribe first
      await notificationSubscriptionManager.unsubscribe('standardized-notifications-channel');

      // Re-subscribe
      const subscriptionResponse = await notificationSubscriptionManager.subscribe(
        'standardized-notifications-channel',
        {
          onInsert: (notification) => {
            queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });
            toast.info(notification.title, 'New Notification');
          },
          onUpdate: (notification) => {
            queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });
          },
          onDelete: (notificationId) => {
            queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });
          },
          onError: (errorResponse) => {
            setConnectionState('error');
            if (errorResponse.error) {
              const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(
                errorResponse.error
              );
              setError(new Error(errorMessage));
            }
          },
        }
      );

      if (subscriptionResponse.error) {
        setConnectionState('error');
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(
          subscriptionResponse.error
        );
        setError(new Error(errorMessage));
      } else {
        setConnectionState('connected');
        setError(null);
        toast.success('Real-time notifications reconnected', 'Connection Restored');
      }
    } catch (err) {
      setConnectionState('error');
      const error = err instanceof Error ? err : new Error('Failed to retry connection');
      setError(error);
      console.error('Failed to retry connection:', error);
    }
  }, [queryClient, toast]);

  return {
    ...query,
    connectionState,
    error,
    retryConnection,
  };
}

/**
 * Hook to mark a notification as read with standardized error handling
 */
export function useStandardizedMarkAsRead() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: markNotificationAsReadStandardized,
    onSuccess: (response: StandardApiResponse<null>) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Marking Notification');
        return;
      }

      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to mark notification as read. Please try again.';
      toast.error(errorMessage, 'Error Marking Notification');
      console.error('Mark as read error:', err);
    },
  });
}

/**
 * Hook to mark all notifications as read with standardized error handling
 */
export function useStandardizedMarkAllAsRead() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: markAllNotificationsAsReadStandardized,
    onSuccess: (response: StandardApiResponse<{ updated: number }>) => {
      if (response.error) {
        const errorMessage = StandardizedErrorHandler.getUserFriendlyMessage(response.error);
        toast.error(errorMessage, 'Error Marking All Notifications');
        return;
      }

      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: standardizedNotificationKeys.all });

      // Show success message with count and request ID
      const result = response.data;
      if (result && result.updated > 0) {
        toast.success(
          `Marked ${result.updated} notifications as read (ID: ${response.meta.requestId})`,
          'All Notifications Read'
        );
      }
    },
    onError: (err: any) => {
      const errorMessage =
        err?.message || 'Failed to mark all notifications as read. Please try again.';
      toast.error(errorMessage, 'Error Marking All Notifications');
      console.error('Mark all as read error:', err);
    },
  });
}

/**
 * Hook to get unread notification count with standardized responses and real-time updates
 */
export function useStandardizedUnreadNotificationCount() {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Base query for unread count
  const query = useQuery({
    queryKey: standardizedNotificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCountStandardized,
    staleTime: 2 * 60 * 1000, // 2 minutes (longer since we have real-time updates)
    refetchInterval: connectionState === 'connected' ? false : 60 * 1000, // Only poll if real-time is disconnected
    select: (response: StandardApiResponse<{ count: number }>) => {
      if (response.error) {
        throw new Error(StandardizedErrorHandler.getUserFriendlyMessage(response.error));
      }
      return {
        count: response.data?.count || 0,
        meta: response.meta,
      };
    },
  });

  // Set up real-time subscription for count updates
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        setConnectionState('connecting');

        const subscriptionResponse = await notificationSubscriptionManager.subscribe(
          'standardized-notifications-count-channel',
          {
            onInsert: (notification) => {
              // Invalidate unread count query
              queryClient.invalidateQueries({
                queryKey: standardizedNotificationKeys.unreadCount(),
              });
            },
            onUpdate: (notification) => {
              // Invalidate unread count query
              queryClient.invalidateQueries({
                queryKey: standardizedNotificationKeys.unreadCount(),
              });
            },
            onDelete: (notificationId) => {
              // Invalidate unread count query
              queryClient.invalidateQueries({
                queryKey: standardizedNotificationKeys.unreadCount(),
              });
            },
            onError: (errorResponse) => {
              setConnectionState('error');
              console.error('Notification count subscription error:', errorResponse);
            },
          }
        );

        if (subscriptionResponse.error) {
          setConnectionState('error');
        } else {
          setConnectionState('connected');
        }
      } catch (err) {
        setConnectionState('error');
        console.error('Failed to set up real-time count subscription:', err);
      }
    };

    setupRealtimeSubscription();

    // Cleanup on unmount
    return () => {
      notificationSubscriptionManager.unsubscribe('standardized-notifications-count-channel');
    };
  }, [queryClient]);

  return {
    ...query,
    connectionState,
  };
}

/**
 * Hook to get subscription status for monitoring
 */
export function useStandardizedNotificationSubscriptionStatus() {
  const [status, setStatus] = useState(() =>
    notificationSubscriptionManager.getSubscriptionStatus('standardized-notifications-channel')
  );

  useEffect(() => {
    // Check status periodically
    const interval = setInterval(() => {
      const currentStatus = notificationSubscriptionManager.getSubscriptionStatus(
        'standardized-notifications-channel'
      );
      setStatus(currentStatus);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return status;
}
