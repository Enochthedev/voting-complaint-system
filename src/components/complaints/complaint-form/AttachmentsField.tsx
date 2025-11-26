'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';

interface AttachmentsFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
}

/**
 * Attachments Field Component
 * File upload component for complaint attachments
 */
export function AttachmentsField({ files, onChange }: AttachmentsFieldProps) {
  const handleFilesSelected = (newFiles: File[]) => {
    onChange([...files, ...newFiles]);
  };

  const handleFileRemove = (fileToRemove: File) => {
    onChange(files.filter((f) => f !== fileToRemove));
  };

  return (
    <div>
      <Label>Attachments (optional)</Label>
      <div className="mt-2">
        <FileUpload
          files={files}
          onFilesSelected={handleFilesSelected}
          onFileRemove={handleFileRemove}
          maxFiles={5}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Upload images, PDFs, or documents (max 5 files, 10MB each)
      </p>
    </div>
  );
}
