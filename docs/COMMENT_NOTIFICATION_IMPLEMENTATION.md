# Comment Notification System - Implementation Guide

## Overview

The comment notification system automatically creates notifications when users add comments to complaints. This ensures that relevant parties are informed of new discussion activity.

## Features

### Automatic Notifications

When a comment is added to a complaint, the system automatically:

1. **Notifies the complaint owner** (if they didn't write the comment)
   - Only for non-anonymous complaints
   - Only for non-internal comments
   
2. **Notifies the assigned lecturer** (if they didn't write the comment)
   - Only for non-internal comments
   
3. **Logs the comment** in the complaint history
   - Both regular comments and internal notes are logged
   - Internal notes are marked as such in the history

### Internal Notes

Internal notes (lecturer-only comments) have special handling:
- **Do NOT** trigger notifications
- **Are** logged in complaint history
- Only visible to lecturers and admins

## Database Implementation

### Trigger Function: `notify_on_comment_added()`

Located in: `supabase/migrations/030_create_comment_notification_trigger.sql`

**Logic:**
```sql
1. Get complaint details (title, student_id, assigned_to)
2. Get commenter information (name, id)
3. If comment is NOT internal:
   a. If complaint has a student_id (not anonymous):
      - Create notification for student (if they didn't write it)
   b. If complaint has assigned_to:
      - Create notification for assigned lecturer (if they didn't write it)
4. Return NEW record
```

**Notification Details:**
- **Type:** `comment_added`
- **Title:** 
  - For students: "New Comment on Your Complaint"
  - For lecturers: "New Comment on Assigned Complaint"
- **Message:** "[Commenter Name] commented on [complaint title]"
- **Related ID:** Complaint ID (for navigation)

### Trigger Function: `log_comment_addition()`

**Logic:**
```sql
1. Determine comment type (internal_note or comment)
2. Insert record into complaint_history table
3. Include comment_id and is_internal flag in details
4. Return NEW record
```

## Frontend Integration

### Comment Input Component

The `CommentInput` component (`src/components/complaints/comment-input.tsx`) handles comment submission:

```typescript
// When a comment is submitted:
await supabase.from('complaint_comments').insert({
  complaint_id: complaintId,
  user_id: currentUser.id,
  comment: comment.trim(),
  is_internal: isInternal,
});

// Notification creation is automatic via database trigger
// No additional API calls needed!
```

### Complaint Detail View

The `ComplaintDetailView` component displays comments and uses the `CommentInput`:

```typescript
<CommentInput
  onSubmit={handleSubmit}
  showInternalToggle={userRole === 'lecturer' || userRole === 'admin'}
  placeholder="Share your thoughts or provide an update..."
/>
```

## Notification Flow

### Example 1: Lecturer Comments on Student's Complaint

```
1. Lecturer adds comment via CommentInput
2. Database trigger fires on INSERT to complaint_comments
3. Trigger checks: is_internal = false
4. Trigger creates notification for student (complaint owner)
5. Student sees notification in real-time (via Supabase Realtime)
6. Comment is logged in complaint_history
```

### Example 2: Student Replies to Their Complaint

```
1. Student adds comment via CommentInput
2. Database trigger fires on INSERT to complaint_comments
3. Trigger checks: is_internal = false
4. Trigger creates notification for assigned lecturer
5. Lecturer sees notification in real-time
6. Comment is logged in complaint_history
```

### Example 3: Lecturer Adds Internal Note

```
1. Lecturer adds comment with is_internal = true
2. Database trigger fires on INSERT to complaint_comments
3. Trigger checks: is_internal = true
4. NO notifications created (internal notes are private)
5. Comment is logged in complaint_history as "internal_note"
```

## Testing

### Manual Testing

1. **Test regular comments:**
   ```bash
   # As lecturer, comment on a student's complaint
   # Verify student receives notification
   ```

2. **Test internal notes:**
   ```bash
   # As lecturer, add internal note
   # Verify NO notifications are created
   ```

3. **Test anonymous complaints:**
   ```bash
   # Comment on anonymous complaint
   # Verify only assigned lecturer receives notification
   ```

### Automated Testing

Run the test script:
```bash
cd student-complaint-system
node scripts/test-comment-notifications.js
```

The test script verifies:
- ✓ Notifications created for complaint owner
- ✓ Notifications created for assigned lecturer
- ✓ Users don't receive notifications for own comments
- ✓ Internal notes do NOT create notifications
- ✓ Anonymous complaints handled correctly
- ✓ Comments logged in complaint history

## Database Migration

### Apply the Migration

```bash
cd student-complaint-system/supabase

# Using Supabase CLI
supabase db push

# Or manually via SQL editor in Supabase Dashboard
# Copy and paste: migrations/030_create_comment_notification_trigger.sql
```

### Verify Installation

```sql
-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'notify_on_comment_added_trigger';

-- Check if function exists
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines
WHERE routine_name = 'notify_on_comment_added';
```

## Requirements Validation

This implementation satisfies:

### Acceptance Criteria
- **AC15:** Follow-up and Discussion System
  - ✓ Comments trigger notifications for relevant parties
  - ✓ All participants receive notifications for new comments

### Design Properties
- **P4:** Notification Delivery
  - ✓ Notifications created automatically via database trigger
  - ✓ Delivered in real-time via Supabase Realtime

- **P19:** Comment Thread Ordering
  - ✓ Comments logged with timestamps
  - ✓ History maintains chronological order

## Architecture Benefits

### Database-Level Triggers

Using database triggers provides several advantages:

1. **Reliability:** Notifications are guaranteed to be created
2. **Consistency:** No risk of forgetting to create notifications in application code
3. **Performance:** Single database transaction for comment + notification
4. **Simplicity:** Frontend code doesn't need to handle notification creation
5. **Atomicity:** Comment and notification creation happen together or not at all

### Real-time Updates

Combined with Supabase Realtime:
- Users receive notifications instantly
- No polling required
- Efficient WebSocket connections
- Automatic UI updates

## Troubleshooting

### Notifications Not Created

1. **Check trigger is installed:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'notify_on_comment_added_trigger';
   ```

2. **Check function exists:**
   ```sql
   SELECT * FROM information_schema.routines 
   WHERE routine_name = 'notify_on_comment_added';
   ```

3. **Test trigger manually:**
   ```sql
   -- Insert test comment
   INSERT INTO complaint_comments (complaint_id, user_id, comment, is_internal)
   VALUES ('complaint-id', 'user-id', 'Test comment', false);
   
   -- Check notifications
   SELECT * FROM notifications 
   WHERE related_id = 'complaint-id' 
   ORDER BY created_at DESC;
   ```

### Internal Notes Creating Notifications

If internal notes are creating notifications:
1. Verify `is_internal` flag is set to `true`
2. Check trigger logic in database
3. Review application code setting `is_internal`

### Missing History Logs

If comments aren't logged in history:
1. Check `log_comment_addition_trigger` is installed
2. Verify `complaint_history` table exists
3. Check RLS policies allow INSERT

## Future Enhancements

Potential improvements for Phase 12:

1. **Notification Preferences:**
   - Allow users to configure which notifications they receive
   - Email digest options

2. **Mention System:**
   - @mention users in comments
   - Create targeted notifications for mentioned users

3. **Comment Reactions:**
   - Like/upvote comments
   - Notify comment author of reactions

4. **Thread Replies:**
   - Reply directly to specific comments
   - Notify original comment author

5. **Notification Grouping:**
   - Group multiple comments on same complaint
   - "3 new comments on your complaint"

## Related Documentation

- [Notification System Quick Reference](./NOTIFICATION_SYSTEM_QUICK_REFERENCE.md)
- [Comment Input Component](../src/components/complaints/README_COMMENT_INPUT.md)
- [Feedback Notification Implementation](./FEEDBACK_NOTIFICATION_IMPLEMENTATION.md)
- [Database Setup](./DATABASE_SETUP.md)

## Support

For issues or questions:
1. Check the test script output
2. Review database logs
3. Verify trigger installation
4. Check RLS policies on notifications table
