# Notification Icons and Colors - Visual Test Guide

## Quick Test Instructions

To visually verify that notification icons and colors are working correctly:

### 1. View Notification Dropdown

1. Navigate to any page in the application (e.g., `/dashboard`)
2. Look for the notification bell icon in the header
3. Click the bell icon to open the notification dropdown
4. Verify you see notifications grouped by type with:
   - ✅ Distinct icons for each notification type
   - ✅ Color-coded icons (red, blue, green, purple, orange, yellow, indigo, cyan)
   - ✅ Unread count badges
   - ✅ Collapsible groups

### 2. View Full Notifications Page

1. Click "View all notifications" at the bottom of the dropdown
2. Or navigate directly to `/notifications`
3. Verify you see:
   - ✅ Notification groups with colored circular icon backgrounds
   - ✅ Each group header shows the icon with appropriate color
   - ✅ Expandable/collapsible groups
   - ✅ Unread counts per group

### 3. Expected Visual Results

#### Notification Types and Their Visual Appearance:

| Type | Icon | Color | Example |
|------|------|-------|---------|
| New Complaint | 📄 FileText | Purple | "New Complaint Submitted" |
| Complaint Assigned | 👤 UserPlus | Blue | "Complaint Assigned to You" |
| Comment Added | 💬 MessageSquare | Green | "New Comment on Your Complaint" |
| Feedback Received | 💬 MessageSquare | Green | "Feedback Received" |
| Status Changed | ⚠️ AlertCircle | Orange | "Complaint Status Updated" |
| Complaint Escalated | 📈 TrendingUp | Red | "Complaint Escalated" |
| Complaint Opened | 📄 FileText | Purple | "Complaint Opened" |
| Complaint Reopened | ⚠️ AlertCircle | Yellow | "Complaint Reopened" |
| New Announcement | 🔔 Bell | Indigo | "New Announcement" |
| New Vote | 📄 FileText | Cyan | "New Vote Available" |

### 4. Mock Data Available

The system includes 10 mock notifications covering all types:
- 5 unread notifications (with blue dot indicator)
- 5 read notifications
- Various timestamps (5 minutes ago to 8 days ago)

### 5. Interactive Features to Test

- ✅ Click individual notifications to navigate to related content
- ✅ Hover over notifications to see "Mark as read" button
- ✅ Click "Mark as read" on individual notifications
- ✅ Click "Mark all read" to mark all notifications as read
- ✅ Expand/collapse notification groups
- ✅ Verify unread count updates correctly

### 6. Color Scheme Verification

**Dropdown View:**
- Icons use text color classes (e.g., `text-red-500`)
- Clean, minimal appearance

**Full Page View:**
- Icons use text color + background color (e.g., `text-red-500 bg-red-500/10`)
- Circular backgrounds with 10% opacity
- More prominent visual distinction

### 7. Accessibility Check

- ✅ All icons have semantic meaning
- ✅ Color is not the only indicator (icons + text)
- ✅ Proper ARIA labels on interactive elements
- ✅ Keyboard navigation support

## Troubleshooting

If notifications don't appear:
1. Check that `USE_MOCK_DATA = true` in `src/lib/api/notifications.ts`
2. Verify you're logged in (mock auth should work)
3. Check browser console for errors

If colors don't appear:
1. Verify Tailwind CSS is properly configured
2. Check that color classes are not being purged
3. Ensure dark mode toggle (if any) is working correctly

## Next Steps

After visual verification:
- ✅ Task completed: Show notification icons and colors by type
- ⏳ Next task: Implement real-time subscriptions (Task 6.3)
- ⏳ Future: Connect to real Supabase API (Phase 12)
