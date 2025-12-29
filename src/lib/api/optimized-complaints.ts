/**
 * Optimized complaints API with performance enhancements
 *
 * This file demonstrates how to integrate all performance optimizations
 * with the existing complaints API for maximum efficiency.
 */

import { supabase } from '@/lib/supabase';
import { withRateLimit } from '@/lib/rate-limiter';
import { withTokenRefresh } from '@/lib/api-wrapper';
import { withMonitoring } from '@/lib/api/standardization/monitoring-wrapper';
import {
  optimizeComplaintApiCall,
  optimizeComplaintOperations,
  prefetchComplaintData,
  getOptimizationManager,
} from '@/lib/api/standardization/performance-integration';
import {
  validate,
  CreateComplaintSchema,
  UpdateComplaintSchema,
  DatabaseError,
} from '@/lib/validation';

/**
 * Optimized function to fetch user complaints with intelligent prefetching
 */
async function getUserComplaintsOptimizedImpl(userId: string) {
  return optimizeComplaintApiCall(
    `getUserComplaints-${userId}`,
    async () => {
      return withTokenRefresh(async () => {
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

        if (error) {
          throw new DatabaseError(
            error.message || 'Failed to fetch user complaints',
            error.code,
            undefined,
            error.details,
            error.hint
          );
        }

        // Prefetch related data based on usage patterns
        if (data && data.length > 0) {
          // Prefetch complaint details for the first few complaints
          const topComplaints = data.slice(0, 3);
          topComplaints.forEach((complaint, index) => {
            prefetchComplaintData(
              ['complaint', complaint.id],
              () => getComplaintByIdOptimized(complaint.id),
              3 - index // Higher priority for first complaints
            );
          });

          // Prefetch user stats
          prefetchComplaintData(
            ['complaints', 'stats', userId],
            () => getUserComplaintStatsOptimized(userId),
            2
          );
        }

        return data;
      });
    },
    {
      priority: 3,
      dependencies: [], // No dependencies for this operation
    }
  );
}

export const getUserComplaintsOptimized = withRateLimit(getUserComplaintsOptimizedImpl, 'read');

/**
 * Optimized function to fetch complaint statistics with parallel execution
 */
async function getUserComplaintStatsOptimizedImpl(userId: string) {
  return optimizeComplaintApiCall(
    `getUserComplaintStats-${userId}`,
    async () => {
      // Use parallel execution for all count queries
      const operations = {
        total: () =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('is_draft', false),
        new: () =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('is_draft', false)
            .eq('status', 'new'),
        opened: () =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('is_draft', false)
            .eq('status', 'opened'),
        inProgress: () =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('is_draft', false)
            .eq('status', 'in_progress'),
        resolved: () =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('is_draft', false)
            .eq('status', 'resolved'),
        closed: () =>
          supabase
            .from('complaints')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .eq('is_draft', false)
            .eq('status', 'closed'),
      };

      const results = await optimizeComplaintOperations(operations);

      // Check for errors
      Object.values(results).forEach((result) => {
        if (result.error) throw result.error;
      });

      return {
        total: results.total.count || 0,
        new: results.new.count || 0,
        opened: results.opened.count || 0,
        in_progress: results.inProgress.count || 0,
        resolved: results.resolved.count || 0,
        closed: results.closed.count || 0,
      };
    },
    {
      priority: 2,
      dependencies: [`getUserComplaints-${userId}`], // Depends on user complaints being loaded
    }
  );
}

export const getUserComplaintStatsOptimized = withRateLimit(
  getUserComplaintStatsOptimizedImpl,
  'read'
);

/**
 * Optimized function to fetch complaint by ID with prefetched related data
 */
async function getComplaintByIdOptimized(id: string) {
  return optimizeComplaintApiCall(
    `getComplaintById-${id}`,
    async () => {
      // Fetch main complaint data and related data in parallel
      const operations = {
        complaint: () =>
          supabase
            .from('complaints')
            .select(
              `
            *,
            student:users!complaints_student_id_fkey(id, full_name, email),
            assigned_user:users!complaints_assigned_to_fkey(id, full_name, email)
          `
            )
            .eq('id', id)
            .single(),
        tags: () => supabase.from('complaint_tags').select('tag_name').eq('complaint_id', id),
        comments: () =>
          supabase
            .from('complaint_comments')
            .select(
              `
            id,
            comment,
            is_internal,
            created_at,
            user:users(id, full_name, email, role)
          `
            )
            .eq('complaint_id', id)
            .order('created_at', { ascending: true }),
        attachments: () =>
          supabase
            .from('complaint_attachments')
            .select(
              `
            id,
            file_name,
            file_path,
            file_size,
            file_type,
            created_at
          `
            )
            .eq('complaint_id', id),
        history: () =>
          supabase
            .from('complaint_history')
            .select(
              `
            id,
            action,
            old_value,
            new_value,
            created_at,
            performed_by_user:users!complaint_history_performed_by_fkey(id, full_name, email)
          `
            )
            .eq('complaint_id', id)
            .order('created_at', { ascending: false }),
      };

      const results = await optimizeComplaintOperations(operations);

      // Check for errors
      if (results.complaint.error) {
        throw new DatabaseError(
          results.complaint.error.message || 'Failed to fetch complaint',
          results.complaint.error.code,
          undefined,
          results.complaint.error.details,
          results.complaint.error.hint
        );
      }

      // Combine all data
      const complaint = results.complaint.data;
      complaint.tags = results.tags.data || [];
      complaint.comments = results.comments.data || [];
      complaint.attachments = results.attachments.data || [];
      complaint.history = results.history.data || [];

      return complaint;
    },
    {
      priority: 3,
      dependencies: [], // No dependencies for individual complaint fetch
    }
  );
}

/**
 * Optimized function to create complaint with intelligent caching
 */
async function createComplaintOptimizedImpl(complaint: unknown) {
  return optimizeComplaintApiCall(
    'createComplaint',
    async () => {
      return withTokenRefresh(async () => {
        // Validate input data
        const validatedData = validate(CreateComplaintSchema, complaint);

        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('complaints')
          .insert(validatedData)
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating complaint:', error);
          throw new DatabaseError(
            error.message || 'Failed to create complaint',
            error.code,
            undefined,
            error.details,
            error.hint
          );
        }

        // Prefetch related data for the new complaint
        if (data) {
          prefetchComplaintData(
            ['complaint', data.id],
            () => getComplaintByIdOptimized(data.id),
            3
          );

          // Invalidate and prefetch user stats
          prefetchComplaintData(
            ['complaints', 'stats', data.student_id],
            () => getUserComplaintStatsOptimized(data.student_id),
            2
          );
        }

        return data;
      });
    },
    {
      priority: 3,
      dependencies: [], // No dependencies for creation
    }
  );
}

export const createComplaintOptimized = withRateLimit(createComplaintOptimizedImpl, 'write');

/**
 * Optimized function to update complaint with dependency management
 */
async function updateComplaintOptimizedImpl(id: string, updates: unknown) {
  return optimizeComplaintApiCall(
    `updateComplaint-${id}`,
    async () => {
      return withTokenRefresh(async () => {
        // Validate input data
        const validatedData = validate(UpdateComplaintSchema, {
          id,
          ...(typeof updates === 'object' && updates !== null ? updates : {}),
        });

        // Extract id and get only the update fields
        const { id: validatedId, ...updateFields } = validatedData;

        const { data, error } = await supabase
          .from('complaints')
          .update(updateFields)
          .eq('id', validatedId)
          .select()
          .single();

        if (error) {
          throw new DatabaseError(
            error.message || 'Failed to update complaint',
            error.code,
            undefined,
            error.details,
            error.hint
          );
        }

        // Prefetch updated complaint details
        if (data) {
          prefetchComplaintData(
            ['complaint', data.id],
            () => getComplaintByIdOptimized(data.id),
            3
          );

          // If status changed, prefetch user stats
          if (updateFields.status) {
            prefetchComplaintData(
              ['complaints', 'stats', data.student_id],
              () => getUserComplaintStatsOptimized(data.student_id),
              2
            );
          }
        }

        return data;
      });
    },
    {
      priority: 3,
      dependencies: [`getComplaintById-${id}`], // Depends on complaint being loaded
    }
  );
}

export const updateComplaintOptimized = withRateLimit(updateComplaintOptimizedImpl, 'write');

/**
 * Optimized bulk operations with intelligent batching
 */
async function bulkAssignComplaintsOptimizedImpl(
  complaintIds: string[],
  lecturerId: string,
  performedBy: string
) {
  return optimizeComplaintApiCall(
    'bulkAssignComplaints',
    async () => {
      return withTokenRefresh(async () => {
        if (complaintIds.length === 0) {
          throw new Error('No complaints selected for assignment');
        }

        const results = {
          success: 0,
          failed: 0,
          errors: [] as string[],
        };

        // Fetch lecturer and complaints data in parallel
        const operations = {
          lecturer: () =>
            supabase.from('users').select('id, full_name, email').eq('id', lecturerId).single(),
          complaints: () =>
            supabase
              .from('complaints')
              .select('id, title, assigned_to, student_id')
              .in('id', complaintIds),
        };

        const { lecturer, complaints } = await optimizeComplaintOperations(operations);

        if (lecturer.error || !lecturer.data) {
          throw new Error('Invalid lecturer selected');
        }

        if (complaints.error) {
          throw new Error(`Failed to fetch complaints: ${complaints.error.message}`);
        }

        if (!complaints.data || complaints.data.length === 0) {
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
        const historyInserts = complaints.data.map((complaint: any) => ({
          complaint_id: complaint.id,
          action: 'assigned',
          old_value: complaint.assigned_to || 'unassigned',
          new_value: lecturerId,
          performed_by: performedBy,
          details: {
            lecturer_name: lecturer.data.full_name,
            bulk_action: true,
          },
        }));

        const notificationInserts = complaints.data.map((complaint: any) => ({
          user_id: lecturerId,
          type: 'complaint_assigned',
          title: 'New Complaint Assigned',
          message: `You have been assigned to: "${complaint.title}"`,
          related_id: complaint.id,
          is_read: false,
        }));

        // Execute history and notifications in parallel
        const batchOperations = {
          history: () => supabase.from('complaint_history').insert(historyInserts),
          notifications: () => supabase.from('notifications').insert(notificationInserts),
        };

        await optimizeComplaintOperations(batchOperations);

        results.success = complaints.data.length;

        // Prefetch updated complaint data
        complaints.data.forEach((complaint: any) => {
          prefetchComplaintData(
            ['complaint', complaint.id],
            () => getComplaintByIdOptimized(complaint.id),
            1
          );

          // Prefetch user stats for affected students
          prefetchComplaintData(
            ['complaints', 'stats', complaint.student_id],
            () => getUserComplaintStatsOptimized(complaint.student_id),
            1
          );
        });

        return results;
      });
    },
    {
      priority: 2,
      dependencies: complaintIds.map((id) => `getComplaintById-${id}`), // Depends on complaints being loaded
    }
  );
}

export const bulkAssignComplaintsOptimized = withRateLimit(
  bulkAssignComplaintsOptimizedImpl,
  'bulk'
);

/**
 * Performance monitoring wrapper for all optimized functions
 */
export function withPerformanceOptimization<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    const manager = getOptimizationManager();
    return manager.optimizeApiCall(operationName, () => fn(...args));
  }) as T;
}

/**
 * Example usage of performance dashboard
 */
export function getComplaintSystemPerformanceDashboard() {
  const manager = getOptimizationManager();
  const stats = manager.getPerformanceStats();

  return {
    // Overall performance metrics
    overallScore: stats.overallScore,

    // Individual optimization metrics
    prefetching: {
      enabled: stats.prefetching.totalPrefetches > 0,
      hitRate: stats.prefetching.hitRate,
      timeSaved: `${Math.round(stats.prefetching.timeSaved / 1000)}s`,
    },

    compression: {
      enabled: stats.compression.bytesSaved > 0,
      compressionRatio: `${Math.round((1 - stats.compression.compressionRatio) * 100)}%`,
      bytesSaved: `${Math.round(stats.compression.bytesSaved / 1024)}KB`,
    },

    parallelization: {
      enabled: stats.parallelization.timeSaved > 0,
      concurrencyUtilization: `${Math.round(stats.parallelization.concurrencyUtilization)}%`,
      timeSaved: `${Math.round(stats.parallelization.timeSaved / 1000)}s`,
    },

    caching: {
      hitRate: `${Math.round(stats.cache.hitRate)}%`,
      memoryUsage: `${Math.round(stats.cache.memoryUsage / 1024 / 1024)}MB`,
      gcCount: stats.cache.gcCount,
    },

    // Performance recommendations
    recommendations: [
      stats.prefetching.hitRate < 70 ? 'Consider adjusting prefetching confidence threshold' : null,
      stats.compression.compressionRatio > 0.8
        ? 'Review compression settings for better efficiency'
        : null,
      stats.parallelization.concurrencyUtilization < 50
        ? 'Increase parallelization for better throughput'
        : null,
      stats.cache.hitRate < 80 ? 'Optimize cache strategy and increase cache size' : null,
    ].filter(Boolean),
  };
}
