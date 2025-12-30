# Notification Dropdown - Quick Reference

## Import

```tsx
import { NotificationDropdown } from '@/components/notifications';
```

## Basic Usage

```tsx
<NotificationDropdown />
```

## Features at a Glance

| Feature       | Status | Description                            |
| ------------- | ------ | -------------------------------------- |
| Bell Icon     | ✅     | Shows notification bell with badge     |
| Unread Count  | ✅     | Displays count of unread notifications |
| Dropdown List | ✅     | Scrollable list of notifications       |
| Type Icons    | ✅     | Different icons per notification type  |
| Color Coding  | ✅     | Visual distinction by type             |
| Timestamps    | ✅     | Relative time (e.g., "30m ago")        |
| Mark as Read  | ✅     | Individual and bulk actions            |
| Navigation    | ✅     | Click to go to related content         |
| Empty State   | ✅     | Friendly message when no notifications |
| Loading State | ✅     | Shows while fetching data              |
| Responsive    | ✅     | Works on all screen sizes              |
| Accessible    | ✅     | Keyboard and screen reader support     |

## Notification Types

```typescript
type NotificationType =
  | 'complaint_opened' // 📄 Purple
  | 'comment_added' // 💬 Green
  | 'feedback_received' // 💬 Green
  | 'status_changed' // ⚠️  Orange
  | 'complaint_assigned' // 👤 Blue
  | 'complaint_escalated' // 📈 Red
  | 'new_complaint' // 📄 Purple
  | 'new_announcement' // 🔔 Gray
  | 'new_vote'; // 🔔 Gray
```

## User Interactions

```typescript
// Click bell → Open/close dropdown
// Click notification → Mark as read + Navigate
// Hover notification → Show mark as read button
// Click mark as read → Mark individual notification
// Click "Mark all read" → Mark all notifications
// Click "View all" → Go to notifications page
// Click outside → Close dropdown
```

## Navigation Routes

```typescript
// Complaint-related → /complaints/{related_id}
// Announcements → /announcements
// Votes → /dashboard
```

## Component Props

```typescript
interface NotificationDropdownProps {
  className?: string; // Optional styling
}
```

## Hook Integration

```typescript
const {
  notifications, // Notification[]
  unreadCount, // number
  isLoading, // boolean
  markAsRead, // (id: string) => Promise<void>
  markAllAsRead, // () => Promise<void>
} = useNotifications();
```

## Styling

Uses design tokens (CSS variables):

- `--background`
- `--foreground`
- `--muted-foreground`
- `--accent`
- `--border`
- `--popover`
- `--destructive`

## Responsive Breakpoints

```css
Desktop: 380px width
Mobile:  calc(100vw - 2rem)
Max Height: 400px (scrollable)
```

## Accessibility

```typescript
// ARIA labels on bell button
aria-label="View notifications (3 unread)"

// ARIA labels on badge
aria-label="3 unread notifications"

// Keyboard navigation
Tab → Focus bell
Enter → Open dropdown
Tab → Navigate items
Enter → Activate item
Escape → Close dropdown
```

## Time Formatting

```typescript
< 1 minute  → "Just now"
< 1 hour    → "30m ago"
< 24 hours  → "5h ago"
< 7 days    → "3d ago"
≥ 7 days    → "Nov 20, 2024"
```

## Mock Data (Current)

```typescript
// Currently uses mock data from useNotifications hook
// Will connect to Supabase in Phase 12
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'complaint_opened',
    title: 'Complaint Opened',
    message: 'Your complaint has been opened...',
    is_read: false,
    created_at: '2024-11-20T10:00:00Z',
    related_id: 'complaint-1',
    user_id: 'user-1',
  },
  // ...
];
```

## Testing

```tsx
// Import demo component
import { NotificationDropdownDemo } from '@/components/notifications/__tests__/notification-dropdown.test';

// Render in test page
<NotificationDropdownDemo />;
```

## Common Tasks

### Add to Header

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

### Custom Styling

```tsx
<NotificationDropdown className="hover:bg-accent" />
```

### Check Unread Count

```tsx
const { unreadCount } = useNotifications();
console.log(`${unreadCount} unread notifications`);
```

### Mark Notification as Read

```tsx
const { markAsRead } = useNotifications();
await markAsRead('notification-id');
```

### Mark All as Read

```tsx
const { markAllAsRead } = useNotifications();
await markAllAsRead();
```

## File Locations

```
src/components/notifications/
├── notification-dropdown.tsx          # Main component
├── index.ts                           # Exports
└── __tests__/
    └── notification-dropdown.test.tsx # Demo

docs/
├── NOTIFICATION_DROPDOWN_COMPLETION.md    # Implementation summary
├── NOTIFICATION_DROPDOWN_VISUAL_GUIDE.md  # Visual guide
└── NOTIFICATION_DROPDOWN_QUICK_REFERENCE.md # This file
```

## Related Documentation

- [Full Documentation](./NOTIFICATION_DROPDOWN.md)
- [Visual Guide](./NOTIFICATION_DROPDOWN_VISUAL_GUIDE.md)
- [Completion Summary](./NOTIFICATION_DROPDOWN_COMPLETION.md)
- [Component README](../src/components/notifications/NOTIFICATION_DROPDOWN.md)

## Phase 12 Integration

No changes needed to component! Just update `useNotifications` hook:

```typescript
// Phase 12: Connect to Supabase
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(50);
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance

- Efficient re-renders
- Scrollable for many items
- Optimistic UI updates
- Ready for virtualization (100+ items)

## Status

✅ **COMPLETED** - Ready for use in Phase 6

---

**Quick Links:**

- Component: `src/components/notifications/notification-dropdown.tsx`
- Hook: `src/hooks/use-notifications.ts`
- Types: `src/types/database.types.ts`
- Demo: `src/components/notifications/__tests__/notification-dropdown.test.tsx`
