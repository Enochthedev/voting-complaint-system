/**
 * NotificationDropdown Component - Visual Demo
 *
 * This file demonstrates the notification dropdown component with different states.
 * It's designed for visual testing and documentation purposes.
 *
 * Example usage:
 * ```tsx
 * import { NotificationDropdownDemo } from '@/components/notifications/__tests__/notification-dropdown.test';
 *
 * export default function TestPage() {
 *   return <NotificationDropdownDemo />;
 * }
 * ```
 */

'use client';

import { NotificationDropdown } from '../notification-dropdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotificationDropdownDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Dropdown Demo</CardTitle>
          <CardDescription>
            Visual demonstration of the notification dropdown component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default State */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Default State (with notifications)</h3>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <NotificationDropdown />
              <p className="text-sm text-muted-foreground">
                Click the bell icon to see the dropdown with mock notifications. Features include:
              </p>
            </div>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
              <li>Unread count badge on bell icon</li>
              <li>Scrollable notification list</li>
              <li>Different icons and colors by notification type</li>
              <li>Relative timestamps (e.g., "30m ago")</li>
              <li>Mark individual notifications as read</li>
              <li>Mark all notifications as read</li>
              <li>Filter notifications by type</li>
              <li>Click notification to navigate to related content</li>
              <li>Empty state when no notifications</li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Key Features</h3>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Notification Types:</p>
                  <ul className="text-muted-foreground space-y-1 mt-1">
                    <li>• Complaint Opened (Purple)</li>
                    <li>• Comment Added (Green)</li>
                    <li>• Feedback Received (Green)</li>
                    <li>• Status Changed (Orange)</li>
                    <li>• Complaint Assigned (Blue)</li>
                    <li>• Complaint Escalated (Red)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Interactions:</p>
                  <ul className="text-muted-foreground space-y-1 mt-1">
                    <li>• Click notification → Navigate</li>
                    <li>• Hover → Show mark as read</li>
                    <li>• Mark all read button</li>
                    <li>• Filter button → Toggle filter panel</li>
                    <li>• Filter by notification type</li>
                    <li>• View all notifications link</li>
                    <li>• Auto-close on outside click</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* States */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Component States</h3>
            <div className="rounded-lg border p-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <span className="font-medium text-foreground">Loading:</span> Shows loading
                  indicator
                </li>
                <li>
                  <span className="font-medium text-foreground">Empty:</span> Shows "No
                  notifications" message with icon
                </li>
                <li>
                  <span className="font-medium text-foreground">With Notifications:</span> Shows
                  scrollable list
                </li>
                <li>
                  <span className="font-medium text-foreground">Unread Badge:</span> Shows count
                  (max "9+")
                </li>
                <li>
                  <span className="font-medium text-foreground">Filter Panel:</span> Toggleable
                  panel with type filters
                </li>
                <li>
                  <span className="font-medium text-foreground">Active Filters:</span> Shows badge
                  with count of hidden types
                </li>
                <li>
                  <span className="font-medium text-foreground">No Matches:</span> Shows "No
                  matching notifications" when filters exclude all
                </li>
              </ul>
            </div>
          </div>

          {/* Integration Notes */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Integration Notes</h3>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                The NotificationDropdown component is integrated into the AppHeader and uses the
                useNotifications hook for data management. Currently uses mock data for UI
                development (Phase 12 will connect to real Supabase API).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
