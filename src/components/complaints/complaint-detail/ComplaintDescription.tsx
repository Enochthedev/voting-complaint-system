'use client';

import * as React from 'react';

interface ComplaintDescriptionProps {
  description: string;
}

/**
 * Complaint Description Component
 * Displays the complaint description with rich text formatting
 */
export function ComplaintDescription({ description }: ComplaintDescriptionProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Description</h2>
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}
