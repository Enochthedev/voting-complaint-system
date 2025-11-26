# Assignment Notification Trigger

## Overview

The assignment notification trigger automatically creates notifications when a complaint is assigned or reassigned to a lecturer. This ensures lecturers are immediately notified when they receive new work assignments.

## Implementation Status

✅ **COMPLETED** - The trigger is fully implemented and verified working.

## Database Components

### Trigger Function

**Function Name:** `notify_student_on_status_change()`

**Location:** `supabase/migrations/017_create_complaint_triggers.sql` (original)  
**Updated:** `supabase/migrations/029_fix_assignment_notification_type.sql`

The function handles multiple notification scenarios:
1. Student notification when complaint is opened
2. Student notification when status changes
3. **Lecturer notification when complaint is assigned** ✅

### Trigger

**Trigger Name:** `notify_on_complaint_status_change`

**Table:** `public.complaints`

**Event:** `AFTER UPDATE`

**Condition:** Fires on any UPDATE to the complaints table

## Assignment Logic

The trigger creates an assignment notification when:

```sql
IF NEW.assigned_to IS NOT NULL 
   AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) 
THEN
  -- Create notification
END IF;
```

This covers two scenarios:
1. **Initial Assignment:** When `assigned_to` changes from NULL to a lecturer ID
2. **Reassignment:** When `assigned_to` changes from one lecturer to another

## Notification Details

When a complaint is assigned, the following notification is created:

| Field | Value |
|-------|-------|
| `user_id` | The ID of the assigned lecturer |
| `type` | `'assignment'` |
| `title` | "A complaint has been assigned to you" |
| `message` | "You have been assigned complaint: {complaint_title}" |
| `related_id` | The complaint ID |
| `is_read` | `false` |

## Related Components

### Complaint History

The assignment is also logged in the `complaint_history` table via the `log_complaint_assignment_trigger`:

```sql
INSERT INTO complaint_history (
  complaint_id,
  action,
  old_value,
  new_value,
  performed_by,
  details
) VALUES (
  NEW.id,
  CASE 
    WHEN OLD.assigned_to IS NULL THEN 'assigned'
    ELSE 'reassigned'
  END,
  OLD.assigned_to::text,
  NEW.assigned_to::text,
  auth.uid(),
  jsonb_build_object(...)
);
```

## Verification

The trigger has been verified with the test script:

```bash
node scripts/verify-assignment-notification-trigger.js
```

### Test Results

✅ **Initial Assignment:** Notification created successfully  
✅ **Reassignment:** Notification created successfully  
✅ **History Logging:** Assignment logged in complaint_history  
✅ **Notification Content:** Correct title, message, and type  

## Usage Example

### Assigning a Complaint

```typescript
// In your application code
const { error } = await supabase
  .from('complaints')
  .update({ assigned_to: lecturerId })
  .eq('id', complaintId);

// The trigger automatically creates:
// 1. A notification for the lecturer
// 2. A history entry in complaint_history
```

### Checking Notifications

```typescript
// Lecturer can query their assignment notifications
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', lecturerId)
  .eq('type', 'assignment')
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

## Migration History

1. **Migration 017** (2024-11-XX): Initial trigger creation with assignment notification logic
2. **Migration 029** (2024-11-XX): Fixed notification type from `'complaint_assigned'` to `'assignment'` to match enum

## Related Files

- `supabase/migrations/017_create_complaint_triggers.sql` - Original trigger
- `supabase/migrations/029_fix_assignment_notification_type.sql` - Type fix
- `scripts/verify-assignment-notification-trigger.js` - Verification script
- `docs/ASSIGNMENT_NOTIFICATION_IMPLEMENTATION.md` - Full implementation guide

## Acceptance Criteria

✅ **AC17:** Complaint assignment system implemented  
✅ **P15:** Notifications created on assignment  

## Next Steps

The trigger is complete and working. The next phase is to:

1. Build the notification UI (Task 6.2)
2. Implement real-time subscriptions (Task 6.3)
3. Display assignment notifications in the notification center

## Troubleshooting

### No Notification Created

If notifications aren't being created:

1. Check that the trigger is enabled:
   ```sql
   SELECT tgname, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'notify_on_complaint_status_change';
   ```

2. Verify the notification type exists:
   ```sql
   SELECT enumlabel 
   FROM pg_enum 
   JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
   WHERE pg_type.typname = 'notification_type';
   ```

3. Check RLS policies on notifications table:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

### Testing Manually

```sql
-- Create a test assignment
UPDATE complaints 
SET assigned_to = 'lecturer-uuid-here'
WHERE id = 'complaint-uuid-here';

-- Check if notification was created
SELECT * FROM notifications 
WHERE user_id = 'lecturer-uuid-here' 
  AND type = 'assignment'
ORDER BY created_at DESC 
LIMIT 1;
```

## Performance Considerations

- The trigger executes on every UPDATE to the complaints table
- It only creates notifications when `assigned_to` actually changes
- Uses efficient conditional logic to minimize unnecessary operations
- Indexes on `notifications(user_id, type, created_at)` ensure fast queries

## Security

- Trigger runs with `SECURITY DEFINER` to ensure it can insert notifications
- RLS policies on notifications table ensure users only see their own notifications
- The trigger respects the authenticated user context via `auth.uid()`
