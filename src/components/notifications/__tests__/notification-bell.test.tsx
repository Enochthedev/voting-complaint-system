/**
 * NotificationBell Component - Visual Demo
 *
 * This file demonstrates the notification bell component with different states.
 * To view this demo, import and render it in a page component.
 *
 * Example usage:
 * ```tsx
 * import { NotificationBellDemo } from '@/components/notifications/__tests__/notification-bell.test';
 *
 * export default function TestPage() {
 *   return <NotificationBellDemo />;
 * }
 * ```
 */

'use client';

import { NotificationBell } from '../notification-bell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationBellDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Bell Component</CardTitle>
          <CardDescription>
            Visual demonstration of the notification bell with count badge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Default State (with unread notifications)</h3>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <NotificationBell />
              <p className="text-sm text-muted-foreground">
                Bell icon with badge showing unread count (currently 3 from mock data)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Features</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Displays unread notification count in a red badge</li>
              <li>Shows "9+" when count exceeds 9</li>
              <li>Navigates to /notifications page when clicked</li>
              <li>Accessible with proper ARIA labels</li>
              <li>Uses mock data (will connect to Supabase in Phase 12)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Integration</h3>
            <p className="text-sm text-muted-foreground">
              The notification bell is integrated into the AppHeader component and appears in the
              top-right corner of all authenticated pages. It automatically fetches and displays the
              unread notification count using the useNotifications hook.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Test Instructions</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click the bell icon to navigate to the notifications page</li>
              <li>Verify the badge displays the correct count (3)</li>
              <li>Check that the badge is positioned correctly (top-right of bell)</li>
              <li>Verify accessibility by using screen reader or keyboard navigation</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
