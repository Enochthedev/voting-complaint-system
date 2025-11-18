# How to Apply the Complaints Table Migration

## Quick Start

### Step 1: Ensure Prerequisites

Before applying this migration, make sure:
- ✅ You have applied `001_create_users_table_extension.sql`
- ✅ Your Supabase project is set up
- ✅ You have access to the Supabase Dashboard

### Step 2: Apply the Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase/migrations/002_create_complaints_table.sql`
6. Copy the entire contents
7. Paste into the SQL Editor
8. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
9. Wait for completion - you should see "Success. No rows returned"

#### Option B: Using Supabase CLI

```bash
# Navigate to your project root
cd student-complaint-system

# Apply the migration
supabase db execute --file supabase/migrations/002_create_complaints_table.sql
```

### Step 3: Verify the Migration

Run the verification script to ensure everything was created correctly:

1. In the SQL Editor, click **New Query**
2. Open the file `supabase/verify-complaints-table.sql`
3. Copy and paste the contents
4. Click **Run**
5. Review the output to confirm:
   - ✅ Complaints table exists with all columns
   - ✅ Three enums created (category, priority, status)
   - ✅ Multiple indexes created
   - ✅ Two constraints created (anonymous_complaint_check, draft_status_check)
   - ✅ Two triggers created (search_vector, updated_at)
   - ✅ Five RLS policies created
   - ✅ RLS is enabled

### Step 4: Test the Setup

Try creating a test complaint:

```sql
-- Test 1: Create a regular complaint
INSERT INTO public.complaints (
  student_id,
  is_anonymous,
  is_draft,
  title,
  description,
  category,
  priority,
  status
) VALUES (
  (SELECT id FROM public.users WHERE role = 'student' LIMIT 1),
  false,
  false,
  'Test Complaint',
  'This is a test complaint to verify the table works correctly',
  'academic',
  'medium',
  'new'
) RETURNING *;

-- Test 2: Create an anonymous complaint
INSERT INTO public.complaints (
  student_id,
  is_anonymous,
  is_draft,
  title,
  description,
  category,
  priority,
  status
) VALUES (
  NULL,
  true,
  false,
  'Anonymous Test',
  'This is an anonymous test complaint',
  'facilities',
  'high',
  'new'
) RETURNING *;

-- Test 3: Create a draft
INSERT INTO public.complaints (
  student_id,
  is_anonymous,
  is_draft,
  title,
  description,
  category,
  priority,
  status
) VALUES (
  (SELECT id FROM public.users WHERE role = 'student' LIMIT 1),
  false,
  true,
  'Draft Test',
  'This is a draft complaint',
  'other',
  'low',
  'draft'
) RETURNING *;

-- Clean up test data
DELETE FROM public.complaints WHERE title IN ('Test Complaint', 'Anonymous Test', 'Draft Test');
```

## What Was Created

### Tables
- ✅ `public.complaints` - Main complaints table with 18 columns

### Enums
- ✅ `complaint_category` - 6 values (academic, facilities, harassment, course_content, administrative, other)
- ✅ `complaint_priority` - 4 values (low, medium, high, critical)
- ✅ `complaint_status` - 7 values (draft, new, opened, in_progress, resolved, closed, reopened)

### Indexes
- ✅ 8 single-column indexes
- ✅ 3 composite indexes
- ✅ 1 GIN index for full-text search

### Constraints
- ✅ `anonymous_complaint_check` - Ensures anonymous complaints have no student_id
- ✅ `draft_status_check` - Ensures drafts have 'draft' status

### Triggers
- ✅ `update_complaints_search_vector` - Auto-updates search vector
- ✅ `update_complaints_updated_at` - Auto-updates timestamp

### RLS Policies
- ✅ "Students view own complaints" - SELECT policy
- ✅ "Students insert complaints" - INSERT policy
- ✅ "Students update own drafts" - UPDATE policy
- ✅ "Lecturers update complaints" - UPDATE policy
- ✅ "Students delete own drafts" - DELETE policy

## Troubleshooting

### Error: relation "public.users" does not exist

**Cause**: Migration 001 not applied yet

**Solution**: Apply `001_create_users_table_extension.sql` first

### Error: type "user_role" does not exist

**Cause**: Migration 001 not applied yet

**Solution**: Apply `001_create_users_table_extension.sql` first

### Error: function "update_updated_at_column" does not exist

**Cause**: Migration 001 not applied yet

**Solution**: Apply `001_create_users_table_extension.sql` first

### Error: check constraint violated

**Cause**: Trying to insert invalid data

**Solution**: 
- For anonymous complaints: Set `student_id = NULL` and `is_anonymous = true`
- For drafts: Set `is_draft = true` and `status = 'draft'`

## Next Steps

After successfully applying this migration:

1. ✅ Complaints table is ready
2. ⏭️ Next: Apply migration 003 (complaint_tags, complaint_attachments, etc.)
3. ⏭️ Continue with remaining migrations in order

## Documentation

- **Full Documentation**: See `docs/COMPLAINTS_TABLE.md`
- **Database Setup Guide**: See `docs/DATABASE_SETUP.md`
- **Migrations Overview**: See `supabase/migrations/README.md`

## Support

If you encounter issues:
1. Check the verification script output
2. Review the troubleshooting section above
3. Consult the full documentation
4. Check Supabase logs in the Dashboard

## Rollback (If Needed)

⚠️ **Warning**: This will delete all complaints data!

```sql
-- Rollback 002_create_complaints_table.sql
DROP TRIGGER IF EXISTS update_complaints_search_vector ON public.complaints;
DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
DROP FUNCTION IF EXISTS public.update_complaint_search_vector();
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TYPE IF EXISTS complaint_category;
DROP TYPE IF EXISTS complaint_priority;
DROP TYPE IF EXISTS complaint_status;
```

Always backup your data before rolling back!
