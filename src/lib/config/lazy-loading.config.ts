/**
 * Lazy Loading Configuration
 *
 * Central configuration for lazy loading behavior across the application.
 * Defines which components should be lazy loaded and their loading strategies.
 */

export const LAZY_LOADING_CONFIG = {
  // Intersection Observer options for lazy loading
  intersectionObserver: {
    rootMargin: '50px', // Start loading 50px before element comes into view
    threshold: 0.1, // Trigger when 10% of element is visible
  },

  // Image lazy loading configuration
  images: {
    quality: {
      thumbnail: 60,
      preview: 75,
      full: 90,
    },
    placeholder: {
      blur: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==',
    },
    sizes: {
      thumbnail: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      preview: '(max-width: 768px) 100vw, 50vw',
      full: '100vw',
    },
  },

  // Component lazy loading priorities
  components: {
    // Critical components - load immediately
    critical: ['AppLayout', 'AppHeader', 'AppSidebar', 'Button', 'Input', 'Card'],

    // High priority - lazy load with high priority
    highPriority: ['ComplaintForm', 'ComplaintDetailView', 'NotificationBell'],

    // Medium priority - lazy load normally
    mediumPriority: [
      'ComplaintsFilters',
      'ComplaintsGrid',
      'BulkActionBar',
      'VoteCard',
      'AnnouncementCard',
    ],

    // Low priority - lazy load with low priority (below fold)
    lowPriority: [
      'AnalyticsCharts',
      'LecturerPerformanceTable',
      'ComplaintHistory',
      'CommentSection',
    ],
  },

  // Route-based code splitting
  routes: {
    // Routes that should prefetch on hover
    prefetchOnHover: ['/complaints', '/dashboard', '/notifications'],

    // Routes that should prefetch on mount
    prefetchOnMount: ['/complaints/new'],

    // Routes that should not prefetch
    noPrefetch: ['/analytics', '/admin', '/settings'],
  },

  // File attachment lazy loading
  attachments: {
    // File types that should show preview
    previewTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],

    // Maximum file size for inline preview (in bytes)
    maxPreviewSize: 5 * 1024 * 1024, // 5MB

    // Thumbnail generation settings
    thumbnail: {
      width: 200,
      height: 200,
      quality: 60,
    },
  },

  // Performance budgets
  performance: {
    // Maximum time to wait for lazy loaded component (ms)
    maxLoadTime: 3000,

    // Maximum number of concurrent lazy loads
    maxConcurrentLoads: 3,

    // Retry configuration for failed loads
    retry: {
      maxAttempts: 3,
      delay: 1000, // ms
      backoff: 2, // exponential backoff multiplier
    },
  },
} as const;

/**
 * Helper function to check if a file type should show preview
 */
export function shouldShowPreview(fileType: string, fileSize?: number): boolean {
  const isPreviewType = LAZY_LOADING_CONFIG.attachments.previewTypes.includes(fileType as any);
  const isWithinSizeLimit = !fileSize || fileSize <= LAZY_LOADING_CONFIG.attachments.maxPreviewSize;
  return isPreviewType && isWithinSizeLimit;
}

/**
 * Helper function to get image quality based on usage
 */
export function getImageQuality(usage: 'thumbnail' | 'preview' | 'full'): number {
  return LAZY_LOADING_CONFIG.images.quality[usage];
}

/**
 * Helper function to get image sizes attribute
 */
export function getImageSizes(usage: 'thumbnail' | 'preview' | 'full'): string {
  return LAZY_LOADING_CONFIG.images.sizes[usage];
}
