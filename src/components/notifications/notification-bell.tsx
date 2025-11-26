'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';

interface NotificationBellProps {
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Optional callback when notification bell is clicked
   */
  onClick?: () => void;
}

/**
 * NotificationBell Component
 *
 * Displays a bell icon with an unread notification count badge.
 * Currently uses mock data - will be connected to real API in Phase 12.
 *
 * Features:
 * - Shows unread notification count
 * - Displays "9+" for counts greater than 9
 * - Navigates to notifications page on click
 * - Accessible with proper ARIA labels
 * - Auto-refreshes notification count
 */
export function NotificationBell({ className, onClick }: NotificationBellProps) {
  const router = useRouter();
  const { data: unreadCount = 0, isLoading } = useUnreadNotificationCount();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/notifications');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handleClick}
      aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      disabled={isLoading}
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
}
