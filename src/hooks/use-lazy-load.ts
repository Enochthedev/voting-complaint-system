/**
 * useLazyLoad Hook
 *
 * Custom hook for lazy loading content using Intersection Observer API.
 * Provides a simple way to defer loading of components until they're needed.
 */

'use client';

import { useState, useEffect, useRef, RefObject } from 'react';
import { LAZY_LOADING_CONFIG } from '@/lib/config/lazy-loading.config';

interface UseLazyLoadOptions {
  /**
   * Root margin for intersection observer
   * @default '50px'
   */
  rootMargin?: string;

  /**
   * Threshold for intersection observer
   * @default 0.1
   */
  threshold?: number;

  /**
   * Whether to disconnect observer after first intersection
   * @default true
   */
  once?: boolean;

  /**
   * Callback when element comes into view
   */
  onIntersect?: () => void;
}

/**
 * Hook to detect when an element comes into view
 *
 * @param options - Configuration options
 * @returns Object with ref to attach to element and isInView state
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseLazyLoadOptions = {}
): {
  ref: RefObject<T | null>;
  isInView: boolean;
} {
  const {
    rootMargin = LAZY_LOADING_CONFIG.intersectionObserver.rootMargin,
    threshold = LAZY_LOADING_CONFIG.intersectionObserver.threshold,
    once = true,
    onIntersect,
  } = options;

  const [isInView, setIsInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            onIntersect?.();

            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setIsInView(false);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, once, onIntersect]);

  return { ref, isInView };
}

/**
 * Hook for lazy loading images
 *
 * @param src - Image source URL
 * @param options - Configuration options
 * @returns Object with image loading state and handlers
 */
export function useLazyImage(
  src: string,
  options: UseLazyLoadOptions = {}
): {
  ref: RefObject<HTMLImageElement | null>;
  isInView: boolean;
  isLoaded: boolean;
  hasError: boolean;
  imageSrc: string | undefined;
} {
  const { ref, isInView } = useLazyLoad<HTMLImageElement>(options);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageSrc = isInView ? src : undefined;

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setIsLoaded(false);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView]);

  return {
    ref,
    isInView,
    isLoaded,
    hasError,
    imageSrc,
  };
}

/**
 * Hook for lazy loading with retry logic
 *
 * @param loadFn - Function to execute when element comes into view
 * @param options - Configuration options
 * @returns Object with ref, loading state, and retry function
 */
export function useLazyLoadWithRetry<T extends HTMLElement = HTMLDivElement>(
  loadFn: () => Promise<void>,
  options: UseLazyLoadOptions = {}
): {
  ref: RefObject<T | null>;
  isInView: boolean;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
} {
  const { ref, isInView } = useLazyLoad<T>(options);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const load = async () => {
    if (!isInView) return;

    setIsLoading(true);
    setHasError(false);

    try {
      await loadFn();
      setIsLoading(false);
    } catch (error) {
      console.error('Lazy load error:', error);
      setHasError(true);
      setIsLoading(false);

      // Auto-retry with exponential backoff
      if (retryCount < LAZY_LOADING_CONFIG.performance.retry.maxAttempts) {
        const delay =
          LAZY_LOADING_CONFIG.performance.retry.delay *
          Math.pow(LAZY_LOADING_CONFIG.performance.retry.backoff, retryCount);

        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, delay);
      }
    }
  };

  useEffect(() => {
    load();
  }, [isInView, retryCount]);

  const retry = () => {
    setRetryCount(0);
    load();
  };

  return {
    ref,
    isInView,
    isLoading,
    hasError,
    retry,
  };
}

/**
 * Hook for prefetching routes on hover
 *
 * @param href - Route to prefetch
 * @returns Hover handlers
 */
export function usePrefetchOnHover(href: string) {
  const [isPrefetched, setIsPrefetched] = useState(false);

  const handleMouseEnter = () => {
    if (!isPrefetched && LAZY_LOADING_CONFIG.routes.prefetchOnHover.includes(href as any)) {
      // Prefetch the route
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
      setIsPrefetched(true);
    }
  };

  return {
    onMouseEnter: handleMouseEnter,
  };
}
