import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Loading Component
 * 
 * Displays a loading spinner with optional text.
 * Can be used inline or as a full-screen overlay.
 * 
 * @param size - Size of the spinner (sm, md, lg)
 * @param text - Optional loading text to display
 * @param className - Additional CSS classes
 * @param fullScreen - Whether to display as full-screen overlay
 */
export function Loading({
  size = 'md',
  text,
  className,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const content = (
    <div className={cn('text-center', className)}>
      <Loader2
        className={cn(
          'animate-spin text-foreground',
          sizeClasses[size],
          text ? 'mx-auto' : ''
        )}
      />
      {text && (
        <p
          className={cn(
            'mt-4 text-muted-foreground',
            textSizeClasses[size]
          )}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Loading Skeleton Component
 * 
 * Displays a skeleton loading placeholder for content.
 */
export function LoadingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

/**
 * Loading Spinner Component (inline)
 * 
 * Small inline spinner for buttons and inline elements.
 */
export function LoadingSpinner({
  className,
  size = 'sm',
}: {
  className?: string;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-foreground',
        sizeClasses[size],
        className
      )}
    />
  );
}
