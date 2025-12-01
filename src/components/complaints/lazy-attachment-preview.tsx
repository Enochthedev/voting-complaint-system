/**
 * Lazy Attachment Preview Component
 *
 * Lazy loads attachment previews (images, PDFs) only when they come into view
 * using Intersection Observer API for better performance.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { LazyImage } from '@/components/ui/lazy-image';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentPreviewProps {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  onDownload?: () => void;
  onPreview?: () => void;
}

export function LazyAttachmentPreview({
  id,
  fileName,
  fileUrl,
  fileType,
  fileSize,
  onDownload,
  onPreview,
}: AttachmentPreviewProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before element comes into view
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md"
    >
      {/* Preview Area */}
      <div className="relative aspect-video w-full bg-muted">
        {!isInView ? (
          <Skeleton className="h-full w-full" />
        ) : isImage ? (
          <LazyImage
            src={fileUrl}
            alt={fileName}
            fill
            className="object-cover"
            onLoad={() => setIsLoading(false)}
          />
        ) : isPDF ? (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          {onPreview && (
            <Button size="sm" variant="secondary" onClick={onPreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          )}
          {onDownload && (
            <Button size="sm" variant="secondary" onClick={onDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-foreground" title={fileName}>
          {fileName}
        </p>
        {fileSize && <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>}
      </div>
    </div>
  );
}

/**
 * Lazy Attachment List Component
 * Renders a grid of lazy-loaded attachment previews
 */
export function LazyAttachmentList({
  attachments,
  onDownload,
  onPreview,
}: {
  attachments: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size?: number;
  }>;
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
}) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {attachments.map((attachment) => (
        <LazyAttachmentPreview
          key={attachment.id}
          id={attachment.id}
          fileName={attachment.file_name}
          fileUrl={attachment.file_url}
          fileType={attachment.file_type}
          fileSize={attachment.file_size}
          onDownload={onDownload ? () => onDownload(attachment.id) : undefined}
          onPreview={onPreview ? () => onPreview(attachment.id) : undefined}
        />
      ))}
    </div>
  );
}
