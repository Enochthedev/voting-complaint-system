import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';
import { withTokenRefresh } from '@/lib/api-wrapper';
import type { ComplaintRating } from '@/types/database.types';

/**
 * Fetch complaints for the current user
 * Optimized: Only select necessary columns for list view
 */
async function getUserComplaintsImpl(userId: string) {
  console.log('getUserComplaints called with userId:', userId);

  return withTokenRefresh(async () => {
    // Using singleton supabase client
    const { data, error } = await supabase
      .from('complaints')
      .select(
        `
        id,
        title,
        description,
        status,
        priority,
        category,
        is_anonymous,
        created_at,
        updated_at,
        assigned_to,
        assigned_user:users!complaints_assigned_to_fkey(id, full_name)
      `
      )
      .eq('student_id', userId)
      .eq('is_draft', false)
      .order('created_at', { ascending: false });

    console.log('getUserComplaints result:', { data, error });
    if (error) throw error;
    return data;
  });
}

export const getUserComplaints = withRateLimit(getUserComplaintsImpl, 'read');

/**
 * Fetch draft complaints for the current user
 * Optimized: Only select necessary columns for draft list view
 */
async function getUserDraftsImpl(userId: string) {
  console.log('getUserDrafts called with userId:', userId);

  // Using singleton supabase client
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `
      id,
      title,
      description,
      category,
      priority,
      created_at,
      updated_at
    `
    )
    .eq('student_id', userId)
    .eq('is_draft', true)
    .order('updated_at', { ascending: false });

  console.log('getUserDrafts result:', { data, error });
  if (error) throw error;
  return data;
}

export const getUserDrafts = withRateLimit(getUserDraftsImpl, 'read');

/**
 * Get complaint statistics for a user
 * Optimized: Use database aggregation instead of client-side filtering
 */
async function getUserComplaintStatsImpl(userId: string) {
  console.log('getUserComplaintStats called with userId:', userId);

  // Using singleton supabase client

  // Use Promise.all to run all count queries in parallel
  const [totalResult, newResult, openResult, inProgressResult, resolvedResult, closedResult] =
    await Promise.all([
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('is_draft', false),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('is_draft', false)
        .eq('status', 'new'),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('is_draft', false)
        .eq('status', 'opened'),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('is_draft', false)
        .eq('status', 'in_progress'),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('is_draft', false)
        .eq('status', 'resolved'),
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('is_draft', false)
        .eq('status', 'closed'),
    ]);

  // Check for errors
  if (totalResult.error) throw totalResult.error;
  if (newResult.error) throw newResult.error;
  if (openResult.error) throw openResult.error;
  if (inProgressResult.error) throw inProgressResult.error;
  if (resolvedResult.error) throw resolvedResult.error;
  if (closedResult.error) throw closedResult.error;

  const stats = {
    total: totalResult.count || 0,
    new: newResult.count || 0,
    opened: openResult.count || 0,
    in_progress: inProgressResult.count || 0,
    resolved: resolvedResult.count || 0,
    closed: closedResult.count || 0,
  };

  console.log('getUserComplaintStats stats:', stats);
  return stats;
}

export const getUserComplaintStats = withRateLimit(getUserComplaintStatsImpl, 'read');

/**
 * Fetch all complaints (for lecturers/admins)
 */
async function getAllComplaintsImpl() {
  // Using singleton supabase client
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `
      *,
      student:users!complaints_student_id_fkey(id, full_name, email),
      assigned_user:users!complaints_assigned_to_fkey(id, full_name, email)
    `
    )
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export const getAllComplaints = withRateLimit(getAllComplaintsImpl, 'read');

/**
 * Fetch a single complaint by ID
 */
async function getComplaintByIdImpl(id: string) {
  // Using singleton supabase client
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `
      *,
      student:users!complaints_student_id_fkey(id, full_name, email),
      assigned_user:users!complaints_assigned_to_fkey(id, full_name, email),
      tags:complaint_tags(tag_name),
      comments:complaint_comments(
        id,
        comment,
        is_internal,
        created_at,
        user:users(id, full_name, email, role)
      ),
      attachments:complaint_attachments(
        id,
        file_name,
        file_path,
        file_size,
        file_type,
        created_at
      ),
      history:complaint_history(
        id,
        action,
        old_value,
        new_value,
        created_at,
        performed_by_user:users!complaint_history_performed_by_fkey(id, full_name, email)
      ),
      feedback:feedback(
        id,
        content,
        created_at,
        lecturer:users!feedback_lecturer_id_fkey(id, full_name, email)
      ),
      rating:complaint_ratings(
        id,
        rating,
        feedback_text,
        created_at
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export const getComplaintById = withRateLimit(getComplaintByIdImpl, 'read');

/**
 * Create a new complaint
 */
async function createComplaintImpl(complaint: any) {
  console.log('📝 Creating complaint:', complaint);

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log('🔐 Session check for complaint creation:', session ? 'exists' : 'null');

  if (!session) {
    throw new Error('User not authenticated');
  }

  // Using singleton supabase client
  const { data, error } = await supabase.from('complaints').insert(complaint).select().single();

  if (error) {
    console.error('❌ Error creating complaint:', error);
    throw error;
  }

  console.log('✅ Complaint created successfully:', data);
  return data;
}

export const createComplaint = withRateLimit(createComplaintImpl, 'write');

/**
 * Update a complaint
 */
async function updateComplaintImpl(id: string, updates: unknown) {
  // Using singleton supabase client
  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const updateComplaint = withRateLimit(updateComplaintImpl, 'write');

/**
 * Delete a complaint (drafts only)
 */
async function deleteComplaintImpl(id: string) {
  // Using singleton supabase client
  const { error } = await supabase.from('complaints').delete().eq('id', id).eq('is_draft', true);

  if (error) throw error;
}

export const deleteComplaint = withRateLimit(deleteComplaintImpl, 'write');

/**
 * Reopen a resolved complaint with justification
 */
async function reopenComplaintImpl(id: string, justification: string, userId: string) {
  // Using singleton supabase client

  // Update complaint status to reopened
  const { data: complaint, error: updateError } = await supabase
    .from('complaints')
    .update({
      status: 'reopened',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'resolved') // Only allow reopening resolved complaints
    .select()
    .single();

  if (updateError) throw updateError;

  // Log the reopen action in history
  const { error: historyError } = await supabase.from('complaint_history').insert({
    complaint_id: id,
    action: 'reopened',
    old_value: 'resolved',
    new_value: 'reopened',
    performed_by: userId,
    details: { justification },
  });

  if (historyError) throw historyError;

  // Create notification for assigned lecturer
  if (complaint.assigned_to) {
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: complaint.assigned_to,
      type: 'complaint_reopened',
      title: 'Complaint Reopened',
      message: `A complaint has been reopened: "${complaint.title}"`,
      related_id: id,
      is_read: false,
    });

    if (notificationError) console.error('Failed to create notification:', notificationError);
  }

  return complaint;
}

export const reopenComplaint = withRateLimit(reopenComplaintImpl, 'write');

/**
 * Submit a rating for a resolved complaint
 * Validates: Requirements AC16 (Satisfaction Rating)
 */
async function submitRatingImpl(
  complaintId: string,
  studentId: string,
  rating: number,
  feedbackText?: string
) {
  // Using singleton supabase client

  // Validate rating is between 1-5
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Check if complaint exists and is resolved
  const { data: complaint, error: complaintError } = await supabase
    .from('complaints')
    .select('id, status, student_id')
    .eq('id', complaintId)
    .single();

  if (complaintError) throw complaintError;
  if (!complaint) throw new Error('Complaint not found');
  if (complaint.status !== 'resolved') {
    throw new Error('Can only rate resolved complaints');
  }
  if (complaint.student_id !== studentId) {
    throw new Error('Only the complaint owner can rate');
  }

  // Check if already rated
  const { data: existingRating, error: checkError } = await supabase
    .from('complaint_ratings')
    .select('id')
    .eq('complaint_id', complaintId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existingRating) {
    throw new Error('You have already rated this complaint');
  }

  // Insert rating
  const { data: newRating, error: insertError } = await supabase
    .from('complaint_ratings')
    .insert({
      complaint_id: complaintId,
      student_id: studentId,
      rating,
      feedback_text: feedbackText || null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Log rating in history
  const { error: historyError } = await supabase.from('complaint_history').insert({
    complaint_id: complaintId,
    action: 'rated',
    old_value: null,
    new_value: rating.toString(),
    performed_by: studentId,
    details: feedbackText ? { feedback: feedbackText } : null,
  });

  if (historyError) {
    console.error('Failed to log rating in history:', historyError);
    // Don't throw - rating was successful even if history logging failed
  }

  return newRating;
}

export const submitRating = withRateLimit(submitRatingImpl, 'write');

/**
 * Check if a complaint has been rated by a student
 */
async function hasRatedComplaintImpl(complaintId: string, studentId: string): Promise<boolean> {
  // Using singleton supabase client

  const { data, error } = await supabase
    .from('complaint_ratings')
    .select('id')
    .eq('complaint_id', complaintId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.error('Error checking rating status:', error);
    return false;
  }

  return !!data;
}

export const hasRatedComplaint = withRateLimit(hasRatedComplaintImpl, 'read');

/**
 * Get average rating for a user's resolved complaints
 * Validates: Requirements AC16 (Satisfaction Rating)
 * Optimized: Use a single query with join instead of two separate queries
 */
async function getUserAverageRatingImpl(userId: string): Promise<number | null> {
  // Using singleton supabase client

  // Use a single query with join to get ratings for user's resolved complaints
  const { data: ratings, error: ratingsError } = await supabase
    .from('complaint_ratings')
    .select(
      `
      rating,
      complaint:complaints!inner(student_id, status)
    `
    )
    .eq('complaint.student_id', userId)
    .eq('complaint.status', 'resolved');

  if (ratingsError) {
    console.error('Error fetching ratings:', ratingsError);
    return null;
  }

  if (!ratings || ratings.length === 0) {
    return null; // No ratings yet
  }

  // Calculate average
  const sum = ratings.reduce((acc: number, r: any) => acc + Number(r.rating), 0);
  const average = sum / ratings.length;

  return Math.round(average * 10) / 10; // Round to 1 decimal place
}

export const getUserAverageRating = withRateLimit(getUserAverageRatingImpl, 'read');

/**
 * Bulk assign multiple complaints to a lecturer
 * Validates: Requirements AC18 (Bulk Actions)
 * Optimized: Use batch operations and reduce round trips
 */
async function bulkAssignComplaintsImpl(
  complaintIds: string[],
  lecturerId: string,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Using singleton supabase client

  if (complaintIds.length === 0) {
    throw new Error('No complaints selected for assignment');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Get lecturer details for notifications
  const { data: lecturer, error: lecturerError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('id', lecturerId)
    .single();

  if (lecturerError || !lecturer) {
    throw new Error('Invalid lecturer selected');
  }

  // Fetch all complaints in one query
  const { data: complaints, error: fetchError } = await supabase
    .from('complaints')
    .select('id, title, assigned_to')
    .in('id', complaintIds);

  if (fetchError) {
    throw new Error(`Failed to fetch complaints: ${fetchError.message}`);
  }

  if (!complaints || complaints.length === 0) {
    throw new Error('No valid complaints found');
  }

  const timestamp = new Date().toISOString();

  // Batch update all complaints
  const { error: updateError } = await supabase
    .from('complaints')
    .update({
      assigned_to: lecturerId,
      updated_at: timestamp,
    })
    .in('id', complaintIds);

  if (updateError) {
    throw new Error(`Failed to update complaints: ${updateError.message}`);
  }

  // Prepare batch inserts for history and notifications
  const historyInserts = complaints.map((complaint: any) => ({
    complaint_id: complaint.id,
    action: 'assigned',
    old_value: complaint.assigned_to || 'unassigned',
    new_value: lecturerId,
    performed_by: performedBy,
    details: {
      lecturer_name: lecturer.full_name,
      bulk_action: true,
    },
  }));

  const notificationInserts = complaints.map((complaint: any) => ({
    user_id: lecturerId,
    type: 'complaint_assigned',
    title: 'New Complaint Assigned',
    message: `You have been assigned to: "${complaint.title}"`,
    related_id: complaint.id,
    is_read: false,
  }));

  // Batch insert history records
  const { error: historyError } = await supabase.from('complaint_history').insert(historyInserts);

  if (historyError) {
    console.error('Failed to log history for bulk assignment:', historyError);
    // Don't fail the operation if history logging fails
  }

  // Batch insert notifications
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert(notificationInserts);

  if (notificationError) {
    console.error('Failed to create notifications for bulk assignment:', notificationError);
    // Don't fail the operation if notification fails
  }

  results.success = complaints.length;

  return results;
}

export const bulkAssignComplaints = withRateLimit(bulkAssignComplaintsImpl, 'bulk');

/**
 * Bulk change status of multiple complaints
 * Validates: Requirements AC18 (Bulk Actions)
 * Optimized: Use batch operations and reduce round trips
 */
async function bulkChangeStatusImpl(
  complaintIds: string[],
  newStatus: string,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Using singleton supabase client

  if (complaintIds.length === 0) {
    throw new Error('No complaints selected for status change');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Fetch all complaints in one query
  const { data: complaints, error: fetchError } = await supabase
    .from('complaints')
    .select('id, title, status')
    .in('id', complaintIds);

  if (fetchError) {
    throw new Error(`Failed to fetch complaints: ${fetchError.message}`);
  }

  if (!complaints || complaints.length === 0) {
    throw new Error('No valid complaints found');
  }

  // Filter out complaints that already have the target status
  const complaintsToUpdate = complaints.filter((c: any) => c.status !== newStatus);

  if (complaintsToUpdate.length === 0) {
    // All complaints already have the target status
    results.success = complaints.length;
    return results;
  }

  const timestamp = new Date().toISOString();
  const idsToUpdate = complaintsToUpdate.map((c: any) => c.id);

  // Batch update all complaints
  const { error: updateError } = await supabase
    .from('complaints')
    .update({
      status: newStatus,
      updated_at: timestamp,
    })
    .in('id', idsToUpdate);

  if (updateError) {
    throw new Error(`Failed to update complaints: ${updateError.message}`);
  }

  // Prepare batch insert for history
  const historyInserts = complaintsToUpdate.map((complaint: any) => ({
    complaint_id: complaint.id,
    action: 'status_changed',
    old_value: complaint.status,
    new_value: newStatus,
    performed_by: performedBy,
    details: {
      bulk_action: true,
    },
  }));

  // Batch insert history records
  const { error: historyError } = await supabase.from('complaint_history').insert(historyInserts);

  if (historyError) {
    console.error('Failed to log history for bulk status change:', historyError);
    // Don't fail the operation if history logging fails
  }

  results.success = complaints.length;

  return results;
}

export const bulkChangeStatus = withRateLimit(bulkChangeStatusImpl, 'bulk');

/**
 * Bulk add tags to multiple complaints
 * Validates: Requirements AC18 (Bulk Actions)
 * Optimized: Use batch operations and reduce round trips
 */
async function bulkAddTagsImpl(
  complaintIds: string[],
  tags: string[],
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Using singleton supabase client

  if (complaintIds.length === 0) {
    throw new Error('No complaints selected for tag addition');
  }

  if (tags.length === 0) {
    throw new Error('No tags provided');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Fetch all complaints in one query to verify they exist
  const { data: complaints, error: fetchError } = await supabase
    .from('complaints')
    .select('id, title')
    .in('id', complaintIds);

  if (fetchError) {
    throw new Error(`Failed to fetch complaints: ${fetchError.message}`);
  }

  if (!complaints || complaints.length === 0) {
    throw new Error('No valid complaints found');
  }

  // Get all existing tags for these complaints in one query
  const { data: existingTags, error: existingTagsError } = await supabase
    .from('complaint_tags')
    .select('complaint_id, tag_name')
    .in('complaint_id', complaintIds);

  if (existingTagsError) {
    throw new Error(`Failed to fetch existing tags: ${existingTagsError.message}`);
  }

  // Build a map of complaint_id -> Set of existing tag names
  const existingTagsMap = new Map<string, Set<string>>();
  (existingTags || []).forEach((tag: unknown) => {
    if (!existingTagsMap.has(tag.complaint_id)) {
      existingTagsMap.set(tag.complaint_id, new Set());
    }
    existingTagsMap.get(tag.complaint_id)!.add(tag.tag_name);
  });

  // Prepare batch inserts for new tags
  const tagInserts: Array<{ complaint_id: string; tag_name: string }> = [];
  const historyInserts: Array<unknown> = [];

  complaints.forEach((complaint: unknown) => {
    const existingTagNames = existingTagsMap.get(complaint.id) || new Set();
    const newTags = tags.filter((tag: string) => !existingTagNames.has(tag));

    if (newTags.length > 0) {
      // Add tag inserts
      newTags.forEach((tag: string) => {
        tagInserts.push({
          complaint_id: complaint.id,
          tag_name: tag,
        });
      });

      // Add history insert
      historyInserts.push({
        complaint_id: complaint.id,
        action: 'tags_added',
        old_value: Array.from(existingTagNames).join(', ') || 'none',
        new_value: Array.from(existingTagNames).concat(newTags).join(', '),
        performed_by: performedBy,
        details: {
          added_tags: newTags,
          bulk_action: true,
        },
      });
    }
  });

  // Batch insert all new tags
  if (tagInserts.length > 0) {
    const { error: insertError } = await supabase.from('complaint_tags').insert(tagInserts);

    if (insertError) {
      throw new Error(`Failed to insert tags: ${insertError.message}`);
    }
  }

  // Batch insert history records
  if (historyInserts.length > 0) {
    const { error: historyError } = await supabase.from('complaint_history').insert(historyInserts);

    if (historyError) {
      console.error('Failed to log history for bulk tag addition:', historyError);
      // Don't fail the operation if history logging fails
    }
  }

  results.success = complaints.length;

  return results;
}

export const bulkAddTags = withRateLimit(bulkAddTagsImpl, 'bulk');
