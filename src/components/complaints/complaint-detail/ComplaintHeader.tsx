'use client';

import * as React from 'react';
import { Calendar, FileText, User, AlertCircle } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_LABELS } from './constants';
import { formatRelativeTime } from './utils';
import type { ComplaintWithRelations } from './types';

interface ComplaintHeaderProps {
  complaint: ComplaintWithRelations;
}

/**
 * Complaint Header Component
 * Displays complaint title, status, metadata, tags, and anonymous indicator
 */
export function ComplaintHeader({ complaint }: ComplaintHeaderProps) {
  const statusConfig = STATUS_CONFIG[complaint.status];
  const priorityConfig = PRIORITY_CONFIG[complaint.priority];
  const categoryLabel = CATEGORY_LABELS[complaint.category];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Title and Status */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="flex-1 text-2xl font-bold text-card-foreground">{complaint.title}</h1>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold',
            statusConfig.className
          )}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Priority */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority:</span>
          <div className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', priorityConfig.dotColor)} />
            <span className={cn('text-sm font-medium', priorityConfig.className)}>
              {priorityConfig.label}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Category:</span>
          <span className="text-sm font-medium text-card-foreground">{categoryLabel}</span>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Created:</span>
          <span className="text-sm font-medium text-card-foreground">
            {formatRelativeTime(complaint.created_at)}
          </span>
        </div>

        {/* Assigned To */}
        {complaint.assigned_lecturer && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Assigned to:</span>
            <span className="text-sm font-medium text-card-foreground">
              {complaint.assigned_lecturer.full_name}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {complaint.complaint_tags && complaint.complaint_tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {complaint.complaint_tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag.tag_name}
            </span>
          ))}
        </div>
      )}

      {/* Anonymous Indicator */}
      {complaint.is_anonymous && (
        <div className="mt-4">
          <Alert variant="info">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">This complaint was submitted anonymously</span>
          </Alert>
        </div>
      )}
    </div>
  );
}
