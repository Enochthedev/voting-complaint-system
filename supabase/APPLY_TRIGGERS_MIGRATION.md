# Applying Complaint Triggers Migration

This document explains how to apply the complaint triggers migration (`017_create_complaint_triggers.sql`).

## What This Migration Does

This migration creates several triggers on the `complaints` table to automate:

1. **Status Change Logging** - Automatically logs all status changes to `complaint_history`
2. **Student Notifications** - Notifies students when their complaint is opened or updated
3. **Lecturer Notifications** - Notifies all lecturers when a new complaint is submitted
4. **Assignment Notifications** - Notifies lecturers when a complaint is assigned to them
5. **Creation Logging** - Logs complaint creation in the history table
6. **Assignment Logging** - Logs assignment and reassignment changes

## Prerequisites

- Supabase project with existing tables (users, complaints, complaint_history, notifications)
- Access to Supabase SQL Editor or Supabase CLI

## Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/017_create_complaint_triggers.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration
7. Verify success - you should see "Success. No rows returned"

## Method 2: Using Supabase CLI

If you have Supabase CLI installed and your project linked:

```bash
# Navigate to project directory
cd student-complaint-system

# Push all pending migrations
supabase db push --linked --include-all

# Or apply just this migration using psql
PGPASSWORD='your-password' psql -h db.your-project.supabase.co \
  -U postgres.your-project \
  -d postgres \
  -p 5432 \
  -f supabase/migrations/017_create_complaint_triggers.sql
```

## Method 3: Using Direct Database Connection

If you have the database connection string:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/migrations/017_create_complaint_triggers.sql
```

## Verification

After applying the migration, verify it was successful:

### Option 1: Run Verification Script

```bash
# Using Supabase SQL Editor
# Copy and paste the contents of supabase/verify-complaint-triggers.sql
```

### Option 2: Run Test Script

```bash
# Install dependencies if needed
npm install

# Run the trigger test script
node scripts/test-complaint-triggers.js
```

This will:
- Create test users (student and lecturer)
- Create a test complaint
- Update the complaint status
- Assign the complaint
- Verify that all triggers fired correctly
- Clean up test data

### Option 3: Manual Verification

Run this query in Supabase SQL Editor:

```sql
-- Check if trigger functions exist
SELECT proname as function_name
FROM pg_proc
WHERE proname IN (
  'log_complaint_status_change',
  'notify_student_on_status_change',
  'notify_lecturers_on_new_complaint',
  'log_complaint_creation',
  'log_complaint_assignment'
)
ORDER BY proname;

-- Check if triggers exist on complaints table
SELECT tgname as trigger_name
FROM pg_trigger
WHERE tgrelid = 'public.complaints'::regclass
  AND tgisinternal = false
ORDER BY tgname;
```

You should see:
- 5 trigger functions
- 7 triggers on the complaints table (including the existing search vector and updated_at triggers)

## Expected Triggers

After successful migration, the `complaints` table should have these triggers:

1. `update_complaints_search_vector` - Updates full-text search vector (existing)
2. `update_complaints_updated_at` - Updates timestamp (existing)
3. `complaint_status_change_trigger` - Logs status changes (new)
4. `notify_on_complaint_status_change` - Notifies on status changes (new)
5. `notify_on_new_complaint` - Notifies lecturers of new complaints (new)
6. `log_complaint_creation_trigger` - Logs complaint creation (new)
7. `log_complaint_assignment_trigger` - Logs assignments (new)

## Troubleshooting

### Error: "function already exists"

If you see this error, the migration may have been partially applied. You can:

1. Drop the existing functions:
```sql
DROP FUNCTION IF EXISTS public.log_complaint_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.notify_student_on_status_change() CASCADE;
DROP FUNCTION IF EXISTS public.notify_lecturers_on_new_complaint() CASCADE;
DROP FUNCTION IF EXISTS public.log_complaint_creation() CASCADE;
DROP FUNCTION IF EXISTS public.log_complaint_assignment() CASCADE;
```

2. Re-run the migration

### Error: "trigger already exists"

If triggers already exist:

```sql
DROP TRIGGER IF EXISTS complaint_status_change_trigger ON public.complaints;
DROP TRIGGER IF EXISTS notify_on_complaint_status_change ON public.complaints;
DROP TRIGGER IF EXISTS notify_on_new_complaint ON public.complaints;
DROP TRIGGER IF EXISTS log_complaint_creation_trigger ON public.complaints;
DROP TRIGGER IF EXISTS log_complaint_assignment_trigger ON public.complaints;
```

Then re-run the migration.

### Triggers Not Firing

If triggers don't seem to be working:

1. Check that RLS policies allow the operations
2. Verify the trigger functions have `SECURITY DEFINER` set
3. Check that the `auth.uid()` function is available
4. Review Supabase logs for any errors

## Rollback

If you need to remove these triggers:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS complaint_status_change_trigger ON public.complaints;
DROP TRIGGER IF EXISTS notify_on_complaint_status_change ON public.complaints;
DROP TRIGGER IF EXISTS notify_on_new_complaint ON public.complaints;
DROP TRIGGER IF EXISTS log_complaint_creation_trigger ON public.complaints;
DROP TRIGGER IF EXISTS log_complaint_assignment_trigger ON public.complaints;

-- Drop functions
DROP FUNCTION IF EXISTS public.log_complaint_status_change();
DROP FUNCTION IF EXISTS public.notify_student_on_status_change();
DROP FUNCTION IF EXISTS public.notify_lecturers_on_new_complaint();
DROP FUNCTION IF EXISTS public.log_complaint_creation();
DROP FUNCTION IF EXISTS public.log_complaint_assignment();
```

## Next Steps

After successfully applying this migration:

1. ✅ Mark Task 1.4 step 3 as complete
2. ➡️ Proceed to Task 1.4 step 4: Test search functionality
3. Continue with Phase 2: Authentication and Authorization

## Support

If you encounter issues:
- Check Supabase logs in the dashboard
- Review the migration file for syntax errors
- Consult Supabase documentation: https://supabase.com/docs
- Run the test script to identify which trigger is failing
