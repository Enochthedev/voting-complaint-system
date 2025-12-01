/**
 * Lazy Image Component
 *
 * A wrapper around Next.js Image component with lazy loading,
 * blur placeholder, and error handling for better performance.
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Skeleton } from './skeleton';
import { AlertCircle } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 75,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={
          !fill && width && height ? { width: `${width}px`, height: `${height}px` } : undefined
        }
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="h-8 w-8" />
          <span className="text-xs">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {isLoading && (
        <Skeleton
          className={`absolute inset-0 ${className}`}
          style={
            !fill && width && height ? { width: `${width}px`, height: `${height}px` } : undefined
          }
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={className}
        priority={priority}
        quality={quality}
        sizes={sizes}
        style={{ objectFit }}
        loading={priority ? undefined : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=="
      />
    </div>
  );
}

/**
 * Lazy Avatar Image Component
 * Optimized for user avatars with circular shape
 */
export function LazyAvatarImage({
  src,
  alt,
  size = 40,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority={priority}
      quality={90}
      objectFit="cover"
    />
  );
}

/**
 * Lazy Thumbnail Image Component
 * Optimized for file previews and thumbnails
 */
export function LazyThumbnail({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fill
      className={`rounded-lg ${className}`}
      priority={priority}
      quality={60}
      objectFit="cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
