# Apply History Logging - Checklist

## Quick Start Checklist

Follow these steps to apply the complete history logging implementation:

### ☐ Step 1: Review the Changes

Read the documentation to understand what's being added:

- [ ] Read `HISTORY_LOGGING_IMPLEMENTATION_SUMMARY.md`
- [ ] Review `docs/HISTORY_LOGGING_QUICK_REFERENCE.md`
- [ ] Optional: Review `docs/HISTORY_LOGGING_COMPLETE.md` for full details

### ☐ Step 2: Apply the Database Migration

Choose ONE of these methods:

#### Option A: Supabase Dashboard (Recommended) ⭐

- [ ] Go to: https://tnenutksxxdhamlyogto.supabase.co/project/_/sql
- [ ] Open file: `supabase/migrations/037_add_missing_history_logging_triggers.sql`
- [ ] Copy all contents (Cmd+A, Cmd+C or Ctrl+A, Ctrl+C)
- [ ] Paste into the SQL Editor
- [ ] Click "Run" button
- [ ] Wait for success message
- [ ] Verify no errors in output

#### Option B: Supabase CLI

```bash
# Make sure you're in the project root
cd /path/to/complaint-system

# Push migrations to database
supabase db push
```

- [ ] Run the command above
- [ ] Verify migration was applied successfully
- [ ] Check for any error messages

#### Option C: Using the Script

```bash
# Make sure you're in the project root
cd /path/to/complaint-system

# Run the migration script
node scripts/apply-history-logging-triggers.js
```

- [ ] Run the command above
- [ ] If it fails, use Option A or B instead

### ☐ Step 3: Verify the Installation

Run the verification script:

```bash
node scripts/verify-history-logging.js
```

Expected output:

```
✅ Passed: 9/9
🎉 All tests passed! History logging is working correctly.
```

- [ ] Run the verification script
- [ ] Confirm all 9 tests pass
- [ ] Review the history summary output
- [ ] Check for any error messages

### ☐ Step 4: Test in the UI

- [ ] Open the application in your browser
- [ ] Log in as a student or lecturer
- [ ] Open an existing complaint detail page
- [ ] Scroll to the timeline section
- [ ] Verify you can see the complaint history
- [ ] Perform an action (e.g., add a comment)
- [ ] Refresh the page
- [ ] Verify the new action appears in the timeline

### ☐ Step 5: Verify Specific Actions

Test each action type to ensure logging works:

#### Feedback Addition

- [ ] Log in as a lecturer
- [ ] Open a complaint
- [ ] Add feedback
- [ ] Verify "feedback_added" appears in timeline

#### Comment Addition

- [ ] Add a comment to a complaint
- [ ] Verify "comment_added" appears in timeline

#### Comment Edit

- [ ] Edit an existing comment
- [ ] Verify the edit is logged in timeline

#### Comment Deletion

- [ ] Delete a comment
- [ ] Verify the deletion is logged in timeline

#### Status Change

- [ ] Change complaint status
- [ ] Verify "status_changed" appears in timeline

#### Assignment

- [ ] Assign complaint to a lecturer
- [ ] Verify "assigned" appears in timeline

### ☐ Step 6: Check Database Directly (Optional)

Verify triggers are installed:

```sql
SELECT
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname LIKE 'log_%'
ORDER BY c.relname, t.tgname;
```

Expected triggers:

- [ ] `log_comment_addition_trigger` on `complaint_comments`
- [ ] `log_comment_deletion_trigger` on `complaint_comments`
- [ ] `log_comment_edit_trigger` on `complaint_comments`
- [ ] `log_complaint_assignment_trigger` on `complaints`
- [ ] `log_complaint_creation_trigger` on `complaints`
- [ ] `log_feedback_addition_trigger` on `feedback`

### ☐ Step 7: Update Task Status

- [ ] Mark task as complete in `.kiro/specs/tasks.md`
- [ ] Update any related documentation
- [ ] Commit changes to version control

## Troubleshooting

### Migration Failed?

If the migration fails:

1. Check the error message carefully
2. Verify you have the correct permissions
3. Try applying manually via Supabase Dashboard (Option A)
4. Check if triggers already exist (they might have been applied before)

### Verification Script Failed?

If some tests fail:

1. Check which specific test failed
2. Verify the migration was applied successfully
3. Check RLS policies are correct
4. Try running the test again (sometimes timing issues occur)
5. Check the database logs for errors

### History Not Appearing in UI?

If history doesn't show in the timeline:

1. Verify the migration was applied
2. Check browser console for errors
3. Verify RLS policies allow SELECT on complaint_history
4. Try refreshing the page
5. Check if the complaint has any history entries in the database

### Need Help?

Refer to these documents:

- `docs/HISTORY_LOGGING_QUICK_REFERENCE.md` - Quick troubleshooting
- `docs/HISTORY_LOGGING_COMPLETE.md` - Complete documentation
- `docs/HISTORY_LOGGING_ARCHITECTURE.md` - Architecture details

## Summary of What's Being Added

### New Database Triggers (4)

1. ✨ `log_feedback_addition_trigger` - Logs feedback additions
2. ✨ `log_comment_addition_trigger` - Logs comment additions
3. ✨ `log_comment_edit_trigger` - Logs comment edits
4. ✨ `log_comment_deletion_trigger` - Logs comment deletions

### New Files (6)

1. ✨ `supabase/migrations/037_add_missing_history_logging_triggers.sql`
2. ✨ `scripts/apply-history-logging-triggers.js`
3. ✨ `scripts/verify-history-logging.js`
4. ✨ `docs/HISTORY_LOGGING_COMPLETE.md`
5. ✨ `docs/HISTORY_LOGGING_QUICK_REFERENCE.md`
6. ✨ `docs/HISTORY_LOGGING_ARCHITECTURE.md`

### What's Now Logged (10 actions)

1. ✅ Complaint creation
2. ✅ Status changes
3. ✅ Assignment/reassignment
4. ✅ Feedback addition ← NEW
5. ✅ Comment addition ← NEW
6. ✅ Comment edit ← NEW
7. ✅ Comment deletion ← NEW
8. ✅ Complaint reopening
9. ✅ Rating submission
10. ✅ Tag addition

## Completion Criteria

You can consider this task complete when:

- [x] Migration has been applied successfully
- [x] Verification script passes all tests (9/9)
- [x] History appears correctly in the UI timeline
- [x] All action types are being logged
- [x] No errors in browser console or database logs

## Next Steps

After completing this checklist:

1. ✅ History logging is complete
2. ⏳ Continue with other tasks in the implementation plan
3. ⏳ Implement escalation logging when escalation feature is built

---

**Status**: Ready to apply
**Estimated Time**: 10-15 minutes
**Difficulty**: Easy (just apply migration and verify)

Good luck! 🚀
