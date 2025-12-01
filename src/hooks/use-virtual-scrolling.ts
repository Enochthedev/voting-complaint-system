import { useMemo } from 'react';

/**
 * Configuration for virtual scrolling behavior
 */
export interface VirtualScrollingConfig {
  /**
   * Minimum number of items before virtual scrolling is enabled
   * @default 50
   */
  threshold?: number;
  /**
   * Force virtual scrolling regardless of item count
   * @default false
   */
  forceVirtual?: boolean;
  /**
   * Disable virtual scrolling regardless of item count
   * @default false
   */
  disableVirtual?: boolean;
}

/**
 * Hook to determine whether to use virtual scrolling based on item count
 *
 * Virtual scrolling is beneficial for large lists (typically 50+ items) as it:
 * - Only renders visible items in the viewport
 * - Reduces DOM nodes and memory usage
 * - Improves scroll performance
 * - Maintains smooth interactions even with thousands of items
 *
 * @param itemCount - Number of items in the list
 * @param config - Configuration options
 * @returns Whether virtual scrolling should be used
 *
 * @example
 * ```tsx
 * const shouldUseVirtual = useVirtualScrolling(complaints.length);
 *
 * return shouldUseVirtual ? (
 *   <ComplaintListVirtualized complaints={complaints} />
 * ) : (
 *   <ComplaintList complaints={complaints} />
 * );
 * ```
 */
export function useVirtualScrolling(
  itemCount: number,
  config: VirtualScrollingConfig = {}
): boolean {
  const { threshold = 50, forceVirtual = false, disableVirtual = false } = config;

  return useMemo(() => {
    // If explicitly disabled, never use virtual scrolling
    if (disableVirtual) {
      return false;
    }

    // If explicitly forced, always use virtual scrolling
    if (forceVirtual) {
      return true;
    }

    // Use virtual scrolling if item count exceeds threshold
    return itemCount >= threshold;
  }, [itemCount, threshold, forceVirtual, disableVirtual]);
}

/**
 * Get recommended container height based on viewport and available space
 *
 * @param defaultHeight - Default height in pixels
 * @param maxViewportPercentage - Maximum percentage of viewport height to use (0-1)
 * @returns Recommended container height in pixels
 *
 * @example
 * ```tsx
 * const containerHeight = useContainerHeight(600, 0.7);
 * ```
 */
export function useContainerHeight(
  defaultHeight: number = 600,
  maxViewportPercentage: number = 0.7
): number {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return defaultHeight;
    }

    const viewportHeight = window.innerHeight;
    const maxHeight = viewportHeight * maxViewportPercentage;

    return Math.min(defaultHeight, maxHeight);
  }, [defaultHeight, maxViewportPercentage]);
}
