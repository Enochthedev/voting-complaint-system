'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  UserPlus,
  FileText,
  TrendingUp,
  X,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadNotificationCount } from '@/hooks/use-notifications';
import type { Notification, NotificationType } from '@/types/database.types';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  /**
   * Optional className for styling
   */
  className?: string;
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
      return 'text-red-500';
    case 'complaint_assigned':
      return 'text-blue-500';
    case 'feedback_received':
    case 'comment_added':
      return 'text-green-500';
    case 'complaint_opened':
    case 'new_complaint':
      return 'text-purple-500';
    case 'status_changed':
      return 'text-orange-500';
    case 'complaint_reopened':
      return 'text-yellow-500';
    case 'new_announcement':
      return 'text-indigo-500';
    case 'new_vote':
      return 'text-cyan-500';
    default:
      return 'text-gray-500';
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
 * NotificationItem Component
 */
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onClick }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <div
      className={cn(
        'group relative flex gap-3 rounded-lg p-3 transition-colors cursor-pointer',
        'hover:bg-accent',
        !notification.is_read && 'bg-accent/50'
      )}
      onClick={() => onClick(notification)}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-none">{notification.title}</p>
          {!notification.is_read && (
            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {/* Mark as read button */}
      {!notification.is_read && (
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          aria-label="Mark as read"
        >
          <Check className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
}

/**
 * Get display name for notification type
 */
function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'comment_added':
      return 'Comments';
    case 'complaint_assigned':
      return 'Assignments';
    case 'complaint_escalated':
      return 'Escalations';
    case 'complaint_opened':
      return 'Opened Complaints';
    case 'new_complaint':
      return 'New Complaints';
    case 'feedback_received':
      return 'Feedback';
    case 'status_changed':
      return 'Status Changes';
    case 'complaint_reopened':
      return 'Reopened Complaints';
    case 'new_announcement':
      return 'Announcements';
    case 'new_vote':
      return 'Votes';
    default:
      return 'Other';
  }
}

/**
 * Group notifications by type
 */
function groupNotificationsByType(
  notifications: Notification[]
): Map<NotificationType, Notification[]> {
  const grouped = new Map<NotificationType, Notification[]>();

  notifications.forEach((notification) => {
    const existing = grouped.get(notification.type) || [];
    grouped.set(notification.type, [...existing, notification]);
  });

  return grouped;
}

/**
 * NotificationGroup Component
 */
interface NotificationGroupProps {
  type: NotificationType;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}

function NotificationGroup({ type, notifications, onMarkAsRead, onClick }: NotificationGroupProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const Icon = getNotificationIcon(type);
  const iconColor = getNotificationColor(type);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="border-b last:border-b-0">
      {/* Group Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', iconColor)} />
          <span className="text-sm font-medium">{getNotificationTypeLabel(type)}</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {notifications.length}
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className={cn('transition-transform', isExpanded ? 'rotate-180' : 'rotate-0')}>
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Group Items */}
      {isExpanded && (
        <div className="py-1 px-2 space-y-1 bg-accent/20">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Get all available notification types
 */
function getAllNotificationTypes(): NotificationType[] {
  return [
    'comment_added',
    'complaint_assigned',
    'complaint_escalated',
    'complaint_opened',
    'new_complaint',
    'feedback_received',
    'status_changed',
    'complaint_reopened',
    'new_announcement',
    'new_vote',
  ];
}

/**
 * NotificationDropdown Component
 *
 * Displays a dropdown with notifications when the bell icon is clicked.
 * Currently uses mock data - will be connected to real API in Phase 12.
 *
 * Features:
 * - Shows list of notifications grouped by type
 * - Collapsible groups with unread counts
 * - Displays notification icons and colors by type
 * - Shows relative timestamps
 * - Mark individual notifications as read
 * - Mark all notifications as read
 * - Navigate to related content on click
 * - Filter notifications by type
 * - Empty state when no notifications
 * - Loading state
 * - Scrollable list for many notifications
 */
export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const router = useRouter();
  
  // Use React Query hooks
  const { data: notifications = [], isLoading } = useNotifications(10);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // Filter state
  const [selectedTypes, setSelectedTypes] = React.useState<Set<NotificationType>>(
    new Set(getAllNotificationTypes())
  );
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to related content
    if (notification.related_id) {
      // Determine route based on notification type
      if (notification.type.includes('complaint')) {
        router.push(`/complaints/${notification.related_id}`);
      } else if (notification.type === 'new_announcement') {
        router.push('/announcements');
      } else if (notification.type === 'new_vote') {
        router.push('/dashboard');
      }
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleViewAll = () => {
    router.push('/notifications');
  };

  const handleToggleType = (type: NotificationType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedTypes(new Set(getAllNotificationTypes()));
  };

  const handleDeselectAll = () => {
    setSelectedTypes(new Set());
  };

  // Filter notifications based on selected types
  const filteredNotifications = React.useMemo(
    () => notifications.filter((n) => selectedTypes.has(n.type)),
    [notifications, selectedTypes]
  );

  // Group filtered notifications by type
  const groupedNotifications = React.useMemo(
    () => groupNotificationsByType(filteredNotifications),
    [filteredNotifications]
  );

  // Count active filters
  const activeFilterCount = getAllNotificationTypes().length - selectedTypes.size;

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <div className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 h-5 min-w-[1.25rem] rounded-full px-1 text-xs flex items-center justify-center"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
    </Button>
  );



  return (
    <DropdownMenu align="end">
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px] max-w-[calc(100vw-2rem)] p-0">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-auto p-1 text-muted-foreground hover:text-foreground',
                  showFilterPanel && 'text-foreground'
                )}
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                aria-label="Filter notifications"
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 h-4 min-w-[1rem] rounded-full px-1 text-[10px]"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>



          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="border-b bg-accent/30 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Filter by type</span>
                <div className="flex gap-2">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleSelectAll}
                  >
                    All
                  </button>
                  <span className="text-xs text-muted-foreground">|</span>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleDeselectAll}
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getAllNotificationTypes().map((type) => {
                  const Icon = getNotificationIcon(type);
                  const isSelected = selectedTypes.has(type);
                  return (
                    <button
                      key={type}
                      onClick={() => handleToggleType(type)}
                      className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{getNotificationTypeLabel(type)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium">
                  {notifications.length === 0 ? 'No notifications' : 'No matching notifications'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notifications.length === 0
                    ? "You're all caught up!"
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {Array.from(groupedNotifications.entries()).map(([type, notificationList]) => (
                  <NotificationGroup
                    key={type}
                    type={type}
                    notifications={notificationList}
                    onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="border-t px-4 py-2">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleViewAll}>
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
