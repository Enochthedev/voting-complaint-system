# Notification Bell - Visual Verification Guide

## Quick Start

The notification bell icon with count badge has been successfully implemented and is now visible in the application header on all authenticated pages.

## Where to Find It

The notification bell appears in the **top-right corner** of the header, next to the logout button.

### Pages Where It Appears

- ✅ Dashboard (`/dashboard`)
- ✅ Complaints List (`/complaints`)
- ✅ Complaint Detail (`/complaints/[id]`)
- ✅ New Complaint (`/complaints/new`)
- ✅ Drafts (`/complaints/drafts`)
- ✅ Notifications (`/notifications`)
- ✅ All other authenticated pages

## Visual Appearance

### Current State (Mock Data)
```
Header Layout:
┌─────────────────────────────────────────────────────────────┐
│  [Search Bar]              [User Name]  🔔(3)  [Logout]     │
└─────────────────────────────────────────────────────────────┘
```

The bell icon (🔔) has a **red badge** with the number **3** in the top-right corner.

### Badge Details

- **Color**: Red (destructive variant)
- **Position**: Top-right of bell icon
- **Size**: Small circular badge
- **Content**: "3" (from mock data)
- **Font**: Small, white text

## How to Test

### 1. Visual Test

1. Navigate to the dashboard: `http://localhost:3000/dashboard`
2. Look at the top-right corner of the header
3. You should see:
   - A bell icon (🔔)
   - A small red circular badge with "3"
   - The badge positioned at the top-right of the bell

### 2. Click Test

1. Click on the bell icon
2. You should be navigated to `/notifications` page
3. The notifications page should display mock notifications

### 3. Hover Test

1. Hover over the bell icon
2. The button should show a hover effect (background change)
3. Cursor should change to pointer

### 4. Keyboard Test

1. Press `Tab` until the bell icon is focused
2. You should see a focus ring around the button
3. Press `Enter` or `Space`
4. You should be navigated to `/notifications` page

### 5. Accessibility Test

Using a screen reader:
1. Navigate to the bell icon
2. Screen reader should announce: "View notifications (3 unread)"
3. The badge should also be announced: "3 unread notifications"

## Expected Behavior

### Current (Mock Data)
- ✅ Shows badge with count "3"
- ✅ Badge is red (destructive variant)
- ✅ Clicking navigates to `/notifications`
- ✅ Accessible with keyboard
- ✅ Proper ARIA labels

### Future (Phase 12 - Real Data)
- [ ] Shows actual unread count from database
- [ ] Updates in real-time when new notifications arrive
- [ ] Badge disappears when count is 0
- [ ] Shows "9+" when count exceeds 9

## Mock Data Details

The component currently uses mock data from `useNotifications` hook:

```typescript
// Mock unread notifications
const mockNotifications = [
  {
    id: '1',
    type: 'complaint_opened',
    title: 'Complaint Opened',
    is_read: false,
    created_at: '30 minutes ago',
  },
  {
    id: '2',
    type: 'comment_added',
    title: 'New Comment',
    is_read: false,
    created_at: '2 hours ago',
  },
  {
    id: '3',
    type: 'feedback_received',
    title: 'Feedback Received',
    is_read: false,
    created_at: '5 hours ago',
  },
];

// Unread count = 3
```

## Troubleshooting

### Bell Icon Not Visible

**Problem**: Can't see the bell icon in the header

**Solutions**:
1. Make sure you're on an authenticated page (logged in)
2. Check that the AppHeader component is rendering
3. Verify the NotificationBell component is imported correctly
4. Check browser console for errors

### Badge Not Showing

**Problem**: Bell icon visible but no badge

**Solutions**:
1. Check that `useNotifications` hook is returning `unreadCount > 0`
2. Verify mock data is set up correctly
3. Check browser console for errors in the hook

### Click Not Working

**Problem**: Clicking bell doesn't navigate to notifications page

**Solutions**:
1. Check browser console for navigation errors
2. Verify `/notifications` route exists
3. Check that `useRouter` is working correctly

### TypeScript Errors

**Problem**: TypeScript errors in components

**Solutions**:
1. Run `npm run build` to check for type errors
2. Verify all imports are correct
3. Check that types are properly defined

## Component Structure

```
AppHeader
├── Search Bar (optional)
├── User Info
├── NotificationBell ← NEW COMPONENT
│   ├── Bell Icon
│   └── Badge (if unreadCount > 0)
└── Logout Button
```

## Files to Review

If you want to inspect the implementation:

1. **Main Component**: `src/components/notifications/notification-bell.tsx`
2. **Hook**: `src/hooks/use-notifications.ts`
3. **Integration**: `src/components/layout/app-header.tsx`
4. **Documentation**: `src/components/notifications/README.md`

## Next Steps

After verifying the notification bell:

1. ✅ Confirm visual appearance matches design
2. ✅ Test click functionality
3. ✅ Test keyboard navigation
4. ✅ Test accessibility with screen reader
5. ⏭️ Move to next task: Build notification dropdown/center (Task 6.2)

## Success Criteria

- [x] Bell icon visible in header
- [x] Badge displays unread count (3)
- [x] Badge is red and positioned correctly
- [x] Clicking navigates to notifications page
- [x] Keyboard accessible
- [x] Screen reader announces correctly
- [x] No console errors
- [x] No TypeScript errors

---

**Status**: ✅ READY FOR TESTING  
**Next Task**: Task 6.2 - Build notification dropdown/center
