# New Vote Notification Trigger

## Overview

This document describes the database trigger that automatically creates notifications for all students when a new vote is created.

## Implementation

### Database Trigger

**Migration File:** `supabase/migrations/033_create_new_vote_notification_trigger.sql`

The trigger consists of:

1. **Function:** `public.notify_students_on_new_vote()`
   - Executes after a new vote is inserted
   - Only triggers for active votes (`is_active = true`)
   - Creates a notification for every student in the system

2. **Trigger:** `notify_on_new_vote`
   - Fires `AFTER INSERT` on the `votes` table
   - Conditional: Only when `NEW.is_active = true`

### Notification Details

When a new active vote is created, the trigger generates notifications with:

- **Type:** `new_vote`
- **Title:** "New vote available"
- **Message:** "A new vote has been created: [Vote Title]"
- **Related ID:** The vote's UUID
- **Is Read:** `false` (unread by default)
- **Recipients:** All users with role = 'student'

## Behavior

### Active Votes
✅ **Triggers notifications** when:
- A new vote is inserted into the database
- The vote's `is_active` field is `true`

### Inactive Votes
❌ **Does NOT trigger notifications** when:
- A new vote is inserted with `is_active = false`
- This allows lecturers to create draft votes without notifying students

## Testing

### Test Script

**File:** `scripts/test-new-vote-notification-trigger.js`

The test script verifies:

1. ✅ Notifications are created for all students when an active vote is created
2. ✅ Each student receives exactly one notification
3. ✅ Notification content (type, title, message, related_id) is correct
4. ✅ Inactive votes do NOT trigger notifications

### Running the Test

```bash
node scripts/test-new-vote-notification-trigger.js
```

### Expected Output

```
🎉 All tests passed! The new vote notification trigger is working correctly.
```

## User Experience

### For Students

1. When a lecturer creates a new active vote, students receive a notification
2. The notification appears in:
   - The notification bell icon (with count badge)
   - The notification dropdown
   - The notifications page (`/notifications`)
3. Clicking the notification navigates to the votes page
4. Students can then participate in the vote

### For Lecturers

1. Lecturers can create votes using the vote form
2. If `is_active` is checked, all students are notified immediately
3. If `is_active` is unchecked, no notifications are sent (draft mode)
4. Lecturers can later activate a draft vote to trigger notifications

## Database Schema

### Notifications Table

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  type notification_type NOT NULL,  -- 'new_vote'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,  -- References votes.id
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Votes Table

```sql
CREATE TABLE public.votes (
  id UUID PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  related_complaint_id UUID REFERENCES public.complaints(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closes_at TIMESTAMP WITH TIME ZONE
);
```

## Integration with UI

### Notification Components

The notification system is already configured to handle `new_vote` notifications:

1. **Icon:** FileText (📄)
2. **Color:** Cyan (`text-cyan-500`)
3. **Group:** "Votes"
4. **Navigation:** Clicking navigates to `/votes` page

### Files Involved

- `src/components/notifications/notification-bell.tsx` - Bell icon with count
- `src/components/notifications/notification-dropdown.tsx` - Dropdown UI
- `src/app/notifications/page.tsx` - Full notifications page
- `src/lib/constants.ts` - Notification type definitions

## Related Features

- **Vote Creation:** `src/components/votes/vote-form.tsx`
- **Vote Listing:** `src/app/votes/page.tsx`
- **Vote Detail:** `src/app/votes/[id]/page.tsx`
- **Notification System:** Phase 6 implementation

## Acceptance Criteria

This implementation satisfies:

- **AC6:** Voting system for lecturers to create polls
- **P6:** Students receive notifications for new votes
- **Task 7.1:** Build voting system (notification sub-task)

## Future Enhancements

Potential improvements:

1. **Vote Closing Notifications:** Notify students when a vote is about to close
2. **Vote Results Notifications:** Notify students when results are available
3. **Targeted Notifications:** Allow lecturers to notify specific groups
4. **Notification Preferences:** Let students opt-out of vote notifications

## Troubleshooting

### No Notifications Created

**Check:**
1. Is the vote's `is_active` field set to `true`?
2. Are there students in the database?
3. Is the trigger enabled?

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'notify_on_new_vote';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'notify_students_on_new_vote';
```

### Duplicate Notifications

**Check:**
1. Is the trigger firing multiple times?
2. Are there multiple triggers on the votes table?

```sql
-- List all triggers on votes table
SELECT * FROM pg_trigger WHERE tgrelid = 'public.votes'::regclass;
```

## Maintenance

### Updating the Trigger

To modify the notification content:

1. Update the migration file
2. Drop and recreate the function:

```sql
DROP FUNCTION IF EXISTS public.notify_students_on_new_vote() CASCADE;
-- Then recreate with new content
```

### Disabling the Trigger

To temporarily disable notifications:

```sql
ALTER TABLE public.votes DISABLE TRIGGER notify_on_new_vote;
```

To re-enable:

```sql
ALTER TABLE public.votes ENABLE TRIGGER notify_on_new_vote;
```

## Summary

✅ **Implemented:** Database trigger for new vote notifications  
✅ **Tested:** All test cases passing  
✅ **Documented:** Complete documentation provided  
✅ **Integrated:** Works with existing notification system  

The new vote notification trigger is fully functional and ready for production use.
