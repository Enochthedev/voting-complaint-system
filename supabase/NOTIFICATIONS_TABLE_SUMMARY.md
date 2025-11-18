# Notifications Table - Summary

## Overview
The notifications table has been created to support in-app notifications for the Student Complaint Resolution System. This table enables real-time notification delivery to users when various events occur in the system.

## Files Created

1. **Migration File**: `supabase/migrations/011_create_notifications_table.sql`
   - Creates the notifications table with all required fields
   - Creates the notification_type enum
   - Sets up Row Level Security (RLS) policies
   - Creates performance indexes
   - Adds data integrity constraints

2. **Verification Script**: `supabase/verify-notifications-table.sql`
   - Comprehensive verification checks for the table
   - Validates schema, indexes, constraints, and RLS policies
   - Provides detailed output for troubleshooting

3. **TypeScript Types**: Updated `src/types/database.types.ts`
   - NotificationType enum matches SQL enum
   - Notification interface for type safety

## Table Schema

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Notification Types

The system supports the following notification types:

- `complaint_opened` - When a lecturer opens a student's complaint
- `feedback_received` - When a lecturer provides feedback on a complaint
- `new_complaint` - When a new complaint is submitted (for lecturers)
- `new_announcement` - When a new announcement is posted
- `new_vote` - When a new voting poll is created
- `comment_added` - When a comment is added to a complaint
- `complaint_assigned` - When a complaint is assigned to a lecturer
- `complaint_escalated` - When a complaint is escalated
- `complaint_reopened` - When a resolved complaint is reopened
- `status_changed` - When a complaint status changes

## Row Level Security Policies

1. **Users view own notifications**: Users can only SELECT their own notifications
2. **Users update own notifications**: Users can UPDATE their own notifications (e.g., mark as read)
3. **System insert notifications**: Authenticated users can INSERT notifications (via triggers/functions)
4. **Users delete own notifications**: Users can DELETE their own notifications

## Indexes

The following indexes are created for optimal performance:

- `idx_notifications_user_id` - For filtering by user
- `idx_notifications_is_read` - For filtering by read status
- `idx_notifications_created_at` - For sorting by date
- `idx_notifications_type` - For filtering by notification type
- `idx_notifications_related_id` - For linking to related entities
- `idx_notifications_user_unread` - Composite index for unread notifications per user
- `idx_notifications_user_type` - Composite index for user notifications by type

## How to Apply

### Method 1: Supabase Dashboard (Recommended)

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/migrations/011_create_notifications_table.sql`
5. Paste into the editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. Verify success message

### Method 2: Supabase CLI

```bash
supabase db execute --file supabase/migrations/011_create_notifications_table.sql
```

## Verification

After applying the migration, verify it was successful:

### Quick Verification

```sql
-- Check if table exists
SELECT * FROM public.notifications LIMIT 1;
```

### Comprehensive Verification

Run the verification script in SQL Editor:

```bash
supabase db execute --file supabase/verify-notifications-table.sql
```

Or copy the contents of `supabase/verify-notifications-table.sql` into the SQL Editor and run it.

Expected output: All checks should show "✓ PASS"

## Usage Examples

### Creating a Notification (via application code)

```typescript
const { data, error } = await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    type: 'complaint_opened',
    title: 'Your complaint has been opened',
    message: 'A lecturer has opened your complaint: "Issue with lab equipment"',
    related_id: complaintId,
    is_read: false
  });
```

### Fetching User Notifications

```typescript
const { data: notifications, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);
```

### Marking Notification as Read

```typescript
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

### Real-time Subscription

```typescript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new);
      // Update UI with new notification
    }
  )
  .subscribe();
```

## Dependencies

This migration requires:
- ✅ Migration 001: `create_users_table_extension.sql` (for users table reference)

## Next Steps

After applying this migration:
- [ ] Create votes and vote_responses tables (Task 1.2 - next sub-task)
- [ ] Create announcements table (Task 1.2 - next sub-task)
- [ ] Implement notification triggers (Task 6.1)
- [ ] Build notification UI components (Task 6.2)
- [ ] Set up real-time subscriptions (Task 6.3)

## Troubleshooting

### Error: "type notification_type already exists"
The migration was already applied. You can skip this migration or drop the type first:
```sql
DROP TYPE IF EXISTS notification_type CASCADE;
```
Then re-run the migration.

### Error: "relation public.users does not exist"
You need to apply migration 001 first (create_users_table_extension.sql).

### Notifications not appearing in real-time
1. Check that Realtime is enabled in Supabase Dashboard > Database > Replication
2. Verify the notifications table is enabled for Realtime
3. Check that your subscription filter is correct

## Related Files

- Migration: `supabase/migrations/011_create_notifications_table.sql`
- Verification: `supabase/verify-notifications-table.sql`
- Types: `src/types/database.types.ts`
- Design Doc: `.kiro/specs/student-complaint-system/design.md`
- Requirements: `.kiro/specs/student-complaint-system/requirements.md`

## Status

✅ **READY TO APPLY** - This migration is complete and ready to be applied to your Supabase database.

</content>
</invoke>