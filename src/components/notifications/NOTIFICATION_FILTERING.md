# Notification Filtering Feature

## Overview

The notification dropdown now includes a filtering feature that allows users to filter notifications by type. This helps users focus on specific types of notifications they care about.

## Features

### Filter Button
- Located in the notification dropdown header, next to the "Mark all read" button
- Shows a filter icon with a badge indicating the number of hidden notification types
- Clicking toggles the filter panel

### Filter Panel
- Displays all available notification types as clickable chips
- Each chip shows:
  - An icon representing the notification type
  - The type label (e.g., "Comments", "Assignments", "Escalations")
- Selected types are highlighted with primary color
- Unselected types are grayed out

### Quick Actions
- **All**: Selects all notification types (shows all notifications)
- **None**: Deselects all notification types (hides all notifications)

### Notification Types

The following notification types can be filtered:

1. **Comments** - New comments on complaints
2. **Assignments** - Complaint assignments
3. **Escalations** - Escalated complaints
4. **Opened Complaints** - When a lecturer opens a complaint
5. **New Complaints** - New complaint submissions
6. **Feedback** - Feedback received on complaints
7. **Status Changes** - Complaint status updates
8. **Reopened Complaints** - Complaints that were reopened
9. **Announcements** - System announcements
10. **Votes** - New voting polls

## User Experience

### Default State
- All notification types are selected by default
- Users see all their notifications

### Filtering
1. Click the filter button to open the filter panel
2. Click on notification type chips to toggle them on/off
3. The notification list updates immediately to show only selected types
4. The filter button shows a badge with the count of hidden types

### Empty States
- **No notifications**: "No notifications - You're all caught up!"
- **No matches**: "No matching notifications - Try adjusting your filters"

## Implementation Details

### State Management
```typescript
const [selectedTypes, setSelectedTypes] = React.useState<Set<NotificationType>>(
  new Set(getAllNotificationTypes())
);
const [showFilterPanel, setShowFilterPanel] = React.useState(false);
```

### Filtering Logic
```typescript
const filteredNotifications = React.useMemo(
  () => notifications.filter((n) => selectedTypes.has(n.type)),
  [notifications, selectedTypes]
);
```

### Active Filter Count
```typescript
const activeFilterCount = getAllNotificationTypes().length - selectedTypes.size;
```

## Accessibility

- Filter button has `aria-label="Filter notifications"`
- Keyboard navigation supported for all interactive elements
- Visual feedback for selected/unselected states
- Clear visual hierarchy with icons and colors

## Future Enhancements

Potential improvements for future iterations:

1. **Persistent Filters**: Save user's filter preferences to local storage or user profile
2. **Filter Presets**: Allow users to save custom filter combinations
3. **Read/Unread Filter**: Add option to filter by read status
4. **Date Range Filter**: Filter notifications by date
5. **Search**: Add search functionality within notifications
6. **Keyboard Shortcuts**: Add keyboard shortcuts for common filter actions

## Testing

To test the notification filtering feature:

1. Open the notification dropdown
2. Click the filter button (filter icon in header)
3. Toggle different notification types on/off
4. Verify the notification list updates correctly
5. Check that the filter badge shows the correct count
6. Test "All" and "None" quick actions
7. Verify empty states display correctly

## Related Files

- `src/components/notifications/notification-dropdown.tsx` - Main component with filtering logic
- `src/components/notifications/__tests__/notification-dropdown.test.tsx` - Visual demo
- `src/hooks/use-notifications.ts` - Notification data hook
- `src/lib/api/notifications.ts` - Notification API
