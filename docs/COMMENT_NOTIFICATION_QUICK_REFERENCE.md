# Comment Notifications - Quick Reference

## Overview

Automatic notifications are created when comments are added to complaints.

## How It Works

```
User adds comment → Database trigger fires → Notifications created automatically
```

**No additional code needed!** Just insert the comment, and notifications are handled by the database.

## Notification Rules

| Scenario | Student Notified? | Assigned Lecturer Notified? |
|----------|-------------------|----------------------------|
| Lecturer comments on student's complaint | ✅ Yes | ❌ No (own comment) |
| Student replies to their complaint | ❌ No (own comment) | ✅ Yes |
| Another lecturer comments | ✅ Yes (if not anonymous) | ✅ Yes (if assigned) |
| Internal note added | ❌ No | ❌ No |
| Comment on anonymous complaint | ❌ No (no student) | ✅ Yes (if assigned) |

## Code Example

### Adding a Comment (Frontend)

```typescript
// Simple insert - notifications are automatic!
const { data, error } = await supabase
  .from('complaint_comments')
  .insert({
    complaint_id: complaintId,
    user_id: currentUser.id,
    comment: commentText,
    is_internal: false, // Set to true for internal notes
  });

// That's it! Notifications are created by database trigger
```

### Adding an Internal Note

```typescript
// Internal notes do NOT create notifications
const { data, error } = await supabase
  .from('complaint_comments')
  .insert({
    complaint_id: complaintId,
    user_id: currentUser.id,
    comment: internalNoteText,
    is_internal: true, // This prevents notifications
  });
```

## Database Triggers

### Trigger 1: `notify_on_comment_added_trigger`

**What it does:**
- Creates notifications for complaint owner (if not anonymous)
- Creates notifications for assigned lecturer
- Skips notifications for internal notes
- Skips notifications for comment author

**When it runs:**
- After INSERT on `complaint_comments` table

### Trigger 2: `log_comment_addition_trigger`

**What it does:**
- Logs comment in `complaint_history` table
- Marks internal notes as "internal_note" type
- Includes comment metadata in details

**When it runs:**
- After INSERT on `complaint_comments` table

## Notification Details

### For Students
```json
{
  "type": "comment_added",
  "title": "New Comment on Your Complaint",
  "message": "[Name] commented on your complaint: [Title]",
  "related_id": "complaint-id"
}
```

### For Lecturers
```json
{
  "type": "comment_added",
  "title": "New Comment on Assigned Complaint",
  "message": "[Name] commented on complaint: [Title]",
  "related_id": "complaint-id"
}
```

## Testing

### Quick Test

```bash
# Run automated tests
cd student-complaint-system
node scripts/test-comment-notifications.js
```

### Manual Test

1. Create a complaint as a student
2. Assign it to a lecturer
3. Add a comment as the lecturer
4. Check student's notifications table
5. Add a comment as the student
6. Check lecturer's notifications table

## Troubleshooting

### No Notifications Created

**Check 1:** Is the trigger installed?
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'notify_on_comment_added_trigger';
```

**Check 2:** Is it an internal note?
```sql
-- Internal notes don't create notifications
SELECT is_internal FROM complaint_comments WHERE id = 'comment-id';
```

**Check 3:** Did the author comment on their own complaint?
```sql
-- Users don't get notified of their own comments
SELECT user_id, complaint_id FROM complaint_comments WHERE id = 'comment-id';
```

### Notifications for Internal Notes

**Problem:** Internal notes are creating notifications

**Solution:** Ensure `is_internal` is set to `true`:
```typescript
// Correct
is_internal: true  // No notifications

// Incorrect
is_internal: false // Creates notifications
```

## Files

### Database
- `supabase/migrations/030_create_comment_notification_trigger.sql` - Trigger definition

### Scripts
- `scripts/test-comment-notifications.js` - Automated tests

### Documentation
- `docs/COMMENT_NOTIFICATION_IMPLEMENTATION.md` - Full implementation guide
- `docs/COMMENT_NOTIFICATION_QUICK_REFERENCE.md` - This file

### Frontend
- `src/components/complaints/comment-input.tsx` - Comment input component
- `src/components/complaints/complaint-detail-view.tsx` - Uses comment input

## Key Points

✅ **Automatic:** No manual notification creation needed
✅ **Reliable:** Database triggers ensure consistency
✅ **Smart:** Prevents duplicate notifications for comment authors
✅ **Private:** Internal notes don't create notifications
✅ **Logged:** All comments recorded in history

## Related Features

- **Feedback Notifications:** Similar trigger for feedback
- **Assignment Notifications:** Trigger for complaint assignment
- **Status Change Notifications:** Trigger for status updates
- **Real-time Updates:** Supabase Realtime for instant delivery

## Next Steps

After implementing comment notifications:
1. ✅ Test with automated script
2. ✅ Verify in Supabase Dashboard
3. ⏭️ Implement notification UI (Phase 6)
4. ⏭️ Add real-time subscriptions (Phase 6)
5. ⏭️ Build notification center (Phase 6)
