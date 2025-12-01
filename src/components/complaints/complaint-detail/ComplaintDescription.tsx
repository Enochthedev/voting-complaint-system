'use client';

import * as React from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

interface ComplaintDescriptionProps {
  description: string;
}

/**
 * Complaint Description Component
 * Displays the complaint description with rich text formatting
 *
 * Security: Sanitizes HTML content to prevent XSS attacks
 */
export function ComplaintDescription({ description }: ComplaintDescriptionProps) {
  // Sanitize HTML content to prevent XSS
  const sanitizedDescription = React.useMemo(() => sanitizeHtml(description), [description]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Description</h2>
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
      />
    </div>
  );
}
