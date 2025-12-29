/**
 * Enhanced virtual scrolling system for large dataset optimization
 *
 * Provides advanced virtual scrolling with intelligent buffering,
 * dynamic item sizing, and performance monitoring.
 */

import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

/**
 * Enhanced virtual scrolling configuration
 */
export interface EnhancedVirtualConfig {
  /** Enable/disable virtual scrolling */
  enabled: boolean;
  /** Estimated item size for initial rendering */
  estimateSize: number;
  /** Number of items to render outside visible area */
  overscan: number;
  /** Enable dynamic sizing based on content */
  dynamicSizing: boolean;
  /** Scroll behavior configuration */
  scrollBehavior: {
    /** Smooth scrolling */
    smooth: boolean;
    /** Scroll margin for better UX */
    scrollMargin: number;
  };
  /** Performance monitoring */
  monitoring: {
    /** Enable performance tracking */
    enabled: boolean;
    /** Sample rate for performance measurements (0-1) */
    sampleRate: number;
  };
  /** Buffering strategy */
  buffering: {
    /** Enable intelligent buffering */
    enabled: boolean;
    /** Buffer size multiplier */
    multiplier: number;
    /** Preload threshold (0-1) */
    preloadThreshold: number;
  };
}

/**
 * Virtual scrolling performance metrics
 */
export interface VirtualScrollingMetrics {
  /** Average render time per frame (ms) */
  averageRenderTime: number;
  /** Frame rate (FPS) */
  frameRate: number;
  /** Memory usage estimate (bytes) */
  memoryUsage: number;
  /** Number of rendered items */
  renderedItems: number;
  /** Total items in dataset */
  totalItems: number;
  /** Scroll performance score (0-100) */
  performanceScore: number;
  /** Buffer hit rate (%) */
  bufferHitRate: number;
}

/**
 * Virtual item with enhanced metadata
 */
export interface EnhancedVirtualItem extends VirtualItem {
  /** Whether item is in buffer zone */
  isBuffered: boolean;
  /** Item priority for rendering */
  priority: number;
  /** Estimated or measured size */
  measuredSize?: number;
}

/**
 * Enhanced virtual scrolling hook
 */
export function useEnhancedVirtualScrolling<T>({
  items,
  containerRef,
  config,
  getItemId,
  onItemsChange,
}: {
  items: T[];
  containerRef: React.RefObject<HTMLElement>;
  config: Partial<EnhancedVirtualConfig>;
  getItemId?: (item: T, index: number) => string;
  onItemsChange?: (visibleItems: T[], bufferedItems: T[]) => void;
}) {
  const fullConfig: EnhancedVirtualConfig = {
    enabled: true,
    estimateSize: 50,
    overscan: 5,
    dynamicSizing: true,
    scrollBehavior: {
      smooth: true,
      scrollMargin: 10,
    },
    monitoring: {
      enabled: true,
      sampleRate: 0.1,
    },
    buffering: {
      enabled: true,
      multiplier: 2,
      preloadThreshold: 0.8,
    },
    ...config,
  };

  const [metrics, setMetrics] = useState<VirtualScrollingMetrics>({
    averageRenderTime: 0,
    frameRate: 60,
    memoryUsage: 0,
    renderedItems: 0,
    totalItems: items.length,
    performanceScore: 100,
    bufferHitRate: 100,
  });

  const performanceRef = useRef({
    renderTimes: [] as number[],
    lastFrameTime: performance.now(),
    bufferHits: 0,
    bufferMisses: 0,
  });

  // Item size cache for dynamic sizing
  const itemSizeCache = useRef(new Map<string, number>());

  // Estimate item size with caching
  const estimateSize = useCallback(
    (index: number) => {
      if (!fullConfig.dynamicSizing) {
        return fullConfig.estimateSize;
      }

      const item = items[index];
      const itemId = getItemId ? getItemId(item, index) : index.toString();
      const cachedSize = itemSizeCache.current.get(itemId);

      if (cachedSize) {
        return cachedSize;
      }

      // Estimate based on content if possible
      if (typeof item === 'object' && item !== null) {
        const content = JSON.stringify(item);
        const estimatedSize = Math.max(
          fullConfig.estimateSize,
          Math.min(content.length * 0.5, fullConfig.estimateSize * 3)
        );
        return estimatedSize;
      }

      return fullConfig.estimateSize;
    },
    [items, fullConfig.estimateSize, fullConfig.dynamicSizing, getItemId]
  );

  // Create virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize,
    overscan: fullConfig.overscan,
    measureElement: fullConfig.dynamicSizing
      ? (element, entry) => {
          // Cache measured size
          const index = entry.index;
          const item = items[index];
          const itemId = getItemId ? getItemId(item, index) : index.toString();
          const size = element.getBoundingClientRect().height;
          itemSizeCache.current.set(itemId, size);
          return size;
        }
      : undefined,
  });

  // Enhanced virtual items with metadata
  const enhancedVirtualItems = useMemo((): EnhancedVirtualItem[] => {
    const visibleRange = virtualizer.getVirtualItems();
    const bufferSize = Math.floor(visibleRange.length * fullConfig.buffering.multiplier);
    
    return visibleRange.map((item, index) => {
      const isInBuffer = index < bufferSize || index >= visibleRange.length - bufferSize;
      const priority = isInBuffer ? 1 : Math.max(0, 1 - Math.abs(index - visibleRange.length / 2) / visibleRange.length);
      
      return {
        ...item,
        isBuffered: isInBuffer,
        priority,
        measuredSize: itemSizeCache.current.get(
          getItemId ? getItemId(items[item.index], item.index) : item.index.toString()
        ),
      };
    });
  }, [virtualizer, items, fullConfig.buffering.multiplier, getItemId]);

  // Performance monitoring
  useEffect(() => {
    if (!fullConfig.monitoring.enabled) return;

    const measurePerformance = () => {
      const now = performance.now();
      const frameTime = now - performanceRef.current.lastFrameTime;
      performanceRef.current.lastFrameTime = now;

      // Sample performance data
      if (Math.random() < fullConfig.monitoring.sampleRate) {
        performanceRef.current.renderTimes.push(frameTime);
        
        // Keep only recent measurements
        if (performanceRef.current.renderTimes.length > 100) {
          performanceRef.current.renderTimes.shift();
        }

        // Update metrics
        const avgRenderTime = performanceRef.current.renderTimes.reduce((a, b) => a + b, 0) / 
          performanceRef.current.renderTimes.length;
        
        const frameRate = 1000 / avgRenderTime;
        const bufferHitRate = performanceRef.current.bufferHits / 
          (performanceRef.current.bufferHits + performanceRef.current.bufferMisses) * 100;

        setMetrics(prev => ({
          ...prev,
          averageRenderTime: avgRenderTime,
          frameRate: Math.min(frameRate, 60),
          renderedItems: enhancedVirtualItems.length,
          totalItems: items.length,
          performanceScore: Math.max(0, 100 - (avgRenderTime - 16.67) * 2), // 60fps = 16.67ms per frame
          bufferHitRate: isNaN(bufferHitRate) ? 100 : bufferHitRate,
        }));
      }

      requestAnimationFrame(measurePerformance);
    };

    const animationId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(animationId);
  }, [fullConfig.monitoring.enabled, fullConfig.monitoring.sampleRate, enhancedVirtualItems.length, items.length]);

  // Notify about visible items changes
  useEffect(() => {
    if (onItemsChange) {
      const visibleItems = enhancedVirtualItems
        .filter(item => !item.isBuffered)
        .map(item => items[item.index]);
      
      const bufferedItems = enhancedVirtualItems
        .filter(item => item.isBuffered)
        .map(item => items[item.index]);

      onItemsChange(visibleItems, bufferedItems);
    }
  }, [enhancedVirtualItems, items, onItemsChange]);

  // Intelligent preloading
  const checkPreloading = useCallback(() => {
    if (!fullConfig.buffering.enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= fullConfig.buffering.preloadThreshold) {
      // Trigger preloading of next items
      performanceRef.current.bufferHits++;
    } else {
      performanceRef.current.bufferMisses++;
    }
  }, [fullConfig.buffering.enabled, fullConfig.buffering.preloadThreshold]);

  // Scroll event handler with preloading
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !fullConfig.buffering.enabled) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkPreloading();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [checkPreloading, fullConfig.buffering.enabled]);

  // Scroll to item with smooth behavior
  const scrollToItem = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end'; smooth?: boolean }) => {
      const { align = 'start', smooth = fullConfig.scrollBehavior.smooth } = options || {};
      
      virtualizer.scrollToIndex(index, {
        align,
        behavior: smooth ? 'smooth' : 'auto',
      });
    },
    [virtualizer, fullConfig.scrollBehavior.smooth]
  );

  // Get item at position
  const getItemAtPosition = useCallback(
    (y: number): { item: T; index: number } | null => {
      const virtualItems = virtualizer.getVirtualItems();
      const foundItem = virtualItems.find(
        item => y >= item.start && y <= item.end
      );
      
      if (foundItem) {
        return {
          item: items[foundItem.index],
          index: foundItem.index,
        };
      }
      
      return null;
    },
    [virtualizer, items]
  );

  // Optimize for large datasets
  const optimizeForLargeDataset = useCallback(() => {
    if (items.length > 10000) {
      // Reduce overscan for very large datasets
      return {
        ...fullConfig,
        overscan: Math.max(2, Math.floor(fullConfig.overscan / 2)),
        buffering: {
          ...fullConfig.buffering,
          multiplier: Math.max(1.5, fullConfig.buffering.multiplier * 0.8),
        },
      };
    }
    return fullConfig;
  }, [items.length, fullConfig]);

  return {
    virtualizer,
    virtualItems: enhancedVirtualItems,
    metrics,
    scrollToItem,
    getItemAtPosition,
    optimizeForLargeDataset,
    
    // Utility methods
    getTotalSize: () => virtualizer.getTotalSize(),
    getVirtualItems: () => virtualizer.getVirtualItems(),
    scrollToOffset: (offset: number, options?: { align?: 'start' | 'center' | 'end' }) => 
      virtualizer.scrollToOffset(offset, options),
    
    // Performance helpers
    clearSizeCache: () => itemSizeCache.current.clear(),
    resetMetrics: () => {
      performanceRef.current.renderTimes = [];
      performanceRef.current.bufferHits = 0;
      performanceRef.current.bufferMisses = 0;
      setMetrics(prev => ({
        ...prev,
        averageRenderTime: 0,
        frameRate: 60,
        performanceScore: 100,
        bufferHitRate: 100,
      }));
    },
  };
}

/**
 * Virtual scrolling component wrapper
 */
export function VirtualScrollContainer<T>({
  items,
  renderItem,
  config,
  className,
  style,
  getItemId,
  onItemsChange,
  children,
}: {
  items: T[];
  renderItem: (item: T, index: number, virtualItem: EnhancedVirtualItem) => React.ReactNode;
  config?: Partial<EnhancedVirtualConfig>;
  className?: string;
  style?: React.CSSProperties;
  getItemId?: (item: T, index: number) => string;
  onItemsChange?: (visibleItems: T[], bufferedItems: T[]) => void;
  children?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    virtualizer,
    virtualItems,
    metrics,
  } = useEnhancedVirtualScrolling({
    items,
    containerRef,
    config: config || {},
    getItemId,
    onItemsChange,
  });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '400px',
        overflow: 'auto',
        ...style,
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index, virtualItem)}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

/**
 * Performance monitoring component
 */
export function VirtualScrollingMonitor({ metrics }: { metrics: VirtualScrollingMetrics }) {
  return (
    <div className="virtual-scrolling-monitor" style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
    }}>
      <div>FPS: {metrics.frameRate.toFixed(1)}</div>
      <div>Render Time: {metrics.averageRenderTime.toFixed(2)}ms</div>
      <div>Items: {metrics.renderedItems}/{metrics.totalItems}</div>
      <div>Performance: {metrics.performanceScore.toFixed(0)}/100</div>
      <div>Buffer Hit Rate: {metrics.bufferHitRate.toFixed(1)}%</div>
    </div>
  );
}

/**
 * Hook for virtual scrolling with automatic optimization
 */
export function useAutoOptimizedVirtualScrolling<T>(
  items: T[],
  containerRef: React.RefObject<HTMLElement>,
  baseConfig: Partial<EnhancedVirtualConfig> = {}
) {
  const [optimizedConfig, setOptimizedConfig] = useState(baseConfig);

  // Auto-optimize based on dataset size and performance
  useEffect(() => {
    const itemCount = items.length;
    let newConfig = { ...baseConfig };

    // Optimize for different dataset sizes
    if (itemCount > 50000) {
      // Very large dataset
      newConfig = {
        ...newConfig,
        overscan: 2,
        buffering: {
          enabled: true,
          multiplier: 1.5,
          preloadThreshold: 0.9,
        },
        monitoring: {
          enabled: true,
          sampleRate: 0.05, // Lower sample rate for performance
        },
      };
    } else if (itemCount > 10000) {
      // Large dataset
      newConfig = {
        ...newConfig,
        overscan: 3,
        buffering: {
          enabled: true,
          multiplier: 2,
          preloadThreshold: 0.8,
        },
      };
    } else if (itemCount > 1000) {
      // Medium dataset
      newConfig = {
        ...newConfig,
        overscan: 5,
        buffering: {
          enabled: true,
          multiplier: 2.5,
          preloadThreshold: 0.7,
        },
      };
    }

    setOptimizedConfig(newConfig);
  }, [items.length, baseConfig]);

  return useEnhancedVirtualScrolling({
    items,
    containerRef,
    config: optimizedConfig,
  });
}