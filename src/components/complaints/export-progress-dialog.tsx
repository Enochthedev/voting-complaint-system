/**
 * Export Progress Dialog Component
 * Shows a modal dialog with progress indicator during export operations
 * Validates: Requirements AC20 (Export Functionality)
 */

'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ExportProgressDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when dialog should close
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Current progress (0-100)
   */
  progress: number;

  /**
   * Current status message
   */
  message: string;

  /**
   * Export status
   */
  status: 'idle' | 'exporting' | 'success' | 'error';

  /**
   * Error message if status is 'error'
   */
  error?: string;

  /**
   * Title of the export operation
   */
  title?: string;

  /**
   * Callback when user clicks "Close" button
   */
  onClose?: () => void;
}

/**
 * Export Progress Dialog Component
 *
 * Displays a modal dialog showing export progress with:
 * - Progress bar
 * - Status message
 * - Success/error states
 */
export function ExportProgressDialog({
  open,
  onOpenChange,
  progress,
  message,
  status,
  error,
  title = 'Exporting',
  onClose,
}: ExportProgressDialogProps) {
  const handleClose = () => {
    if (status !== 'exporting') {
      onClose?.();
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={status !== 'exporting' ? onOpenChange : undefined}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => {
          // Prevent closing while exporting
          if (status === 'exporting') {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing while exporting
          if (status === 'exporting') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {status === 'exporting' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            {title}
          </DialogTitle>
          <DialogDescription>
            {status === 'exporting' && 'Please wait while we prepare your export...'}
            {status === 'success' && 'Your export has been completed successfully.'}
            {status === 'error' && 'An error occurred during export.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          {status === 'exporting' && (
            <Progress
              value={progress}
              showValue
              size="default"
              variant="default"
              className="w-full"
            />
          )}

          {/* Status Message */}
          <div
            className={cn(
              'rounded-md p-3 text-sm',
              status === 'exporting' && 'bg-muted',
              status === 'success' &&
                'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
              status === 'error' && 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
            )}
          >
            {status === 'error' && error ? error : message}
          </div>

          {/* Success State - Additional Info */}
          {status === 'success' && (
            <div className="text-sm text-muted-foreground">
              Your file has been downloaded to your default downloads folder.
            </div>
          )}

          {/* Action Buttons */}
          {status !== 'exporting' && (
            <div className="flex justify-end gap-2">
              <Button onClick={handleClose} variant="default">
                Close
              </Button>
            </div>
          )}

          {/* Exporting State - Info */}
          {status === 'exporting' && (
            <div className="text-xs text-muted-foreground">
              Please do not close this window or navigate away.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
