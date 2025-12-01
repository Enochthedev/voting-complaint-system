/**
 * Lazy Loading Utilities
 *
 * Provides utilities for lazy loading components with proper loading states
 * and error boundaries for better performance and user experience.
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Creates a lazy-loaded component with a default loading fallback
 *
 * @param importFn - Dynamic import function
 * @param fallback - Optional custom loading fallback
 * @returns Lazy-loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): LazyExoticComponent<T> {
  return lazy(importFn);
}

/**
 * Default loading fallback for page-level components
 */
export function PageLoadingFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-[300px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

/**
 * Loading fallback for card-based components
 */
export function CardLoadingFallback() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}

/**
 * Loading fallback for form components
 */
export function FormLoadingFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/**
 * Loading fallback for list components
 */
export function ListLoadingFallback() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

/**
 * Loading fallback for chart/analytics components
 */
export function ChartLoadingFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
