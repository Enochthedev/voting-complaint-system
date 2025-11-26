# Comment Notification Trigger

## Overview

This document describes the database trigger that automatically creates notifications when users add comments to complaints.

## Implementation

**Migration File**: `supabase/migrations/031_create_comment_notification_trigger.sql`

**Test Script**: `scripts/test-comment-notification-trigger.js`

## Functionality

The trigger automatically notifies relevant users when a comment is added to a complaint:

### Who Gets Notified

1. **Student** - Receives notification when someone comments on their complaint (unless they are the commenter)
2. **Assigned Lecturer** - Receives notification when someone comments on a complaint assigned to them (unless they are the commenter)
3. **Other Participants** - Lecturers/admins who have previously commented on the complaint receive notifications about new comments (excluding the current commenter)

### Special Cases

- **Internal Notes**: Comments marked as `is_internal = true` do NOT trigger notifications (these are lecturer-only notes)
- **Self-Comments**: Users do not receive notifications for their own comments
- **Duplicate Prevention**: The trigger ensures users don't receive multiple notifications for the same comment

## Notification Details

### For Students
- **Type**: `comment_added`
- **Title**: "New comment on your complaint"
- **Message**: "[Commenter Name] commented on your complaint: [Complaint Title]"
- **Related ID**: The complaint ID

### For Assigned Lecturers
- **Type**: `comment_added`
- **Title**: "New comment on assigned complaint"
- **Message**: "[Commenter Name] commented on complaint: [Complaint Title]"
- **Related ID**: The complaint ID

### For Other Participants
- **Type**: `comment_added`
- **Title**: "New comment on complaint"
- **Message**: "[Commenter Name] commented on complaint: [Complaint Title]"
- **Related ID**: The complaint ID

## Database Function

```sql
CREATE OR REPLACE FUNCTION public.notify_users_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_title TEXT;
  v_student_id UUID;
  v_assigned_to UUID;
  v_commenter_name TEXT;
  v_commenter_role TEXT;
BEGIN
  -- Get complaint and commenter details
  -- Skip internal notes
  -- Notify student (if not commenter)
  -- Notify assigned lecturer (if not commenter)
  -- Notify other participants (lecturers/admins who commented)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Trigger

```sql
CREATE TRIGGER notify_on_comment_added
  AFTER INSERT ON public.complaint_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_on_comment();
```

## Testing

Run the test script to verify the trigger works correctly:

```bash
node scripts/test-comment-notification-trigger.js
```

### Test Cases

1. ✅ Lecturer comments → Student receives notification
2. ✅ Student comments → Assigned lecturer receives notification
3. ✅ Another lecturer comments → Both student and first lecturer receive notifications
4. ✅ Internal note → No notifications created (correct behavior)

## Related Files

- Migration: `supabase/migrations/031_create_comment_notification_trigger.sql`
- Test Script: `scripts/test-comment-notification-trigger.js`
- Notifications Table: `supabase/migrations/011_create_notifications_table.sql`
- Comments Table: `supabase/migrations/006_create_complaint_comments_table.sql`

## Acceptance Criteria

This implementation satisfies:
- **AC15**: Discussion/comment system with notifications
- **P19**: Comment notifications for relevant users

## Status

✅ **COMPLETED** - Trigger created, tested, and verified working correctly.
