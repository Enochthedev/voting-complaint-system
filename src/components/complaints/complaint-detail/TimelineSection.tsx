'use client';

import * as React from 'react';
import type { ComplaintHistory, User as UserType } from '@/types/database.types';
import { getActionIcon } from './constants';
import { getActionLabel, formatRelativeTime } from './utils';

interface TimelineSectionProps {
  history: (ComplaintHistory & { user?: UserType })[];
}

/**
 * Timeline/History Component
 * Displays complaint history in chronological order with action icons
 */
export function TimelineSection({ history }: TimelineSectionProps) {
  if (!history || history.length === 0) {
    return null;
  }

  // Sort history chronologically by created_at (oldest first)
  // This ensures all actions are displayed in the order they occurred
  const sortedHistory = React.useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    });
  }, [history]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">Timeline</h2>
      <div className="space-y-4">
        {sortedHistory.map((item, index) => (
          <div key={item.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {getActionIcon(item.action)}
              </div>
              {index < sortedHistory.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-sm font-medium text-card-foreground">
                {getActionLabel(item.action, item.old_value, item.new_value)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.user?.full_name || 'Unknown user'} • {formatRelativeTime(item.created_at)}
              </p>
              {item.details && Object.keys(item.details).length > 0 && (
                <div className="mt-2 rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">
                    {Object.entries(item.details).map(([key, value], idx) => (
                      <span key={key}>
                        {idx > 0 && ' • '}
                        <span className="font-medium">{key}:</span> {String(value)}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
