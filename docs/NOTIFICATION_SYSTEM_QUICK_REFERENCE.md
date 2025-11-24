# Notification System - Quick Reference

## Overview
The Student Complaint System has an automated notification system that triggers on various events. This guide provides a quick reference for developers.

## Notification Types

All notification types are defined in the `notification_type` enum:

```sql
CREATE TYPE notification_type AS ENUM (
  'complaint_opened',      -- Student notified when lecturer opens their complaint
  'feedback_received',     -- Student notified when feedback is added
  'new_complaint',         -- Lecturers notified of new complaint submissions
  'new_announcement',      -- Users notified of new announcements
  'new_vote',             -- Users notified of new voting polls
  'comment_added',        -- Users notified of new comments
  'complaint_assigned',   -- Lecturer notified when complaint is assigned to them ✅
  'complaint_escalated',  -- Users notified when complaint is escalated
  'complaint_reopened',   -- Lecturer notified when complaint is reopened
  'status_changed'        -- Users notified of status changes
);
```

## Automatic Notifications

### 1. Complaint Assignment ✅ IMPLEMENTED
**Trigger**: When `complaints.assigned_to` is updated
**Recipient**: The assigned lecturer
**Implementation**: `notify_student_on_status_change()` function

```typescript
// Frontend code - notification is automatic
await supabase
  .from('complaints')
  .update({ assigned_to: lecturerId })
  .eq('id', complaintId);
// Notification created automatically by trigger!
```

### 2. Complaint Opened
**Trigger**: When complaint status changes from 'new' to 'opened'
**Recipient**: The student who submitted the complaint
**Implementation**: `notify_student_on_status_change()` function

### 3. New Complaint Submitted
**Trigger**: When a new complaint is created (not draft)
**Recipient**: All lecturers and admins
**Implementation**: `notify_lecturers_on_new_complaint()` function

### 4. Status Changes
**Trigger**: When complaint status changes to 'in_progress' or 'resolved'
**Recipient**: The student who submitted the complaint
**Implementation**: `notify_student_on_status_change()` function

## Database Structure

### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,           -- Recipient
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,                 -- Complaint/Vote/Announcement ID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Indexes
- `idx_notifications_user_id` - Fast lookup by user
- `idx_notifications_user_unread` - Unread notifications per user
- `idx_notifications_user_type` - Notifications by type per user

## Frontend Integration

### Subscribe to Notifications
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Subscribe to real-time notifications
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    const notification = payload.new;
    
    // Show toast notification
    showToast({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: getNotificationLink(notification)
    });
    
    // Update notification count
    updateNotificationCount();
  })
  .subscribe();

// Cleanup on unmount
return () => {
  channel.unsubscribe();
};
```

### Get Notification Link
```typescript
function getNotificationLink(notification: Notification): string {
  switch (notification.type) {
    case 'complaint_assigned':
    case 'complaint_opened':
    case 'complaint_reopened':
    case 'status_changed':
      return `/complaints/${notification.related_id}`;
    
    case 'new_complaint':
      return `/complaints/${notification.related_id}`;
    
    case 'new_announcement':
      return `/announcements`;
    
    case 'new_vote':
      return `/votes/${notification.related_id}`;
    
    default:
      return '/notifications';
  }
}
```

### Fetch Notifications
```typescript
// Get unread notifications
const { data: unreadNotifs } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('is_read', false)
  .order('created_at', { ascending: false });

// Get all notifications (paginated)
const { data: allNotifs } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 19); // First 20 notifications
```

### Mark as Read
```typescript
// Mark single notification as read
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);

// Mark all as read
await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('user_id', userId)
  .eq('is_read', false);
```

### Get Unread Count
```typescript
const { count } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false);

// Display count in badge
<NotificationBell count={count} />
```

## Manual Notification Creation

For custom notifications not covered by triggers:

```typescript
// Create a custom notification
await supabase
  .from('notifications')
  .insert({
    user_id: recipientId,
    type: 'comment_added', // or other type
    title: 'New comment on your complaint',
    message: `${userName} commented: "${commentText}"`,
    related_id: complaintId,
    is_read: false
  });
```

## Notification Styling

### Notification Icons
```typescript
const notificationIcons = {
  complaint_assigned: '📋',
  complaint_opened: '👀',
  new_complaint: '🆕',
  feedback_received: '💬',
  status_changed: '🔄',
  complaint_escalated: '⚠️',
  complaint_reopened: '🔓',
  new_announcement: '📢',
  new_vote: '🗳️',
  comment_added: '💭'
};
```

### Notification Colors
```typescript
const notificationColors = {
  complaint_assigned: 'blue',
  complaint_opened: 'green',
  new_complaint: 'purple',
  feedback_received: 'blue',
  status_changed: 'yellow',
  complaint_escalated: 'red',
  complaint_reopened: 'orange',
  new_announcement: 'indigo',
  new_vote: 'pink',
  comment_added: 'gray'
};
```

## Testing

### Verify Assignment Notification
```bash
cd student-complaint-system
node scripts/verify-assignment-notification.js
```

### Test All Triggers
```bash
cd student-complaint-system
node scripts/test-complaint-triggers.js
```

## Troubleshooting

### Notifications Not Appearing
1. Check if trigger is enabled:
   ```sql
   SELECT * FROM pg_trigger 
   WHERE tgname = 'notify_on_complaint_status_change';
   ```

2. Check if notification was created:
   ```sql
   SELECT * FROM notifications 
   WHERE user_id = 'user-id' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. Check real-time subscription:
   - Ensure user is authenticated
   - Verify channel is subscribed
   - Check browser console for errors

### Notifications Not Real-time
1. Verify Supabase Realtime is enabled for the notifications table
2. Check if the subscription filter is correct
3. Ensure the user has SELECT permission on notifications table

## RLS Policies

The notifications table has the following RLS policies:

```sql
-- Users can view their own notifications
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

## Best Practices

1. **Always use triggers for automatic notifications** - Don't create notifications manually in application code for events that should be automatic

2. **Include related_id** - Always link notifications to the relevant entity (complaint, vote, etc.)

3. **Keep messages concise** - Notification messages should be brief and actionable

4. **Use appropriate types** - Always use the correct notification_type enum value

5. **Clean up old notifications** - Consider implementing a cleanup job for old read notifications

6. **Test real-time delivery** - Always test that notifications appear in real-time

7. **Handle offline users** - Notifications are stored in the database, so offline users will see them when they return

## Related Files

- **Migrations**: `supabase/migrations/011_create_notifications_table.sql`
- **Triggers**: `supabase/migrations/017_create_complaint_triggers.sql`
- **Tests**: `scripts/test-complaint-triggers.js`
- **Verification**: `scripts/verify-assignment-notification.js`
- **Design**: `.kiro/specs/student-complaint-system/design.md`

## Summary

The notification system is fully automated at the database level. When implementing UI components:
1. Subscribe to real-time notifications
2. Display notifications with appropriate styling
3. Provide mark-as-read functionality
4. Link notifications to relevant pages
5. Show unread count in navigation

The backend (triggers and database) is complete and requires no additional work.
