/**
 * Progress Component
 * A visual progress indicator for showing task completion
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value?: number;

  /**
   * Optional label to display above the progress bar
   */
  label?: string;

  /**
   * Whether to show the percentage value
   */
  showValue?: boolean;

  /**
   * Size variant
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Color variant
   */
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      label,
      showValue = false,
      size = 'default',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const sizeClasses = {
      sm: 'h-1',
      default: 'h-2',
      lg: 'h-3',
    };

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(label || showValue) && (
          <div className="mb-2 flex items-center justify-between text-sm">
            {label && <span className="text-muted-foreground">{label}</span>}
            {showValue && (
              <span className="font-medium text-foreground">{Math.round(clampedValue)}%</span>
            )}
          </div>
        )}
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-secondary',
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              variantClasses[variant]
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
