# Apply complaint_comments RLS Policies

## Quick Start

### Step 1: Apply the Migration

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/tnenutksxxdhamlyogto/editor

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute the SQL**
   - Open the file: `supabase/migrations/022_fix_complaint_comments_rls.sql`
   - Copy all the SQL content
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - This means all policies were created successfully

### Step 2: Test the Migration

Run the test script to verify everything works:

```bash
node scripts/test-complaint-comments-rls.js
```

Expected output:
```
✅ complaint_comments table exists
✅ Student can add comment to their own complaint
✅ Student can view comments on their complaint
✅ Lecturer can add comment to any complaint
✅ Lecturer can add internal notes
✅ Lecturer can view all comments
✅ Student cannot see internal notes
✅ All complaint_comments RLS policy tests passed!
```

## What This Migration Does

This migration fixes the RLS policies for the `complaint_comments` table to:

1. **Prevent Infinite Recursion**
   - Uses JWT claims instead of querying the users table
   - Avoids circular dependencies between RLS policies

2. **Implement Proper Access Control**
   - Students can view non-internal comments on their own complaints
   - Lecturers can view all comments including internal notes
   - Students can add comments to their own complaints
   - Lecturers can add comments to any complaint
   - Users can edit/delete their own comments
   - Lecturers can delete any comment (moderation)

3. **Protect Internal Notes**
   - Internal notes are only visible to lecturers and admins
   - Students cannot see internal notes even on their own complaints

## Alternative: Use Helper Script

For detailed instructions, run:

```bash
node scripts/apply-complaint-comments-rls-fix.js
```

This will display the full SQL and step-by-step instructions.

## Files Involved

- **Migration**: `supabase/migrations/022_fix_complaint_comments_rls.sql`
- **Test Script**: `scripts/test-complaint-comments-rls.js`
- **Helper Script**: `scripts/apply-complaint-comments-rls-fix.js`
- **Documentation**: `docs/TASK_2.2_COMPLAINT_COMMENTS_RLS_COMPLETION.md`

## Troubleshooting

### Error: "policy already exists"

If you see this error, the policies might already exist. You can either:

1. **Drop existing policies first** (recommended):
   ```sql
   DROP POLICY IF EXISTS "View comments on accessible complaints" ON public.complaint_comments;
   DROP POLICY IF EXISTS "Add comments to accessible complaints" ON public.complaint_comments;
   DROP POLICY IF EXISTS "Users update own comments" ON public.complaint_comments;
   DROP POLICY IF EXISTS "Users delete own comments" ON public.complaint_comments;
   DROP POLICY IF EXISTS "Lecturers delete any comment" ON public.complaint_comments;
   ```
   Then run the migration again.

2. **Skip the migration** if the policies are already correct.

### Error: "infinite recursion detected"

This error means the old policies are still in place. Make sure to:
1. Drop the old policies first
2. Apply the new migration
3. Test again

### Test Script Fails

If the test script fails:
1. Check that the migration was applied successfully
2. Verify that users have the correct role in their JWT claims
3. Check the Supabase logs for detailed error messages

## Requirements Satisfied

This implementation satisfies:

- ✅ **AC15**: Follow-up and Discussion System
  - Students can add follow-up comments to their complaints
  - Lecturers can reply to comments
  - Comments are timestamped and attributed to users

- ✅ **P7**: Role-Based Access
  - Students can only view their own complaint comments
  - Lecturers can view all comments

- ✅ **P19**: Comment Thread Ordering
  - Comments displayed in chronological order

## Next Steps

After applying this migration:

1. ✅ complaint_comments RLS policies are complete
2. ⏭️ Continue with Task 2.2: Create RLS policies for complaint_ratings table
3. ⏭️ Continue with Task 2.2: Create RLS policies for feedback table
4. ⏭️ Continue with Task 2.2: Create RLS policies for notifications table

## Documentation

For complete documentation, see:
- [Task Completion Summary](docs/TASK_2.2_COMPLAINT_COMMENTS_RLS_COMPLETION.md)
- [RLS Quick Reference](docs/RLS_QUICK_REFERENCE.md)
- [Database Setup](docs/DATABASE_SETUP.md)

---

**Status**: ✅ Ready to apply
**Task**: 2.2 - Implement Row Level Security Policies
**Subtask**: Create RLS policies for complaint_comments table
