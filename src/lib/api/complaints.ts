import { getSupabaseClient } from '@/lib/auth';

/**
 * Fetch complaints for the current user
 */
export async function getUserComplaints(userId: string) {
  console.log('getUserComplaints called with userId:', userId);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('student_id', userId)
    .eq('is_draft', false)
    .order('created_at', { ascending: false });

  console.log('getUserComplaints result:', { data, error });
  if (error) throw error;
  return data;
}

/**
 * Fetch draft complaints for the current user
 */
export async function getUserDrafts(userId: string) {
  console.log('getUserDrafts called with userId:', userId);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('student_id', userId)
    .eq('is_draft', true)
    .order('updated_at', { ascending: false });

  console.log('getUserDrafts result:', { data, error });
  if (error) throw error;
  return data;
}

/**
 * Get complaint statistics for a user
 */
export async function getUserComplaintStats(userId: string) {
  console.log('getUserComplaintStats called with userId:', userId);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('complaints')
    .select('status')
    .eq('student_id', userId)
    .eq('is_draft', false);

  console.log('getUserComplaintStats result:', { data, error });
  if (error) throw error;

  const stats = {
    total: data.length,
    new: data.filter((c: any) => c.status === 'new').length,
    open: data.filter((c: any) => c.status === 'open').length,
    in_progress: data.filter((c: any) => c.status === 'in_progress').length,
    resolved: data.filter((c: any) => c.status === 'resolved').length,
    closed: data.filter((c: any) => c.status === 'closed').length,
  };

  console.log('getUserComplaintStats stats:', stats);
  return stats;
}

/**
 * Fetch all complaints (for lecturers/admins)
 */
export async function getAllComplaints() {
  const supabase = getSupabaseClient();
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

/**
 * Fetch a single complaint by ID
 */
export async function getComplaintById(id: string) {
  const supabase = getSupabaseClient();
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

/**
 * Create a new complaint
 */
export async function createComplaint(complaint: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('complaints').insert(complaint).select().single();

  if (error) throw error;
  return data;
}

/**
 * Update a complaint
 */
export async function updateComplaint(id: string, updates: any) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('complaints')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a complaint (drafts only)
 */
export async function deleteComplaint(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('complaints').delete().eq('id', id).eq('is_draft', true);

  if (error) throw error;
}

/**
 * Reopen a resolved complaint with justification
 */
export async function reopenComplaint(id: string, justification: string, userId: string) {
  const supabase = getSupabaseClient();

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

/**
 * Submit a rating for a resolved complaint
 * Validates: Requirements AC16 (Satisfaction Rating)
 */
export async function submitRating(
  complaintId: string,
  studentId: string,
  rating: number,
  feedbackText?: string
) {
  const supabase = getSupabaseClient();

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

/**
 * Check if a complaint has been rated by a student
 */
export async function hasRatedComplaint(complaintId: string, studentId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

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

/**
 * Get average rating for a user's resolved complaints
 * Validates: Requirements AC16 (Satisfaction Rating)
 */
export async function getUserAverageRating(userId: string): Promise<number | null> {
  const supabase = getSupabaseClient();

  // Get all ratings for user's complaints
  const { data: complaints, error: complaintsError } = await supabase
    .from('complaints')
    .select('id')
    .eq('student_id', userId)
    .eq('status', 'resolved');

  if (complaintsError) {
    console.error('Error fetching user complaints:', complaintsError);
    return null;
  }

  if (!complaints || complaints.length === 0) {
    return null; // No resolved complaints
  }

  const complaintIds = complaints.map((c) => c.id);

  // Get ratings for these complaints
  const { data: ratings, error: ratingsError } = await supabase
    .from('complaint_ratings')
    .select('rating')
    .in('complaint_id', complaintIds);

  if (ratingsError) {
    console.error('Error fetching ratings:', ratingsError);
    return null;
  }

  if (!ratings || ratings.length === 0) {
    return null; // No ratings yet
  }

  // Calculate average
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / ratings.length;

  return Math.round(average * 10) / 10; // Round to 1 decimal place
}

/**
 * Bulk assign multiple complaints to a lecturer
 * Validates: Requirements AC18 (Bulk Actions)
 */
export async function bulkAssignComplaints(
  complaintIds: string[],
  lecturerId: string,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = getSupabaseClient();

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

  // Process each complaint
  for (const complaintId of complaintIds) {
    try {
      // Get complaint details before update
      const { data: complaint, error: fetchError } = await supabase
        .from('complaints')
        .select('id, title, assigned_to')
        .eq('id', complaintId)
        .single();

      if (fetchError || !complaint) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: Not found`);
        continue;
      }

      const oldAssignedTo = complaint.assigned_to;

      // Update complaint assignment
      const { error: updateError } = await supabase
        .from('complaints')
        .update({
          assigned_to: lecturerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);

      if (updateError) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: ${updateError.message}`);
        continue;
      }

      // Log assignment in history
      const { error: historyError } = await supabase.from('complaint_history').insert({
        complaint_id: complaintId,
        action: 'assigned',
        old_value: oldAssignedTo || 'unassigned',
        new_value: lecturerId,
        performed_by: performedBy,
        details: {
          lecturer_name: lecturer.full_name,
          bulk_action: true,
        },
      });

      if (historyError) {
        console.error(`Failed to log history for complaint ${complaintId}:`, historyError);
        // Don't fail the operation if history logging fails
      }

      // Create notification for assigned lecturer
      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: lecturerId,
        type: 'complaint_assigned',
        title: 'New Complaint Assigned',
        message: `You have been assigned to: "${complaint.title}"`,
        related_id: complaintId,
        is_read: false,
      });

      if (notificationError) {
        console.error(
          `Failed to create notification for complaint ${complaintId}:`,
          notificationError
        );
        // Don't fail the operation if notification fails
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Complaint ${complaintId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return results;
}

/**
 * Bulk change status of multiple complaints
 * Validates: Requirements AC18 (Bulk Actions)
 */
export async function bulkChangeStatus(
  complaintIds: string[],
  newStatus: string,
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = getSupabaseClient();

  if (complaintIds.length === 0) {
    throw new Error('No complaints selected for status change');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Process each complaint
  for (const complaintId of complaintIds) {
    try {
      // Get complaint details before update
      const { data: complaint, error: fetchError } = await supabase
        .from('complaints')
        .select('id, title, status')
        .eq('id', complaintId)
        .single();

      if (fetchError || !complaint) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: Not found`);
        continue;
      }

      const oldStatus = complaint.status;

      // Skip if status is already the target status
      if (oldStatus === newStatus) {
        results.success++;
        continue;
      }

      // Update complaint status
      const { error: updateError } = await supabase
        .from('complaints')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);

      if (updateError) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: ${updateError.message}`);
        continue;
      }

      // Log status change in history
      const { error: historyError } = await supabase.from('complaint_history').insert({
        complaint_id: complaintId,
        action: 'status_changed',
        old_value: oldStatus,
        new_value: newStatus,
        performed_by: performedBy,
        details: {
          bulk_action: true,
        },
      });

      if (historyError) {
        console.error(`Failed to log history for complaint ${complaintId}:`, historyError);
        // Don't fail the operation if history logging fails
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Complaint ${complaintId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return results;
}

/**
 * Bulk add tags to multiple complaints
 * Validates: Requirements AC18 (Bulk Actions)
 */
export async function bulkAddTags(
  complaintIds: string[],
  tags: string[],
  performedBy: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = getSupabaseClient();

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

  // Process each complaint
  for (const complaintId of complaintIds) {
    try {
      // Verify complaint exists
      const { data: complaint, error: fetchError } = await supabase
        .from('complaints')
        .select('id, title')
        .eq('id', complaintId)
        .single();

      if (fetchError || !complaint) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: Not found`);
        continue;
      }

      // Get existing tags for this complaint
      const { data: existingTags, error: existingTagsError } = await supabase
        .from('complaint_tags')
        .select('tag_name')
        .eq('complaint_id', complaintId);

      if (existingTagsError) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: Failed to fetch existing tags`);
        continue;
      }

      const existingTagNames = new Set(existingTags?.map((t) => t.tag_name) || []);

      // Filter out tags that already exist
      const newTags = tags.filter((tag) => !existingTagNames.has(tag));

      if (newTags.length === 0) {
        // All tags already exist, consider this a success
        results.success++;
        continue;
      }

      // Insert new tags
      const tagInserts = newTags.map((tag) => ({
        complaint_id: complaintId,
        tag_name: tag,
      }));

      const { error: insertError } = await supabase.from('complaint_tags').insert(tagInserts);

      if (insertError) {
        results.failed++;
        results.errors.push(`Complaint ${complaintId}: ${insertError.message}`);
        continue;
      }

      // Log tag addition in history
      const { error: historyError } = await supabase.from('complaint_history').insert({
        complaint_id: complaintId,
        action: 'tags_added',
        old_value: Array.from(existingTagNames).join(', ') || 'none',
        new_value: [...existingTagNames, ...newTags].join(', '),
        performed_by: performedBy,
        details: {
          added_tags: newTags,
          bulk_action: true,
        },
      });

      if (historyError) {
        console.error(`Failed to log history for complaint ${complaintId}:`, historyError);
        // Don't fail the operation if history logging fails
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Complaint ${complaintId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return results;
}
