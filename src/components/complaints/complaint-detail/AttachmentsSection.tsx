'use client';

import * as React from 'react';
import { FileText, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ComplaintAttachment } from '@/types/database.types';
import { getFileIcon, getFileTypeLabel, formatFileSize, formatRelativeTime } from './utils';

interface AttachmentsSectionProps {
  attachments: ComplaintAttachment[];
}

/**
 * Attachments Component
 * Displays file attachments with download and preview functionality
 */
export function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = (attachment: ComplaintAttachment) => {
    // Mock download - in real implementation, this would download from Supabase Storage
    console.log('Downloading:', attachment.file_name);

    // In Phase 12, this will be replaced with actual Supabase Storage download:
    // const { data, error } = await supabase.storage
    //   .from('complaint-attachments')
    //   .download(attachment.file_path);
    // if (data) {
    //   const url = URL.createObjectURL(data);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = attachment.file_name;
    //   a.click();
    //   URL.revokeObjectURL(url);
    // }

    alert(`Download functionality will be implemented in Phase 12: ${attachment.file_name}`);
  };

  const handlePreview = (attachment: ComplaintAttachment) => {
    // Mock preview - in real implementation, this would open a preview modal
    console.log('Previewing:', attachment.file_name);
    alert(`Preview functionality will be implemented in Phase 12: ${attachment.file_name}`);
  };

  const handleDownloadAll = () => {
    console.log('Downloading all attachments');
    alert('Download all functionality will be implemented in Phase 12');
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
        <FileText className="h-5 w-5" />
        Attachments ({attachments.length})
      </h2>

      <div className="space-y-3">
        {attachments.map((attachment) => {
          const isImage = attachment.file_type.startsWith('image/');

          return (
            <div
              key={attachment.id}
              className="group flex items-center gap-3 rounded-lg border border-border bg-muted p-4 transition-colors hover:bg-muted/80"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">{getFileIcon(attachment.file_type)}</div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {attachment.file_name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{getFileTypeLabel(attachment.file_type)}</span>
                  <span>•</span>
                  <span>{formatFileSize(attachment.file_size)}</span>
                  <span>•</span>
                  <span>Uploaded {formatRelativeTime(attachment.created_at)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {isImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(attachment)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    title="Preview image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download All Button (if multiple attachments) */}
      {attachments.length > 1 && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <Download className="mr-2 h-4 w-4" />
            Download All ({attachments.length})
          </Button>
        </div>
      )}
    </div>
  );
}
