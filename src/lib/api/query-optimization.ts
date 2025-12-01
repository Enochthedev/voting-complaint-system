/**
 * Query Optimization Utilities
 *
 * This file contains utilities and helpers for optimizing database queries:
 * - Query result caching
 * - Batch query execution
 * - Query performance monitoring
 */

import { getSupabaseClient } from '@/lib/auth';

/**
 * Batch fetch multiple complaints by IDs
 * More efficient than fetching one by one
 */
export async function batchFetchComplaintsByIds(ids: string[]) {
  if (ids.length === 0) return [];

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
    .in('id', ids);

  if (error) throw error;
  return data || [];
}

/**
 * Batch fetch user details by IDs
 * Useful for resolving user references in bulk
 */
export async function batchFetchUsersByIds(ids: string[]) {
  if (ids.length === 0) return [];

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .in('id', ids);

  if (error) throw error;
  return data || [];
}

/**
 * Get complaint counts grouped by status
 * More efficient than multiple count queries
 */
export async function getComplaintCountsByStatus(filters?: {
  studentId?: string;
  assignedTo?: string;
  isDraft?: boolean;
}) {
  const supabase = getSupabaseClient();

  let query = supabase.from('complaints').select('status');

  if (filters?.studentId) {
    query = query.eq('student_id', filters.studentId);
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  if (filters?.isDraft !== undefined) {
    query = query.eq('is_draft', filters.isDraft);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Group by status on client side (more efficient than multiple DB queries)
  const counts: Record<string, number> = {};
  (data || []).forEach((complaint: any) => {
    counts[complaint.status] = (counts[complaint.status] || 0) + 1;
  });

  return counts;
}

/**
 * Prefetch related data for complaints
 * Reduces N+1 queries by fetching all related data upfront
 */
export async function prefetchComplaintRelatedData(complaintIds: string[]) {
  if (complaintIds.length === 0) {
    return {
      tags: [],
      comments: [],
      attachments: [],
      history: [],
    };
  }

  const supabase = getSupabaseClient();

  // Fetch all related data in parallel
  const [tagsResult, commentsResult, attachmentsResult, historyResult] = await Promise.all([
    supabase.from('complaint_tags').select('*').in('complaint_id', complaintIds),
    supabase
      .from('complaint_comments')
      .select(
        `
        *,
        user:users(id, full_name, email, role)
      `
      )
      .in('complaint_id', complaintIds)
      .order('created_at', { ascending: true }),
    supabase.from('complaint_attachments').select('*').in('complaint_id', complaintIds),
    supabase
      .from('complaint_history')
      .select(
        `
        *,
        performed_by_user:users!complaint_history_performed_by_fkey(id, full_name, email)
      `
      )
      .in('complaint_id', complaintIds)
      .order('created_at', { ascending: false }),
  ]);

  return {
    tags: tagsResult.data || [],
    comments: commentsResult.data || [],
    attachments: attachmentsResult.data || [],
    history: historyResult.data || [],
  };
}

/**
 * Paginated query helper with optimized counting
 * Uses range queries which are more efficient than offset
 */
export async function paginatedQuery<T>(
  table: string,
  page: number,
  pageSize: number,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
  }
): Promise<{ data: T[]; total: number; hasMore: boolean }> {
  const supabase = getSupabaseClient();

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from(table).select(options?.select || '*', { count: 'exact' });

  // Apply filters
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  // Apply ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? false,
    });
  }

  // Apply range
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data || []) as T[],
    total: count || 0,
    hasMore: count ? to < count - 1 : false,
  };
}

/**
 * Execute multiple queries in parallel
 * Useful for dashboard data that needs multiple independent queries
 */
export async function parallelQueries<T extends Record<string, any>>(
  queries: Record<keyof T, Promise<any>>
): Promise<T> {
  const keys = Object.keys(queries) as Array<keyof T>;
  const promises = keys.map((key) => queries[key]);

  const results = await Promise.all(promises);

  const output = {} as T;
  keys.forEach((key, index) => {
    output[key] = results[index];
  });

  return output;
}

/**
 * Optimized search query with full-text search
 * Uses the search_vector column for better performance
 */
export async function searchComplaints(
  searchTerm: string,
  options?: {
    limit?: number;
    filters?: {
      status?: string;
      category?: string;
      priority?: string;
      studentId?: string;
      assignedTo?: string;
    };
  }
) {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('complaints')
    .select(
      `
      id,
      title,
      description,
      status,
      priority,
      category,
      created_at,
      student:users!complaints_student_id_fkey(id, full_name),
      assigned_user:users!complaints_assigned_to_fkey(id, full_name)
    `
    )
    .textSearch('search_vector', searchTerm, {
      type: 'websearch',
      config: 'english',
    })
    .eq('is_draft', false);

  // Apply filters
  if (options?.filters?.status) {
    query = query.eq('status', options.filters.status);
  }
  if (options?.filters?.category) {
    query = query.eq('category', options.filters.category);
  }
  if (options?.filters?.priority) {
    query = query.eq('priority', options.filters.priority);
  }
  if (options?.filters?.studentId) {
    query = query.eq('student_id', options.filters.studentId);
  }
  if (options?.filters?.assignedTo) {
    query = query.eq('assigned_to', options.filters.assignedTo);
  }

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
