/**
 * Standardized Notifications API
 *
 * This module provides standardized API responses for notification operations
 * with real-time subscription support and enhanced error handling.
 */

import { StandardApiResponse, PaginatedApiResponse, ErrorType } from './standardization/types';
import { createMigrationWrapper } from './standardization/migration-wrapper';
import { withMonitoring } from './standardization/monitoring-wrapper';
import * as legacyNotifications from './notifications';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/database.types';

// Create migration wrapper instance
const migrationWrapper = createMigrationWrapper();

/**
 * Standardized version of fetchNotifications with pagination support
 */
export const fetchNotificationsStandardized = withMonitoring(
  async (options?: {
    limit?: number;
    page?: number;
    baseUrl?: string;
  }): Promise<PaginatedApiResponse<Notification>> => {
    try {
      const limit = options?.limit || 50;
      const page = options?.page || 1;
      const offset = (page - 1) * limit;

      // Get user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Fetch notifications with pagination
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return migrationWrapper.createPaginatedResponse(data || [], {
        page,
        limit,
        total: count || 0,
        baseUrl: options?.baseUrl || '/api/notifications',
      });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({
        data: null,
        error,
      }) as PaginatedApiResponse<Notification>;
    }
  },
  {
    endpoint: '/api/notifications',
    method: 'GET',
    metadata: {
      category: 'notifications',
      tags: { standardized: true, paginated: true },
    },
  }
);

/**
 * Standardized version of markNotificationAsRead
 */
export const markNotificationAsReadStandardized = withMonitoring(
  async (notificationId: string): Promise<StandardApiResponse<null>> => {
    try {
      await legacyNotifications.markNotificationAsRead(notificationId);
      return migrationWrapper.wrapSupabaseResponse({ data: null, error: null });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/notifications/:id/read',
    method: 'PATCH',
    metadata: {
      category: 'notifications',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of markAllNotificationsAsRead
 */
export const markAllNotificationsAsReadStandardized = withMonitoring(
  async (): Promise<StandardApiResponse<{ updated: number }>> => {
    try {
      // Get user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Count unread notifications first
      const { count: unreadCount, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (countError) {
        throw countError;
      }

      // Mark all as read
      await legacyNotifications.markAllNotificationsAsRead();

      return migrationWrapper.wrapSupabaseResponse({
        data: { updated: unreadCount || 0 },
        error: null,
      });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/notifications/read-all',
    method: 'PATCH',
    metadata: {
      category: 'notifications',
      tags: { standardized: true, mutation: true },
    },
  }
);

/**
 * Standardized version of getUnreadNotificationCount
 */
export const getUnreadNotificationCountStandardized = withMonitoring(
  async (): Promise<StandardApiResponse<{ count: number }>> => {
    try {
      const count = await legacyNotifications.getUnreadNotificationCount();
      return migrationWrapper.wrapSupabaseResponse({
        data: { count },
        error: null,
      });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  },
  {
    endpoint: '/api/notifications/unread/count',
    method: 'GET',
    metadata: {
      category: 'notifications',
      tags: { standardized: true },
    },
  }
);

/**
 * Real-time notification subscription manager
 */
export class StandardizedNotificationSubscription {
  private subscriptions: Map<string, any> = new Map();

  /**
   * Subscribe to real-time notification updates with standardized error handling
   */
  async subscribe(
    channelName: string,
    callbacks: {
      onInsert?: (notification: Notification) => void;
      onUpdate?: (notification: Notification) => void;
      onDelete?: (notificationId: string) => void;
      onError?: (error: StandardApiResponse<null>) => void;
    }
  ): Promise<StandardApiResponse<{ subscribed: boolean; channelName: string }>> {
    try {
      // Get user for authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        const errorResponse = migrationWrapper.wrapSupabaseResponse({
          data: null,
          error: new Error('Not authenticated'),
        }) as any;
        callbacks.onError?.(errorResponse);
        return errorResponse;
      }

      // Create subscription
      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            callbacks.onInsert?.(payload.new as Notification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            callbacks.onUpdate?.(payload.new as Notification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            callbacks.onDelete?.(payload.old.id);
          }
        )
        .subscribe((status) => {
          if ((status as any) === 'SUBSCRIPTION_ERROR') {
            const errorResponse = migrationWrapper.wrapSupabaseResponse({
              data: null,
              error: new Error('Subscription failed'),
            }) as any;
            callbacks.onError?.(errorResponse);
          }
        });

      this.subscriptions.set(channelName, subscription);

      return migrationWrapper.wrapSupabaseResponse({
        data: { subscribed: true, channelName },
        error: null,
      });
    } catch (error) {
      const errorResponse = migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
      callbacks.onError?.(errorResponse);
      return errorResponse;
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribe(channelName: string): Promise<StandardApiResponse<{ unsubscribed: boolean }>> {
    try {
      const subscription = this.subscriptions.get(channelName);
      if (subscription) {
        await supabase.removeChannel(subscription);
        this.subscriptions.delete(channelName);
      }

      return migrationWrapper.wrapSupabaseResponse({
        data: { unsubscribed: true },
        error: null,
      });
    } catch (error) {
      return migrationWrapper.wrapSupabaseResponse({ data: null, error }) as any;
    }
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus(channelName: string): {
    isSubscribed: boolean;
    channelName?: string;
  } {
    return {
      isSubscribed: this.subscriptions.has(channelName),
      channelName: this.subscriptions.has(channelName) ? channelName : undefined,
    };
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup(): Promise<void> {
    for (const [channelName] of this.subscriptions) {
      await this.unsubscribe(channelName);
    }
  }
}

/**
 * Global instance of the notification subscription manager
 */
export const notificationSubscriptionManager = new StandardizedNotificationSubscription();
