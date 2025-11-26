/**
 * Notifications API
 *
 * Handles all notification-related operations including:
 * - Fetching notifications
 * - Marking notifications as read
 * - Marking all notifications as read
 *
 * Connected to Supabase API (Phase 12).
 */

import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/database.types';

/**
 * Fetch notifications for the current user
 *
 * @param limit - Maximum number of notifications to fetch (default: 50)
 * @returns Array of notifications ordered by creation date (newest first)
 */
export async function fetchNotifications(limit: number = 50): Promise<Notification[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return data || [];
}

/**
 * Mark a single notification as read
 *
 * @param notificationId - ID of the notification to mark as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id); // Ensure user can only update their own notifications

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark all unread notifications as read for the current user
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false); // Only update unread notifications

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }
}

/**
 * Get count of unread notifications for the current user
 *
 * @returns Number of unread notifications
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count || 0;
}
