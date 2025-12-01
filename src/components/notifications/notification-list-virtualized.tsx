'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, AlertCircle, UserPlus, FileText, TrendingUp } from 'lucide-react';
import type { Notification, NotificationType } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface NotificationListVirtualizedProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
  /**
   * Height of the virtualized container in pixels
   * @default 600
   */
  containerHeight?: number;
  /**
   * Estimated height of each item in pixels
   * @default 120
   */
  estimateSize?: number;
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'comment_added':
      return MessageSquare;
    case 'complaint_assigned':
      return UserPlus;
    case 'complaint_escalated':
      return TrendingUp;
    case 'complaint_opened':
    case 'new_complaint':
      return FileText;
    case 'feedback_received':
      return MessageSquare;
    case 'status_changed':
      return AlertCircle;
    case 'complaint_reopened':
      return AlertCircle;
    case 'new_announcement':
      return Bell;
    case 'new_vote':
      return FileText;
    default:
      return Bell;
  }
}

/**
 * Get color class for notification type
 */
function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'complaint_escalated':
      return 'text-red-500 bg-red-500/10';
    case 'complaint_assigned':
      return 'text-blue-500 bg-blue-500/10';
    case 'feedback_received':
    case 'comment_added':
      return 'text-green-500 bg-green-500/10';
    case 'complaint_opened':
    case 'new_complaint':
      return 'text-purple-500 bg-purple-500/10';
    case 'status_changed':
      return 'text-orange-500 bg-orange-500/10';
    case 'complaint_reopened':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'new_announcement':
      return 'text-indigo-500 bg-indigo-500/10';
    case 'new_vote':
      return 'text-cyan-500 bg-cyan-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

/**
 * Notification Item Component
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type);

  return (
    <div
      className={cn(
        'group relative flex gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent',
        !notification.is_read && 'bg-accent/50'
      )}
      onClick={() => onClick(notification)}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          colorClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm truncate">{notification.title}</p>
          {!notification.is_read && (
            <div className="shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {/* Mark as read button */}
      {!notification.is_read && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
        >
          Mark read
        </Button>
      )}
    </div>
  );
}

/**
 * Virtualized Notification List Component
 *
 * Uses @tanstack/react-virtual for efficient rendering of large notification lists.
 * Only renders visible items in the viewport, improving performance for lists with hundreds or thousands of notifications.
 */
export function NotificationListVirtualized({
  notifications,
  onMarkAsRead,
  onClick,
  containerHeight = 600,
  estimateSize = 120,
}: NotificationListVirtualizedProps) {
  // Reference to the scrollable container
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Initialize virtualizer
  const rowVirtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5, // Render 5 items above and below the visible area
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      {/* Info banner */}
      <div className="mb-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground flex items-center justify-between">
        <span>
          Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}{' '}
          (virtual scrolling enabled for performance)
        </span>
        {unreadCount > 0 && (
          <Badge variant="default" className="ml-2">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {/* Virtualized list container */}
      <div
        ref={parentRef}
        className="overflow-auto rounded-lg border bg-background"
        style={{
          height: `${containerHeight}px`,
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const notification = notifications[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="p-2">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onClick={onClick}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
