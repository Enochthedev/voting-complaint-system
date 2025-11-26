'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel?: () => void;
  onSaveDraft: () => void;
  isLoading: boolean;
  isSavingDraft: boolean;
}

export function FormActions({ onCancel, onSaveDraft, isLoading, isSavingDraft }: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isSavingDraft}
        >
          Cancel
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={onSaveDraft}
        disabled={isLoading || isSavingDraft}
      >
        {isSavingDraft ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Draft...
          </>
        ) : (
          'Save as Draft'
        )}
      </Button>
      <Button type="submit" disabled={isLoading || isSavingDraft}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Complaint'
        )}
      </Button>
    </div>
  );
}
