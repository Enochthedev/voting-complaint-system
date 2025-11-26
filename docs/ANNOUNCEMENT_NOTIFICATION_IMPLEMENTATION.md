# Announcement Notification Implementation

## Overview

This document describes the implementation of automatic notifications for new announcements. When a lecturer or admin creates a new announcement, all students in the system automatically receive a notification.

## Implementation Details

### Database Trigger

**Migration File**: `supabase/migrations/034_create_announcement_notification_trigger.sql`

The implementation uses a PostgreSQL trigger that automatically creates notifications for all students when a new announcement is inserted into the `announcements` table.

#### Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.notify_students_on_new_announcement()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all students
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    is_read
  )
  SELECT 
    u.id,
    'new_announcement',
    'A new announcement has been posted',
    'A new announcement has been posted: ' || NEW.title,
    NEW.id,
    false
  FROM public.users u
  WHERE u.role = 'student';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Trigger Definition

```sql
CREATE TRIGGER notify_on_new_announcement
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_students_on_new_announcement();
```

### How It Works

1. **Trigger Activation**: When a new row is inserted into the `announcements` table, the trigger fires automatically
2. **Student Lookup**: The function queries the `users` table to find all users with `role = 'student'`
3. **Notification Creation**: For each student, a notification record is created with:
   - `type`: `'new_announcement'`
   - `title`: `'A new announcement has been posted'`
   - `message`: Includes the announcement title
   - `related_id`: Links to the announcement ID
   - `is_read`: Set to `false` by default
4. **Real-time Delivery**: Students with active Realtime subscriptions receive the notification immediately

### Notification Properties

| Property | Value | Description |
|----------|-------|-------------|
| `type` | `new_announcement` | Identifies this as an announcement notification |
| `title` | "A new announcement has been posted" | Fixed notification title |
| `message` | "A new announcement has been posted: {announcement_title}" | Includes the announcement title |
| `related_id` | Announcement UUID | Links to the specific announcement |
| `is_read` | `false` | Notification starts as unread |

### Frontend Integration

The notification system is already integrated in the frontend through:

1. **Notification Bell Component** (`src/components/notifications/notification-bell.tsx`)
   - Displays unread notification count
   - Shows real-time updates

2. **Notification Dropdown** (`src/components/notifications/notification-dropdown.tsx`)
   - Lists all notifications
   - Allows filtering by type
   - Supports marking as read

3. **Real-time Subscriptions** (`src/hooks/use-notifications.ts`)
   - Subscribes to notification changes
   - Updates UI automatically when new notifications arrive

### Testing

**Test Script**: `scripts/test-announcement-notification-trigger.js`

The test script verifies:
- ✅ All students receive a notification when an announcement is created
- ✅ Notification has correct type (`new_announcement`)
- ✅ Notification message includes the announcement title
- ✅ Notification is linked to the announcement via `related_id`
- ✅ Notification starts as unread (`is_read = false`)

#### Running the Test

```bash
node scripts/test-announcement-notification-trigger.js
```

#### Test Results

```
✅ ALL TESTS PASSED
The announcement notification trigger is working correctly!
```

## User Experience

### For Lecturers/Admins

When creating an announcement:
1. Fill out the announcement form with title and content
2. Click "Create Announcement"
3. The announcement is saved to the database
4. **Automatically**: All students receive a notification (no additional action needed)

### For Students

When a new announcement is created:
1. **Real-time**: Notification bell badge updates with new count
2. **Notification Center**: New notification appears in the dropdown
3. **Click**: Student can click the notification to view the announcement
4. **Mark as Read**: Notification can be marked as read

## Database Schema

### Notifications Table

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type notification_type,  -- 'new_announcement'
  title TEXT,
  message TEXT,
  related_id UUID,  -- References announcements.id
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Notification Type Enum

```sql
CREATE TYPE notification_type AS ENUM (
  'complaint_opened',
  'feedback_received',
  'new_complaint',
  'new_announcement',  -- ← Used for announcement notifications
  'new_vote',
  'comment_added',
  'complaint_assigned',
  'complaint_escalated',
  'complaint_reopened',
  'status_changed'
);
```

## Performance Considerations

### Scalability

The trigger uses a single `INSERT ... SELECT` statement to create all notifications in one operation, which is efficient even with many students.

**Performance Characteristics**:
- **Time Complexity**: O(n) where n = number of students
- **Database Operations**: 1 INSERT with multiple rows
- **Network Overhead**: Minimal (single query)

### Optimization

For systems with a very large number of students (>10,000), consider:
1. **Batch Processing**: Create notifications in batches
2. **Background Jobs**: Move notification creation to a background worker
3. **Pagination**: Limit notifications per query

Currently, the implementation is suitable for typical educational institutions with hundreds to thousands of students.

## Related Features

This notification trigger complements other notification triggers in the system:

1. **Complaint Opened** (`030_create_feedback_notification_trigger.sql`)
2. **Comment Added** (`031_create_comment_notification_trigger.sql`)
3. **New Vote** (`033_create_new_vote_notification_trigger.sql`)
4. **New Announcement** (`034_create_announcement_notification_trigger.sql`) ← This feature

## Troubleshooting

### Notifications Not Appearing

1. **Check Trigger Status**:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'notify_on_new_announcement';
   ```

2. **Verify Function Exists**:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'notify_students_on_new_announcement';
   ```

3. **Check Student Users**:
   ```sql
   SELECT COUNT(*) FROM users WHERE role = 'student';
   ```

4. **Test Manually**:
   ```sql
   -- Create a test announcement
   INSERT INTO announcements (created_by, title, content)
   VALUES ('lecturer-uuid', 'Test', 'Test content');
   
   -- Check notifications
   SELECT * FROM notifications WHERE type = 'new_announcement' ORDER BY created_at DESC LIMIT 10;
   ```

### Real-time Not Working

1. **Check Realtime Subscription**: Ensure frontend is subscribed to notifications table
2. **Verify RLS Policies**: Ensure students can read their own notifications
3. **Check Browser Console**: Look for WebSocket connection errors

## Acceptance Criteria

This implementation satisfies the following acceptance criteria from the requirements:

- **AC7**: Announcements
  - ✅ Lecturers/admins can create announcements
  - ✅ Announcements are visible to all students
  - ✅ Announcements include title, content, and timestamp

- **AC4**: Real-time Notifications
  - ✅ Students receive notifications when announcements are created
  - ✅ Notifications are delivered in real-time using Supabase Realtime

## Future Enhancements

Potential improvements for the announcement notification system:

1. **Notification Preferences**: Allow students to opt-out of announcement notifications
2. **Digest Mode**: Batch multiple announcements into a single notification
3. **Priority Levels**: Support urgent vs. normal announcements
4. **Read Receipts**: Track which students have read announcements
5. **Email Notifications**: Send email for important announcements
6. **Push Notifications**: Browser push notifications for announcements

## Conclusion

The announcement notification trigger is fully implemented and tested. It automatically notifies all students when new announcements are created, providing a seamless real-time communication channel between lecturers/admins and students.

**Status**: ✅ Complete and Tested
