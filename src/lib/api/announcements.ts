import type { Announcement } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';

/**
 * Announcement API functions
 *
 * Connected to Supabase API (Phase 12).
 */

/**
 * Create a new announcement
 * @param announcementData - Partial announcement data (without id, created_at, updated_at)
 * @returns Created announcement
 */
async function createAnnouncementImpl(
  announcementData: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>
): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcementData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create announcement');
  }

  // Note: Announcement notifications are created automatically via database trigger
  // See: supabase/migrations/*_create_announcement_notification_trigger.sql

  return data;
}

export const createAnnouncement = withRateLimit(createAnnouncementImpl, 'write');

/**
 * Get all announcements (sorted by created_at descending)
 * @param options - Filter options
 * @returns Array of announcements
 */
async function getAnnouncementsImpl(options?: {
  limit?: number;
  createdBy?: string;
}): Promise<Announcement[]> {
  let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.createdBy) {
    query = query.eq('created_by', options.createdBy);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || 'Failed to fetch announcements');
  }

  return data || [];
}

export const getAnnouncements = withRateLimit(getAnnouncementsImpl, 'read');

/**
 * Get a single announcement by ID
 * @param announcementId - Announcement ID
 * @returns Announcement or null if not found
 */
async function getAnnouncementByIdImpl(announcementId: string): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', announcementId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to fetch announcement');
  }

  return data;
}

export const getAnnouncementById = withRateLimit(getAnnouncementByIdImpl, 'read');

/**
 * Update an announcement
 * @param announcementId - Announcement ID
 * @param updates - Partial announcement data to update
 * @returns Updated announcement
 */
async function updateAnnouncementImpl(
  announcementId: string,
  updates: Partial<Omit<Announcement, 'id' | 'created_at' | 'created_by'>>
): Promise<Announcement> {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', announcementId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update announcement');
  }

  return data;
}

export const updateAnnouncement = withRateLimit(updateAnnouncementImpl, 'write');

/**
 * Delete an announcement
 * @param announcementId - Announcement ID
 */
async function deleteAnnouncementImpl(announcementId: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', announcementId);

  if (error) {
    throw new Error(error.message || 'Failed to delete announcement');
  }
}

export const deleteAnnouncement = withRateLimit(deleteAnnouncementImpl, 'write');

/**
 * Get recent announcements (for dashboard display)
 * @param limit - Number of announcements to return (default: 5)
 * @returns Array of recent announcements
 */
async function getRecentAnnouncementsImpl(limit: number = 5): Promise<Announcement[]> {
  return getAnnouncementsImpl({ limit });
}

export const getRecentAnnouncements = withRateLimit(getRecentAnnouncementsImpl, 'read');
