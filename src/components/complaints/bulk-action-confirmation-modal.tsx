'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

export interface BulkActionConfirmationModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when modal is closed
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Title of the action
   */
  title: string;

  /**
   * Description of the action
   */
  description: string;

  /**
   * Number of items affected
   */
  itemCount: number;

  /**
   * Action type for styling
   */
  actionType?: 'default' | 'destructive';

  /**
   * Confirm button text
   */
  confirmText?: string;

  /**
   * Cancel button text
   */
  cancelText?: string;

  /**
   * Callback when action is confirmed
   */
  onConfirm: () => void;

  /**
   * Whether the action is in progress
   */
  isLoading?: boolean;
}

/**
 * BulkActionConfirmationModal Component
 *
 * Displays a confirmation dialog before executing bulk actions
 * to prevent accidental operations on multiple items.
 */
export function BulkActionConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  itemCount,
  actionType = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
}: BulkActionConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    // Don't close automatically - let the parent handle it after action completes
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">{description}</AlertDialogDescription>
              <div className="mt-3 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground">
                  This action will affect{' '}
                  <span className="font-bold text-foreground">
                    {itemCount} {itemCount === 1 ? 'complaint' : 'complaints'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              actionType === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
