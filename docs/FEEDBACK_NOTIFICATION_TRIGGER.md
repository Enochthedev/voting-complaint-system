# Feedback Notification Trigger

## Overview

This document describes the database trigger that automatically creates notifications when lecturers provide feedback on student complaints.

## Implementation

### Migration File
- **File**: `supabase/migrations/030_create_feedback_notification_trigger.sql`
- **Applied**: ✅ Successfully applied to database

### Trigger Function

**Function Name**: `public.notify_student_on_feedback()`

**Trigger Name**: `notify_on_feedback_received`

**Trigger Event**: `AFTER INSERT ON public.feedback`

### How It Works

1. When a lecturer inserts a new feedback record into the `feedback` table
2. The trigger function executes automatically
3. It retrieves the complaint details (title and student_id) from the `complaints` table
4. If the complaint has a student_id (not anonymous), it creates a notification
5. The notification is inserted into the `notifications` table with:
   - `user_id`: The student who submitted the complaint
   - `type`: 'feedback_received'
   - `title`: "You received feedback on your complaint"
   - `message`: "A lecturer has provided feedback on your complaint: [complaint title]"
   - `related_id`: The complaint ID
   - `is_read`: false (unread by default)

### Database Changes

#### Enum Update
Added 'feedback_received' to the `notification_type` enum:
```sql
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'feedback_received';
```

#### Trigger Function
```sql
CREATE OR REPLACE FUNCTION public.notify_student_on_feedback()
RETURNS TRIGGER AS $$
DECLARE
  v_complaint_title TEXT;
  v_student_id UUID;
BEGIN
  -- Get the complaint details (title and student_id)
  SELECT c.title, c.student_id
  INTO v_complaint_title, v_student_id
  FROM public.complaints c
  WHERE c.id = NEW.complaint_id;
  
  -- Only notify if the complaint has a student_id (not anonymous or has student)
  IF v_student_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_student_id,
      'feedback_received',
      'You received feedback on your complaint',
      'A lecturer has provided feedback on your complaint: ' || v_complaint_title,
      NEW.complaint_id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Trigger Creation
```sql
CREATE TRIGGER notify_on_feedback_received
  AFTER INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_student_on_feedback();
```

## Testing

### Test Script
- **File**: `scripts/test-feedback-notification-trigger.js`
- **Status**: ✅ All tests passing

### Test Results

The test script verifies:
1. ✅ Trigger creates notification when feedback is added
2. ✅ Notification has correct type ('feedback_received')
3. ✅ Notification has correct title
4. ✅ Notification message includes complaint title
5. ✅ Notification is linked to the correct complaint (related_id)
6. ✅ Notification is marked as unread by default
7. ✅ Notification is sent to the correct student (user_id)

### Running the Test

```bash
node scripts/test-feedback-notification-trigger.js
```

## User Experience

### For Students

When a lecturer provides feedback on their complaint:
1. A notification appears in their notification center
2. The notification shows:
   - Title: "You received feedback on your complaint"
   - Message: "A lecturer has provided feedback on your complaint: [complaint title]"
3. Clicking the notification navigates to the complaint detail page
4. The notification is marked as unread until the student views it

### For Lecturers

No notification is sent to lecturers when they add feedback (they are the ones performing the action).

## Edge Cases Handled

1. **Anonymous Complaints**: If a complaint has no student_id (anonymous), no notification is created
2. **Multiple Feedback**: Each time feedback is added, a new notification is created
3. **Deleted Complaints**: If a complaint is deleted, related notifications are also deleted (CASCADE)

## Related Files

- Migration: `supabase/migrations/030_create_feedback_notification_trigger.sql`
- Test Script: `scripts/test-feedback-notification-trigger.js`
- Feedback Table: `supabase/migrations/010_create_feedback_table.sql`
- Notifications Table: `supabase/migrations/011_create_notifications_table.sql`

## Acceptance Criteria

This trigger satisfies the following acceptance criteria:
- **AC5**: Lecturers can provide feedback on complaints
- **P5**: Students receive notifications when feedback is added

## Status

✅ **COMPLETED** - Trigger is implemented, tested, and working correctly.
