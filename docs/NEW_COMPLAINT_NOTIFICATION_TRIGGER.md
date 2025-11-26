# New Complaint Notification Trigger

## Overview

This document describes the database trigger that automatically notifies lecturers and admins when a new complaint is submitted by a student.

## Implementation

### Database Trigger

**Migration**: `add_missing_complaint_insert_triggers`

**Trigger Name**: `notify_on_new_complaint`

**Function**: `notify_lecturers_on_new_complaint()`

### How It Works

1. **Trigger Event**: Fires AFTER INSERT on the `complaints` table
2. **Condition**: Only triggers when:
   - `status = 'new'` (not draft or other status)
   - `is_draft = false` (actual submission, not a draft)
3. **Action**: Creates a notification for every user with role `lecturer` or `admin`

### Notification Details

When triggered, the function creates notifications with:

- **Type**: `new_complaint`
- **Title**: "New complaint submitted"
- **Message**: "A new complaint has been submitted: [complaint title]"
- **Related ID**: The ID of the newly created complaint
- **Recipients**: All users with role `lecturer` or `admin`

### Code

```sql
CREATE OR REPLACE FUNCTION public.notify_lecturers_on_new_complaint()
RETURNS TRIGGER AS $
BEGIN
  -- Only notify when a complaint moves from draft to new (actual submission)
  IF NEW.status = 'new' AND NEW.is_draft = false THEN
    -- Insert notification for all lecturers and admins
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
      'new_complaint',
      'New complaint submitted',
      'A new complaint has been submitted: ' || NEW.title,
      NEW.id,
      false
    FROM public.users u
    WHERE u.role IN ('lecturer', 'admin');
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_new_complaint
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  WHEN (NEW.status = 'new' AND NEW.is_draft = false)
  EXECUTE FUNCTION public.notify_lecturers_on_new_complaint();
```

## Testing

A comprehensive test script is available at `scripts/test-new-complaint-notification.js`.

### Test Coverage

The test verifies:

1. ✅ All lecturers and admins receive notifications when a new complaint is submitted
2. ✅ Notification contains correct title and message
3. ✅ Notification is linked to the correct complaint (related_id)
4. ✅ Notifications are marked as unread by default
5. ✅ Draft complaints do NOT trigger notifications
6. ✅ Complaint creation is logged in history

### Running the Test

```bash
node scripts/test-new-complaint-notification.js
```

### Expected Output

```
✅ SUCCESS: All lecturers and admins received notifications!
✅ Complaint creation was logged in history
✅ SUCCESS: Draft complaint did NOT trigger notifications (as expected)
✅ Test completed successfully!
```

## Related Triggers

This trigger works alongside other complaint-related triggers:

1. **log_complaint_creation_trigger**: Logs complaint creation in history
2. **complaint_status_change_trigger**: Logs status changes
3. **notify_on_complaint_status_change**: Notifies students of status changes
4. **log_complaint_assignment_trigger**: Logs assignment changes

## Notification Type Enum

The `new_complaint` notification type is part of the `notification_type` enum:

```sql
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_complaint';
```

## Requirements Satisfied

This trigger satisfies the following acceptance criteria:

- **AC4**: Lecturers receive notifications when new complaints are submitted
- **P4**: Real-time notification system for complaint events

## Notes

- The trigger uses `SECURITY DEFINER` to ensure it has permission to insert notifications
- Only non-draft complaints with status 'new' trigger notifications
- The trigger is efficient as it uses a single INSERT with SELECT to create all notifications at once
- Notifications are created atomically with the complaint insertion

## Troubleshooting

### No Notifications Created

If notifications are not being created:

1. Check that the trigger exists and is enabled:
   ```sql
   SELECT tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'notify_on_new_complaint';
   ```

2. Verify the notification type enum includes 'new_complaint':
   ```sql
   SELECT enumlabel 
   FROM pg_enum e
   JOIN pg_type t ON e.enumtypid = t.oid
   WHERE t.typname = 'notification_type';
   ```

3. Check that lecturers/admins exist in the users table:
   ```sql
   SELECT COUNT(*) 
   FROM users 
   WHERE role IN ('lecturer', 'admin');
   ```

### Duplicate Notifications

If duplicate notifications are created, check that the trigger is not defined multiple times:

```sql
SELECT COUNT(*) 
FROM pg_trigger 
WHERE tgname = 'notify_on_new_complaint';
```

## Future Enhancements

Potential improvements:

1. Add notification preferences (allow users to opt-out of certain notification types)
2. Add email notifications in addition to in-app notifications
3. Add notification batching for high-volume periods
4. Add notification priority levels
