'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { MAX_DESCRIPTION_LENGTH, type FormErrors } from './types';

interface DescriptionFieldProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/**
 * Description Field Component
 * Rich text editor for complaint description
 */
export function DescriptionField({ value, error, onChange }: DescriptionFieldProps) {
  return (
    <div>
      <Label htmlFor="description">
        Description <span className="text-destructive">*</span>
      </Label>
      <div className="mt-2">
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder="Provide detailed information about your complaint..."
          maxLength={MAX_DESCRIPTION_LENGTH}
          error={!!error}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="ml-auto text-xs text-muted-foreground">
          {value.length}/{MAX_DESCRIPTION_LENGTH}
        </p>
      </div>
    </div>
  );
}
