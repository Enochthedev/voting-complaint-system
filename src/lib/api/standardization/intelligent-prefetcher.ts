/**
 * Intelligent prefetching system for API optimization
 *
 * Analyzes usage patterns and prefetches data that users are likely to need,
 * improving perceived performance and reducing loading times.
 */

import { QueryClient } from '@tanstack/react-query';
import type { RequestOptions } from './types';

/**
 * Configuration for intelligent prefetching
 */
export interface PrefetchConfig {
  /** Enable/disable prefetching */
  enabled: boolean;
  /** Maximum number of prefetch requests to queue */
  maxConcurrentPrefetches: number;
  /** Time window for analyzing usage patterns (ms) */
  analysisWindow: number;
  /** Minimum confidence score to trigger prefetch (0-1) */
  confidenceThreshold: number;
  /** Maximum age for prefetched data (ms) */
  maxAge: number;
  /** Enable prefetching on hover */
  prefetchOnHover: boolean;
  /** Enable prefetching based on scroll position */
  prefetchOnScroll: boolean;
}

/**
 * Usage pattern data
 */
interface UsagePattern {
  /** Resource identifier */
  resource: string;
  /** Access count */
  accessCount: number;
  /** Last access timestamp */
  lastAccess: number;
  /** Average time between accesses */
  averageInterval: number;
  /** Confidence score (0-1) */
  confidence: number;
  /** Related resources often accessed together */
  relatedResources: string[];
}

/**
 * Prefetch request information
 */
interface PrefetchRequest {
  /** Unique identifier */
  id: string;
  /** Query key for React Query */
  queryKey: any[];
  /** Query function */
  queryFn: () => Promise<any>;
  /** Priority score */
  priority: number;
  /** Timestamp when queued */
  queuedAt: number;
  /** Confidence score */
  confidence: number;
}

/**
 * Prefetch statistics
 */
export interface PrefetchStats {
  /** Total prefetch requests made */
  totalPrefetches: number;
  /** Successful prefetches */
  successfulPrefetches: number;
  /** Failed prefetches */
  failedPrefetches: number;
  /** Cache hits from prefetched data */
  prefetchHits: number;
  /** Prefetch hit rate */
  hitRate: number;
  /** Average prefetch time (ms) */
  averagePrefetchTime: number;
  /** Data saved from prefetching (bytes) */
  dataSaved: number;
}

/**
 * Intelligent prefetching system
 */
export class IntelligentPrefetcher {
  private config: PrefetchConfig;
  private queryClient: QueryClient;
  private usagePatterns = new Map<string, UsagePattern>();
  private prefetchQueue: PrefetchRequest[] = [];
  private activePrefetches = new Set<string>();
  private stats: PrefetchStats = {
    totalPrefetches: 0,
    successfulPrefetches: 0,
    failedPrefetches: 0,
    prefetchHits: 0,
    hitRate: 0,
    averagePrefetchTime: 0,
    dataSaved: 0,
  };

  constructor(queryClient: QueryClient, config: Partial<PrefetchConfig> = {}) {
    this.queryClient = queryClient;
    this.config = {
      enabled: true,
      maxConcurrentPrefetches: 3,
      analysisWindow: 30 * 60 * 1000, // 30 minutes
      confidenceThreshold: 0.7,
      maxAge: 5 * 60 * 1000, // 5 minutes
      prefetchOnHover: true,
      prefetchOnScroll: true,
      ...config,
    };

    // Start processing prefetch queue
    this.startQueueProcessor();

    // Clean up old patterns periodically
    setInterval(() => this.cleanupPatterns(), this.config.analysisWindow);
  }

  /**
   * Record resource access for pattern analysis
   */
  recordAccess(resource: string, relatedResources: string[] = []): void {
    if (!this.config.enabled) return;

    const now = Date.now();
    const existing = this.usagePatterns.get(resource);

    if (existing) {
      // Update existing pattern
      const timeSinceLastAccess = now - existing.lastAccess;
      const newAverageInterval =
        (existing.averageInterval * existing.accessCount + timeSinceLastAccess) /
        (existing.accessCount + 1);

      existing.accessCount++;
      existing.lastAccess = now;
      existing.averageInterval = newAverageInterval;
      existing.confidence = this.calculateConfidence(existing);

      // Update related resources
      relatedResources.forEach((related) => {
        if (!existing.relatedResources.includes(related)) {
          existing.relatedResources.push(related);
        }
      });
    } else {
      // Create new pattern
      this.usagePatterns.set(resource, {
        resource,
        accessCount: 1,
        lastAccess: now,
        averageInterval: 0,
        confidence: 0.1, // Low initial confidence
        relatedResources: [...relatedResources],
      });
    }

    // Trigger predictive prefetching
    this.triggerPredictivePrefetch(resource);
  }

  /**
   * Prefetch data based on query key and function
   */
  async prefetch(
    queryKey: any[],
    queryFn: () => Promise<any>,
    options: { priority?: number; confidence?: number } = {}
  ): Promise<void> {
    if (!this.config.enabled) return;

    const requestId = this.generateRequestId(queryKey);

    // Check if already prefetched or in progress
    if (this.activePrefetches.has(requestId)) return;

    // Check if data is already in cache and fresh
    const existingData = this.queryClient.getQueryData(queryKey);
    if (existingData) {
      this.stats.prefetchHits++;
      this.updateHitRate();
      return;
    }

    const request: PrefetchRequest = {
      id: requestId,
      queryKey,
      queryFn,
      priority: options.priority || 1,
      queuedAt: Date.now(),
      confidence: options.confidence || 0.5,
    };

    // Add to queue
    this.prefetchQueue.push(request);
    this.prefetchQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Prefetch on hover (for interactive elements)
   */
  prefetchOnHover(queryKey: any[], queryFn: () => Promise<any>, element: HTMLElement): () => void {
    if (!this.config.prefetchOnHover) return () => {};

    let prefetchTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      // Delay prefetch slightly to avoid unnecessary requests
      prefetchTimeout = setTimeout(() => {
        this.prefetch(queryKey, queryFn, { priority: 2, confidence: 0.8 });
      }, 100);
    };

    const handleMouseLeave = () => {
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Return cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };
  }

  /**
   * Prefetch based on scroll position
   */
  prefetchOnScroll(
    items: Array<{ queryKey: any[]; queryFn: () => Promise<any> }>,
    container: HTMLElement,
    threshold: number = 0.8
  ): () => void {
    if (!this.config.prefetchOnScroll) return () => {};

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

          if (scrollPercentage >= threshold) {
            // Prefetch next items
            items.forEach((item, index) => {
              this.prefetch(item.queryKey, item.queryFn, {
                priority: 1 - index * 0.1, // Decreasing priority
                confidence: 0.6,
              });
            });
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }

  /**
   * Get prefetch statistics
   */
  getStats(): PrefetchStats {
    return { ...this.stats };
  }

  /**
   * Get usage patterns
   */
  getUsagePatterns(): UsagePattern[] {
    return Array.from(this.usagePatterns.values());
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.usagePatterns.clear();
    this.prefetchQueue.length = 0;
    this.activePrefetches.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PrefetchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start processing prefetch queue
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue();
    }, 100); // Process every 100ms
  }

  /**
   * Process prefetch queue
   */
  private async processQueue(): Promise<void> {
    if (this.prefetchQueue.length === 0) return;
    if (this.activePrefetches.size >= this.config.maxConcurrentPrefetches) return;

    const request = this.prefetchQueue.shift();
    if (!request) return;

    // Skip if confidence is too low
    if (request.confidence < this.config.confidenceThreshold) return;

    this.activePrefetches.add(request.id);
    this.stats.totalPrefetches++;

    const startTime = Date.now();

    try {
      await this.queryClient.prefetchQuery({
        queryKey: request.queryKey,
        queryFn: request.queryFn,
        staleTime: this.config.maxAge,
      });

      this.stats.successfulPrefetches++;

      // Update average prefetch time
      const prefetchTime = Date.now() - startTime;
      this.updateAveragePrefetchTime(prefetchTime);
    } catch (error) {
      this.stats.failedPrefetches++;
      console.warn('Prefetch failed:', error);
    } finally {
      this.activePrefetches.delete(request.id);
    }
  }

  /**
   * Trigger predictive prefetching based on patterns
   */
  private triggerPredictivePrefetch(resource: string): void {
    const pattern = this.usagePatterns.get(resource);
    if (!pattern || pattern.confidence < this.config.confidenceThreshold) return;

    // Prefetch related resources
    pattern.relatedResources.forEach((relatedResource) => {
      const relatedPattern = this.usagePatterns.get(relatedResource);
      if (relatedPattern && relatedPattern.confidence >= this.config.confidenceThreshold) {
        // This would need to be implemented based on specific query patterns
        // For now, we record the intent
        console.log(`Would prefetch related resource: ${relatedResource}`);
      }
    });
  }

  /**
   * Calculate confidence score for a usage pattern
   */
  private calculateConfidence(pattern: UsagePattern): number {
    const now = Date.now();
    const timeSinceLastAccess = now - pattern.lastAccess;

    // Base confidence on access frequency
    let confidence = Math.min(pattern.accessCount / 10, 1);

    // Reduce confidence based on time since last access
    const recencyFactor = Math.max(0, 1 - timeSinceLastAccess / this.config.analysisWindow);
    confidence *= recencyFactor;

    // Boost confidence if access pattern is regular
    if (pattern.averageInterval > 0 && pattern.accessCount > 2) {
      const regularity =
        1 / (1 + Math.abs(timeSinceLastAccess - pattern.averageInterval) / pattern.averageInterval);
      confidence *= (1 + regularity) / 2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(queryKey: any[]): string {
    return JSON.stringify(queryKey);
  }

  /**
   * Clean up old usage patterns
   */
  private cleanupPatterns(): void {
    const now = Date.now();
    const cutoff = now - this.config.analysisWindow;

    for (const [resource, pattern] of this.usagePatterns.entries()) {
      if (pattern.lastAccess < cutoff) {
        this.usagePatterns.delete(resource);
      }
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.prefetchHits + this.stats.totalPrefetches;
    this.stats.hitRate = total > 0 ? (this.stats.prefetchHits / total) * 100 : 0;
  }

  /**
   * Update average prefetch time
   */
  private updateAveragePrefetchTime(newTime: number): void {
    if (this.stats.successfulPrefetches === 1) {
      this.stats.averagePrefetchTime = newTime;
    } else {
      const total =
        this.stats.averagePrefetchTime * (this.stats.successfulPrefetches - 1) + newTime;
      this.stats.averagePrefetchTime = total / this.stats.successfulPrefetches;
    }
  }
}

/**
 * Global intelligent prefetcher instance
 */
let globalPrefetcher: IntelligentPrefetcher | null = null;

/**
 * Initialize global prefetcher
 */
export function initializePrefetcher(
  queryClient: QueryClient,
  config?: Partial<PrefetchConfig>
): void {
  globalPrefetcher = new IntelligentPrefetcher(queryClient, config);
}

/**
 * Get global prefetcher instance
 */
export function getPrefetcher(): IntelligentPrefetcher {
  if (!globalPrefetcher) {
    throw new Error('Prefetcher not initialized. Call initializePrefetcher first.');
  }
  return globalPrefetcher;
}

/**
 * Utility functions for common prefetch patterns
 */

/**
 * Prefetch complaint details when hovering over complaint list items
 */
export function usePrefetchComplaintOnHover() {
  return (complaintId: string, element: HTMLElement) => {
    const prefetcher = getPrefetcher();
    return prefetcher.prefetchOnHover(
      ['complaint', complaintId],
      () => import('@/lib/api/complaints').then((api) => api.getComplaintById(complaintId)),
      element
    );
  };
}

/**
 * Prefetch user data when accessing user-related pages
 */
export function prefetchUserData(userId: string): void {
  const prefetcher = getPrefetcher();

  // Record access pattern
  prefetcher.recordAccess(`user-${userId}`, [
    `user-complaints-${userId}`,
    `user-stats-${userId}`,
    `user-drafts-${userId}`,
  ]);

  // Prefetch related data
  prefetcher.prefetch(
    ['complaints', 'user', userId],
    () => import('@/lib/api/complaints').then((api) => api.getUserComplaints(userId)),
    { priority: 2, confidence: 0.8 }
  );

  prefetcher.prefetch(
    ['complaints', 'stats', userId],
    () => import('@/lib/api/complaints').then((api) => api.getUserComplaintStats(userId)),
    { priority: 1, confidence: 0.7 }
  );
}

/**
 * Prefetch notifications when user is likely to check them
 */
export function prefetchNotifications(userId: string): void {
  const prefetcher = getPrefetcher();

  prefetcher.recordAccess(`notifications-${userId}`);

  prefetcher.prefetch(
    ['notifications', userId],
    () => import('@/lib/api/notifications').then((api) => api.fetchNotifications(10)),
    { priority: 3, confidence: 0.9 }
  );
}
