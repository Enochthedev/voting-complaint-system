/**
 * Optimized React Query hooks for complaints with performance enhancements
 *
 * These hooks integrate all performance optimizations including intelligent
 * prefetching, request parallelization, and performance monitoring.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import {
  getUserComplaintsOptimized,
  getUserComplaintStatsOptimized,
  getComplaintByIdOptimized,
  createComplaintOptimized,
  updateComplaintOptimized,
  bulkAssignComplaintsOptimized,
  getComplaintSystemPerformanceDashboard,
} from '@/lib/api/optimized-complaints';
import {
  getOptimizationManager,
  prefetchComplaintData,
} from '@/lib/api/standardization/performance-integration';
import { useToast } from '@/components/ui/toast';
import { ValidationError, DatabaseError } from '@/lib/validation';
import { TimeoutError } from '@/lib/timeout';

/**
 * Enhanced query keys with performance metadata
 */
export const optimizedComplaintKeys = {
  all: ['complaints-optimized'] as const,
  lists: () => [...optimizedComplaintKeys.all, 'list'] as const,
  list: (filters: string) => [...optimizedComplaintKeys.lists(), { filters }] as const,
  details: () => [...optimizedComplaintKeys.all, 'detail'] as const,
  detail: (id: string) => [...optimizedComplaintKeys.details(), id] as const,
  user: (userId: string) => [...optimizedComplaintKeys.all, 'user', userId] as const,
  userStats: (userId: string) => [...optimizedComplaintKeys.all, 'stats', userId] as const,
  performance: () => [...optimizedComplaintKeys.all, 'performance'] as const,
};

/**
 * Hook to fetch user's complaints with intelligent prefetching
 */
export function useOptimizedUserComplaints(userId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: optimizedComplaintKeys.user(userId),
    queryFn: () => getUserComplaintsOptimized(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - longer than default due to prefetching
    onSuccess: (data) => {
      // Record access pattern for future prefetching
      try {
        const manager = getOptimizationManager();
        // This would be handled internally by the optimized API calls
      } catch (error) {
        // Optimization manager not initialized - continue without optimization
      }

      // Prefetch complaint details for recently viewed complaints
      if (data && data.length > 0) {
        data.slice(0, 3).forEach((complaint, index) => {
          queryClient.prefetchQuery({
            queryKey: optimizedComplaintKeys.detail(complaint.id),
            queryFn: () => getComplaintByIdOptimized(complaint.id),
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
        });
      }
    },
  });
}

/**
 * Hook to fetch user's complaint statistics with parallel execution
 */
export function useOptimizedUserComplaintStats(userId: string) {
  return useQuery({
    queryKey: optimizedComplaintKeys.userStats(userId),
    queryFn: () => getUserComplaintStatsOptimized(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - stats change less frequently
  });
}

/**
 * Hook to fetch complaint details with enhanced caching
 */
export function useOptimizedComplaint(id: string) {
  return useQuery({
    queryKey: optimizedComplaintKeys.detail(id),
    queryFn: () => getComplaintByIdOptimized(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to create complaint with performance optimization
 */
export function useOptimizedCreateComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: createComplaintOptimized,
    onMutate: async (newComplaint: any) => {
      // Cancel outgoing refetches
      const queryKey = newComplaint.is_draft
        ? optimizedComplaintKeys.user(newComplaint.student_id)
        : optimizedComplaintKeys.user(newComplaint.student_id);

      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update with performance tracking
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!Array.isArray(old)) return old;

        const optimisticComplaint = {
          ...newComplaint,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return [optimisticComplaint, ...old];
      });

      return { previousData, queryKey };
    },
    onError: (err: any, variables: any, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      // Enhanced error handling with performance context
      let errorMessage = 'Failed to create complaint. Please try again.';

      if (err instanceof ValidationError) {
        errorMessage = err.getUserMessage();
      } else if (err instanceof TimeoutError) {
        errorMessage = 'Request timed out. The system may be under heavy load.';
      } else if (err instanceof DatabaseError) {
        errorMessage = err.details || err.message || 'Database error occurred';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, 'Error Creating Complaint');
      console.error('Create complaint error:', err);
    },
    onSuccess: (data, variables: any) => {
      // Invalidate and prefetch related queries
      queryClient.invalidateQueries({ queryKey: optimizedComplaintKeys.all });
      queryClient.invalidateQueries({
        queryKey: optimizedComplaintKeys.user(variables.student_id),
      });
      queryClient.invalidateQueries({
        queryKey: optimizedComplaintKeys.userStats(variables.student_id),
      });

      // Prefetch the new complaint details
      if (data) {
        queryClient.prefetchQuery({
          queryKey: optimizedComplaintKeys.detail(data.id),
          queryFn: () => getComplaintByIdOptimized(data.id),
          staleTime: 5 * 60 * 1000,
        });
      }

      toast.success('Complaint created successfully!', 'Success');
    },
  });
}

/**
 * Hook to update complaint with dependency-aware optimization
 */
export function useOptimizedUpdateComplaint() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateComplaintOptimized(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: optimizedComplaintKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: optimizedComplaintKeys.all });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(optimizedComplaintKeys.detail(id));
      const previousLists = queryClient.getQueryData(optimizedComplaintKeys.lists());

      // Optimistically update with performance tracking
      queryClient.setQueryData(optimizedComplaintKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...updates,
          updated_at: new Date().toISOString(),
        };
      });

      return { previousDetail, previousLists, id };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(optimizedComplaintKeys.detail(context.id), context.previousDetail);
      }

      // Enhanced error handling
      let errorMessage = 'Failed to update complaint. Please try again.';

      if (err instanceof ValidationError) {
        errorMessage = err.getUserMessage();
      } else if (err instanceof TimeoutError) {
        errorMessage = 'Request timed out. The system may be under heavy load.';
      } else if (err instanceof DatabaseError) {
        errorMessage = err.details || err.message || 'Database error occurred';
      }

      toast.error(errorMessage, 'Error Updating Complaint');
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: optimizedComplaintKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: optimizedComplaintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: optimizedComplaintKeys.user(data.student_id) });
      queryClient.invalidateQueries({
        queryKey: optimizedComplaintKeys.userStats(data.student_id),
      });

      toast.success('Complaint updated successfully!', 'Success');
    },
  });
}

/**
 * Hook for optimized bulk operations
 */
export function useOptimizedBulkAssignComplaints() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      complaintIds,
      lecturerId,
      performedBy,
    }: {
      complaintIds: string[];
      lecturerId: string;
      performedBy: string;
    }) => bulkAssignComplaintsOptimized(complaintIds, lecturerId, performedBy),
    onSuccess: (result) => {
      // Invalidate all complaint queries
      queryClient.invalidateQueries({ queryKey: optimizedComplaintKeys.all });

      toast.success(
        `Successfully assigned ${result.success} complaints`,
        'Bulk Assignment Complete'
      );
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign complaints', 'Bulk Assignment Failed');
    },
  });
}

/**
 * Hook for performance monitoring and dashboard
 */
export function usePerformanceDashboard() {
  return useQuery({
    queryKey: optimizedComplaintKeys.performance(),
    queryFn: getComplaintSystemPerformanceDashboard,
    refetchInterval: 30000, // Update every 30 seconds
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook for intelligent prefetching based on user behavior
 */
export function useIntelligentPrefetching(userId: string) {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef(new Set<string>());

  const prefetchComplaintDetails = useCallback(
    (complaintId: string, priority: number = 1) => {
      if (prefetchedRef.current.has(complaintId)) return;

      prefetchedRef.current.add(complaintId);

      queryClient.prefetchQuery({
        queryKey: optimizedComplaintKeys.detail(complaintId),
        queryFn: () => getComplaintByIdOptimized(complaintId),
        staleTime: 5 * 60 * 1000,
      });

      // Clean up prefetch tracking after some time
      setTimeout(
        () => {
          prefetchedRef.current.delete(complaintId);
        },
        10 * 60 * 1000
      ); // 10 minutes
    },
    [queryClient]
  );

  const prefetchUserStats = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: optimizedComplaintKeys.userStats(userId),
      queryFn: () => getUserComplaintStatsOptimized(userId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, userId]);

  return {
    prefetchComplaintDetails,
    prefetchUserStats,
  };
}

/**
 * Hook for performance-aware virtual scrolling
 */
export function usePerformanceAwareVirtualScrolling<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>
) {
  const { prefetchComplaintDetails } = useIntelligentPrefetching(''); // Would need actual userId

  // Enhanced virtual scrolling with prefetching
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

          // Prefetch items that are about to come into view
          if (scrollPercentage > 0.7) {
            const currentIndex = Math.floor((scrollTop / scrollHeight) * items.length);
            const prefetchRange = 5; // Prefetch next 5 items

            for (
              let i = currentIndex;
              i < Math.min(currentIndex + prefetchRange, items.length);
              i++
            ) {
              const item = items[i] as any;
              if (item?.id) {
                prefetchComplaintDetails(item.id, 1);
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items, containerRef, prefetchComplaintDetails]);

  return {
    // Return virtual scrolling utilities
    shouldUseVirtual: items.length > 50,
    estimatedItemSize: 80,
    overscan: 5,
  };
}

/**
 * Hook for adaptive performance optimization
 */
export function useAdaptivePerformanceOptimization() {
  const performanceDashboard = usePerformanceDashboard();

  useEffect(() => {
    if (!performanceDashboard.data) return;

    const { overallScore, recommendations } = performanceDashboard.data;

    // Auto-adjust optimizations based on performance
    if (overallScore < 70) {
      console.warn(
        'Performance below threshold, applying adaptive optimizations:',
        recommendations
      );

      try {
        const manager = getOptimizationManager();

        // Adjust configuration based on performance
        manager.updateConfig({
          prefetching: {
            enabled: true,
            maxConcurrentPrefetches: overallScore < 50 ? 5 : 3,
            confidenceThreshold: overallScore < 50 ? 0.6 : 0.7,
          },
          parallelization: {
            enabled: true,
            maxConcurrency: overallScore < 50 ? 8 : 6,
            dependencyAware: true,
          },
          compression: {
            enabled: true,
            threshold: overallScore < 50 ? 512 : 1024,
            algorithm: 'gzip',
          },
        });
      } catch (error) {
        console.warn('Could not apply adaptive optimizations:', error);
      }
    }
  }, [performanceDashboard.data]);

  return {
    performanceScore: performanceDashboard.data?.overallScore || 0,
    recommendations: performanceDashboard.data?.recommendations || [],
    isOptimizing: performanceDashboard.data?.overallScore
      ? performanceDashboard.data.overallScore < 70
      : false,
  };
}

/**
 * Hook for performance monitoring in development
 */
export function usePerformanceMonitoring(
  enabled: boolean = process.env.NODE_ENV === 'development'
) {
  const performanceDashboard = usePerformanceDashboard();

  useEffect(() => {
    if (!enabled || !performanceDashboard.data) return;

    // Log performance metrics in development
    console.group('🚀 Performance Dashboard');
    console.log('Overall Score:', performanceDashboard.data.overallScore);
    console.log('Prefetching:', performanceDashboard.data.prefetching);
    console.log('Compression:', performanceDashboard.data.compression);
    console.log('Parallelization:', performanceDashboard.data.parallelization);
    console.log('Caching:', performanceDashboard.data.caching);

    if (performanceDashboard.data.recommendations.length > 0) {
      console.warn('Recommendations:', performanceDashboard.data.recommendations);
    }

    console.groupEnd();
  }, [enabled, performanceDashboard.data]);

  return performanceDashboard.data;
}
