# Notification Dropdown Component

## Overview

The NotificationDropdown component provides a comprehensive notification center that displays in a dropdown when the bell icon is clicked. It shows a list of notifications with rich formatting, icons, and interactive features.

## Features

### Core Features
- ✅ **Dropdown Interface**: Opens on bell icon click, closes on outside click
- ✅ **Notification List**: Scrollable list of notifications (max height 400px)
- ✅ **Unread Badge**: Shows count of unread notifications on bell icon
- ✅ **Type-based Icons**: Different icons for each notification type
- ✅ **Color Coding**: Visual distinction by notification type
- ✅ **Relative Timestamps**: Human-readable time (e.g., "30m ago", "2h ago")
- ✅ **Mark as Read**: Individual and bulk mark as read functionality
- ✅ **Navigation**: Click notification to navigate to related content
- ✅ **Empty State**: Friendly message when no notifications exist
- ✅ **Loading State**: Shows loading indicator while fetching

### Notification Types & Icons

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `complaint_opened` | FileText | Purple | Complaint has been opened by staff |
| `comment_added` | MessageSquare | Green | New comment on complaint |
| `feedback_received` | MessageSquare | Green | Feedback added to complaint |
| `status_changed` | AlertCircle | Orange | Complaint status updated |
| `complaint_assigned` | UserPlus | Blue | Complaint assigned to lecturer |
| `complaint_escalated` | TrendingUp | Red | Complaint escalated |
| `new_complaint` | FileText | Purple | New complaint submitted |
| `new_announcement` | Bell | Gray | New announcement posted |
| `new_vote` | Bell | Gray | New vote created |

## Usage

### Basic Usage

```tsx
import { NotificationDropdown } from '@/components/notifications';

export function MyHeader() {
  return (
    <header>
      <NotificationDropdown />
    </header>
  );
}
```

### With Custom Styling

```tsx
import { NotificationDropdown } from '@/components/notifications';

export function MyHeader() {
  return (
    <header>
      <NotificationDropdown className="hover:bg-accent" />
    </header>
  );
}
```

## Component Structure

```
NotificationDropdown
├── Trigger (Bell Icon + Badge)
└── Dropdown Content
    ├── Header
    │   ├── Title + Unread Count
    │   └── "Mark all read" Button
    ├── Notification List (scrollable)
    │   └── NotificationItem (multiple)
    │       ├── Icon (type-based)
    │       ├── Content
    │       │   ├── Title
    │       │   ├── Message
    │       │   └── Timestamp
    │       ├── Unread Indicator
    │       └── Mark as Read Button (on hover)
    └── Footer
        └── "View all notifications" Button
```

## Interactions

### Click Behaviors

1. **Bell Icon Click**: Opens/closes dropdown
2. **Notification Click**: 
   - Marks notification as read (if unread)
   - Navigates to related content
   - Closes dropdown
3. **Mark as Read Button**: Marks individual notification as read
4. **Mark All Read**: Marks all notifications as read
5. **View All**: Navigates to full notifications page
6. **Outside Click**: Closes dropdown

### Navigation Rules

The component automatically determines the navigation route based on notification type:

- Complaint-related notifications → `/complaints/{related_id}`
- Announcement notifications → `/announcements`
- Vote notifications → `/dashboard`

## States

### Loading State
```tsx
// Shows loading indicator
<div className="flex items-center justify-center py-8">
  <div className="text-sm text-muted-foreground">Loading...</div>
</div>
```

### Empty State
```tsx
// Shows when no notifications exist
<div className="flex flex-col items-center justify-center py-8">
  <Bell className="h-12 w-12 text-muted-foreground/50" />
  <p className="text-sm font-medium">No notifications</p>
  <p className="text-xs text-muted-foreground">You're all caught up!</p>
</div>
```

### With Notifications
```tsx
// Shows scrollable list of notifications
<div className="py-2 px-2 space-y-1">
  {notifications.map((notification) => (
    <NotificationItem key={notification.id} {...props} />
  ))}
</div>
```

## Styling

### Design Tokens Used

The component uses CSS variables for theming:

- `--background`: Dropdown background
- `--foreground`: Text color
- `--muted-foreground`: Secondary text
- `--accent`: Hover background
- `--border`: Border color
- `--popover`: Dropdown background
- `--destructive`: Badge color

### Responsive Design

- **Desktop**: 380px width dropdown
- **Mobile**: `max-w-[calc(100vw-2rem)]` to prevent overflow
- **Scrolling**: Max height 400px with overflow-y-auto

## Integration

### AppHeader Integration

The NotificationDropdown is integrated into the AppHeader component:

```tsx
// src/components/layout/app-header.tsx
import { NotificationDropdown } from '@/components/notifications';

export function AppHeader() {
  return (
    <header>
      {/* Other header content */}
      <NotificationDropdown />
      {/* Other header content */}
    </header>
  );
}
```

### Hook Integration

The component uses the `useNotifications` hook for data management:

```tsx
const { 
  notifications,      // Array of notifications
  unreadCount,        // Count of unread notifications
  isLoading,          // Loading state
  markAsRead,         // Mark single notification as read
  markAllAsRead       // Mark all notifications as read
} = useNotifications();
```

## Accessibility

### ARIA Labels

- Bell button has descriptive `aria-label` with unread count
- Badge has `aria-label` for screen readers
- Mark as read buttons have `aria-label`

### Keyboard Navigation

- Bell button is keyboard accessible (Tab + Enter)
- Dropdown items are keyboard navigable
- Escape key closes dropdown (via DropdownMenu component)

### Visual Indicators

- Unread notifications have blue dot indicator
- Unread notifications have subtle background color
- Hover states provide visual feedback
- Focus states for keyboard navigation

## Time Formatting

The component includes a `formatRelativeTime` utility:

```typescript
formatRelativeTime(dateString: string): string
```

**Output Examples:**
- Less than 1 minute: "Just now"
- Less than 1 hour: "30m ago"
- Less than 24 hours: "5h ago"
- Less than 7 days: "3d ago"
- 7+ days: "Nov 20, 2024"

## Mock Data (Phase 3-11)

Currently uses mock data from `useNotifications` hook:

```typescript
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'complaint_opened',
    title: 'Complaint Opened',
    message: 'Your complaint has been opened by Dr. Smith',
    is_read: false,
    created_at: '2024-11-20T10:00:00Z',
    // ...
  },
  // More mock notifications...
];
```

## Phase 12 Integration

In Phase 12, the component will automatically work with real data when the `useNotifications` hook is connected to Supabase:

```typescript
// Phase 12: Real API integration in useNotifications hook
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(50);
```

No changes needed to the NotificationDropdown component itself!

## Testing

### Visual Testing

1. Import the demo component:
   ```tsx
   import { NotificationDropdownDemo } from '@/components/notifications/__tests__/notification-dropdown.test';
   ```

2. Render in a test page:
   ```tsx
   export default function TestPage() {
     return <NotificationDropdownDemo />;
   }
   ```

3. Test interactions:
   - Click bell to open dropdown
   - Click notifications to navigate
   - Mark notifications as read
   - Mark all as read
   - View all notifications

### Manual Testing Checklist

- [ ] Bell icon displays with correct unread count
- [ ] Dropdown opens on bell click
- [ ] Dropdown closes on outside click
- [ ] Notifications display with correct icons and colors
- [ ] Timestamps show relative time
- [ ] Unread indicator (blue dot) shows for unread notifications
- [ ] Mark as read button appears on hover
- [ ] Individual mark as read works
- [ ] Mark all as read works
- [ ] Clicking notification navigates correctly
- [ ] Empty state shows when no notifications
- [ ] Loading state shows while fetching
- [ ] Scrolling works for many notifications
- [ ] Responsive on mobile devices

## Related Components

- **NotificationBell**: Standalone bell icon (deprecated in favor of NotificationDropdown)
- **useNotifications**: Hook for notification data management
- **DropdownMenu**: Base dropdown component
- **Badge**: Unread count badge
- **Button**: Action buttons

## File Structure

```
src/components/notifications/
├── notification-dropdown.tsx          # Main component
├── notification-bell.tsx              # Legacy component (kept for reference)
├── index.ts                           # Exports
├── NOTIFICATION_DROPDOWN.md           # This documentation
├── README.md                          # General notifications docs
└── __tests__/
    ├── notification-dropdown.test.tsx # Visual demo
    └── notification-bell.test.tsx     # Legacy demo
```

## Future Enhancements

Potential improvements for future phases:

1. **Real-time Updates**: Subscribe to notification changes via Supabase Realtime
2. **Notification Grouping**: Group similar notifications
3. **Notification Filtering**: Filter by type or date
4. **Notification Actions**: Quick actions (approve, reject, etc.)
5. **Notification Preferences**: User settings for notification types
6. **Push Notifications**: Browser push notifications
7. **Sound Alerts**: Audio notification for new items
8. **Notification History**: Archive and search old notifications

## Performance Considerations

- **Virtualization**: For 100+ notifications, consider virtual scrolling
- **Pagination**: Load more notifications on scroll
- **Caching**: Cache notification data to reduce API calls
- **Debouncing**: Debounce mark as read API calls
- **Optimistic Updates**: Update UI immediately, sync with server

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `next/navigation`: For routing
- `lucide-react`: For icons
- `@/components/ui/*`: UI components
- `@/hooks/use-notifications`: Data hook
- `@/types/database.types`: Type definitions
- `@/lib/utils`: Utility functions
