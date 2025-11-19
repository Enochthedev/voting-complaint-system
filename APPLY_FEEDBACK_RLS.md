# Apply Feedback RLS Policies - Quick Guide

## 🚀 Quick Apply

Run this command to see the SQL and instructions:
```bash
node scripts/apply-feedback-rls-fix.js
```

## 📋 Manual Steps

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/tnenutksxxdhamlyogto/editor

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the SQL**
   - Open: `supabase/migrations/024_fix_feedback_rls.sql`
   - Copy all contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for success message: "Success. No rows returned"

5. **Verify the Migration**
   ```bash
   node scripts/verify-feedback-rls.js
   ```

6. **Run Tests**
   ```bash
   node scripts/test-feedback-rls.js
   ```

## ✅ Expected Results

After applying the migration, you should have 4 RLS policies on the feedback table:
- Students view feedback
- Lecturers insert feedback
- Lecturers update own feedback
- Lecturers delete own feedback

All tests should pass (7/7).

## 🔍 What This Does

This migration updates the feedback table RLS policies to:
- Use JWT claims instead of database queries (prevents infinite recursion)
- Ensure students can only view feedback on their own complaints
- Ensure lecturers can only modify their own feedback
- Maintain proper security and access control

## 📚 More Information

- Full documentation: `docs/TASK_2.2_FEEDBACK_RLS_COMPLETION.md`
- Quick summary: `TASK_2.2_FEEDBACK_RLS_SUMMARY.md`
- Migration file: `supabase/migrations/024_fix_feedback_rls.sql`

## ⚠️ Troubleshooting

If tests fail:
1. Verify the migration was applied successfully
2. Check JWT claims are configured (migration 018)
3. Verify users have correct roles in metadata
4. Check Supabase logs for RLS errors

## 🎯 Task Status

✅ Task 2.2: Create RLS policies for feedback table - **COMPLETED**

Next task: Create RLS policies for notifications table
