# Notification Bell Component

## Overview

The NotificationBell component displays a bell icon with an unread notification count badge in the application header. It provides users with a quick visual indicator of pending notifications and allows them to navigate to the notifications page.

## Features

- ✅ **Unread Count Badge**: Displays the number of unread notifications
- ✅ **Smart Display**: Shows "9+" when count exceeds 9
- ✅ **Navigation**: Clicks navigate to `/notifications` page
- ✅ **Accessibility**: Proper ARIA labels for screen readers
- ✅ **Loading State**: Disabled while fetching notification count
- ✅ **Auto-refresh**: Automatically updates count when notifications change
- ✅ **Mock Data**: Uses mock data for UI development (Phase 12: Real API integration)

## Usage

### Basic Usage

```tsx
import { NotificationBell } from '@/components/notifications';

export function MyHeader() {
  return (
    <header>
      <NotificationBell />
    </header>
  );
}
```

### With Custom Click Handler

```tsx
import { NotificationBell } from '@/components/notifications';

export function MyHeader() {
  const handleNotificationClick = () => {
    console.log('Notification bell clicked');
    // Custom logic here
  };

  return (
    <header>
      <NotificationBell onClick={handleNotificationClick} />
    </header>
  );
}
```

### With Custom Styling

```tsx
import { NotificationBell } from '@/components/notifications';

export function MyHeader() {
  return (
    <header>
      <NotificationBell className="hover:bg-accent" />
    </header>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Optional CSS classes for styling |
| `onClick` | `() => void` | `undefined` | Optional click handler (overrides default navigation) |

## Integration

The NotificationBell component is integrated into the AppHeader component:

```tsx
// src/components/layout/app-header.tsx
import { NotificationBell } from '@/components/notifications';

export function AppHeader() {
  return (
    <header>
      {/* Other header content */}
      <NotificationBell />
      {/* Other header content */}
    </header>
  );
}
```

## Hook: useNotifications

The component uses the `useNotifications` hook to fetch and manage notification data:

```tsx
import { useNotifications } from '@/hooks/use-notifications';

const {
  notifications,      // Array of notification objects
  unreadCount,        // Number of unread notifications
  isLoading,          // Loading state
  error,              // Error state
  markAsRead,         // Function to mark a notification as read
  markAllAsRead,      // Function to mark all as read
  refreshNotifications // Function to refresh notifications
} = useNotifications();
```

## Mock Data

Currently, the component uses mock data for UI development:

```typescript
// Mock notifications in useNotifications hook
const mockNotifications = [
  {
    id: '1',
    type: 'complaint_opened',
    title: 'Complaint Opened',
    message: 'Your complaint has been opened',
    is_read: false,
    created_at: '2024-11-20T10:00:00Z',
  },
  // ... more mock notifications
];
```

## Phase 12: Real API Integration

In Phase 12, the mock data will be replaced with real Supabase queries:

```typescript
// Future implementation
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

## Accessibility

The component follows accessibility best practices:

- **ARIA Labels**: Descriptive labels for screen readers
  - "View notifications" (no unread)
  - "View notifications (3 unread)" (with unread count)
- **Keyboard Navigation**: Fully keyboard accessible
- **Focus States**: Clear focus indicators
- **Disabled State**: Properly disabled while loading

## Visual States

### No Unread Notifications
```
🔔 (Bell icon only, no badge)
```

### With Unread Notifications (1-9)
```
🔔 (3) (Bell icon with red badge showing count)
```

### With Many Unread Notifications (10+)
```
🔔 (9+) (Bell icon with red badge showing "9+")
```

### Loading State
```
🔔 (Disabled, grayed out)
```

## Testing

To test the notification bell component:

1. **Visual Test**: Import and render the demo component
   ```tsx
   import { NotificationBellDemo } from '@/components/notifications/__tests__/notification-bell.test';
   ```

2. **Manual Testing**:
   - Click the bell icon to navigate to notifications page
   - Verify badge displays correct count
   - Check badge positioning (top-right of bell)
   - Test keyboard navigation (Tab to focus, Enter to click)
   - Test with screen reader

3. **Integration Testing**:
   - Verify it appears in all authenticated pages
   - Check it updates when notifications change
   - Ensure it works with different user roles

## Related Components

- **AppHeader**: Contains the NotificationBell
- **NotificationsPage**: Destination page when bell is clicked
- **useNotifications**: Hook for managing notification data

## Future Enhancements

- [ ] Real-time updates via Supabase subscriptions
- [ ] Notification dropdown preview (hover/click)
- [ ] Sound/visual notification on new notification
- [ ] Notification grouping by type
- [ ] Mark as read from dropdown
- [ ] Notification preferences/settings

## Files

- `src/components/notifications/notification-bell.tsx` - Main component
- `src/components/notifications/index.ts` - Exports
- `src/hooks/use-notifications.ts` - Notification management hook
- `src/components/notifications/__tests__/notification-bell.test.tsx` - Visual demo
- `src/components/notifications/README.md` - This file
