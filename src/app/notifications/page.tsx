'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  UserPlus,
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useUnreadNotificationCount } from '@/hooks/use-notifications';
import type { Notification, NotificationType } from '@/types/database.types';
import { cn } from '@/lib/utils';

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
 * NotificationGroup Component for full page view
 */
interface NotificationGroupProps {
  type: NotificationType;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}

function NotificationGroup({ type, notifications, onMarkAsRead, onClick }: NotificationGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = getNotificationIcon(type);
  const colorClass = getNotificationColor(type);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn('flex h-10 w-10 items-center justify-center rounded-full', colorClass)}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{getNotificationTypeLabel(type)}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
                {unreadCount > 0 && (
                  <Badge variant="default" className="h-5 px-1.5 text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'group relative flex gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent',
                  !notification.is_read && 'bg-accent/50'
                )}
                onClick={() => onClick(notification)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    {!notification.is_read && (
                      <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  
  // Use React Query hooks
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
    }
  }, [user, authLoading, authError, router]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to related content
    if (notification.related_id) {
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

  // Group notifications by type
  const groupedNotifications = groupNotificationsByType(notifications);

  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-[300px]" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (authError) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Error'}
        userEmail={user?.email || ''}
      >
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-lg font-medium">Error loading user</p>
              <p className="text-sm text-muted-foreground mt-1">{authError}</p>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with your complaint activities
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>

        {notificationsLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Loading notifications...</div>
              </div>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
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
    </AppLayout>
  );
}
