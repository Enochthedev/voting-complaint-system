# Database Migrations

This directory contains SQL migration files for the Student Complaint Resolution System.

## Migration Files

### ✅ Completed

1. **001_create_users_table_extension.sql**
   - Creates `public.users` table extending `auth.users`
   - Creates `user_role` enum (student, lecturer, admin)
   - Sets up Row Level Security policies
   - Creates automatic triggers for profile creation and updates
   - **Status**: Ready to apply
   - **Dependencies**: None (requires only Supabase auth.users)

2. **002_create_complaints_table.sql**
   - Creates complaints table with all fields
   - Creates enums: complaint_category, complaint_priority, complaint_status
   - Sets up foreign keys to users table
   - Creates RLS policies for complaint access
   - Implements full-text search with tsvector
   - Creates indexes for performance optimization
   - Adds constraints for data integrity (anonymous, draft)
   - **Status**: Ready to apply
   - **Dependencies**: 001_create_users_table_extension.sql

3. **003_create_complaint_tags_table.sql**
   - Creates complaint_tags table for tagging complaints
   - Sets up RLS policies for tag management
   - Creates indexes for performance
   - Adds unique constraint on (complaint_id, tag_name)
   - **Status**: Ready to apply
   - **Dependencies**: 002_create_complaints_table.sql

4. **004_create_complaint_attachments_table.sql**
   - Creates complaint_attachments table for file metadata
   - Sets up RLS policies for attachment access
   - Creates indexes for performance
   - Adds file size constraints (max 10MB)
   - Includes foreign keys to complaints and users tables
   - **Status**: Ready to apply
   - **Dependencies**: 002_create_complaints_table.sql

5. **005_create_complaint_history_table.sql**
   - Creates complaint_history table for audit trail
   - Creates complaint_action enum
   - Sets up RLS policies (insert-only for immutability)
   - Creates indexes for performance
   - Implements immutable history (no UPDATE/DELETE permissions)
   - **Status**: Ready to apply
   - **Dependencies**: 002_create_complaints_table.sql

6. **006_create_complaint_comments_table.sql**
   - Creates complaint_comments table
   - **Dependencies**: 002_create_complaints_table.sql

7. **007_create_complaint_ratings_table.sql**
   - Creates complaint_ratings table for satisfaction ratings
   - Sets up RLS policies for rating submission and viewing
   - Creates indexes for performance
   - Adds unique constraint on complaint_id (one rating per complaint)
   - Adds rating range constraint (1-5 stars)
   - **Status**: Ready to apply
   - **Dependencies**: 002_create_complaints_table.sql

8. **008_create_complaint_templates_table.sql**
   - Creates complaint_templates table for pre-defined templates
   - Sets up RLS policies for template management
   - Creates indexes for performance
   - Includes JSONB field for flexible template structure
   - Supports active/inactive template states
   - **Status**: Ready to apply
   - **Dependencies**: 002_create_complaints_table.sql

9. **009_create_escalation_rules_table.sql**
   - Creates escalation_rules table
   - **Dependencies**: 002_create_complaints_table.sql

10. **010_create_feedback_table.sql**
    - Creates feedback table
    - **Dependencies**: 002_create_complaints_table.sql

11. **011_create_notifications_table.sql**
    - Creates notifications table for in-app notifications
    - Creates notification_type enum
    - Sets up RLS policies for notification access
    - Creates indexes for performance optimization
    - Supports real-time notification delivery
    - **Status**: Ready to apply
    - **Dependencies**: 001_create_users_table_extension.sql

12. **012_create_votes_tables.sql**
    - Creates votes and vote_responses tables
    - **Dependencies**: 001_create_users_table_extension.sql

13. **013_create_announcements_table.sql**
    - Creates announcements table
    - **Dependencies**: 001_create_users_table_extension.sql

## How to Apply Migrations

### Quick Method (Supabase Dashboard)

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor
3. Copy migration file contents
4. Paste and click Run

### Using Supabase CLI

```bash
# Apply specific migration
supabase db execute --file supabase/migrations/001_create_users_table_extension.sql

# Or use the helper script
./supabase/apply-migration.sh supabase/migrations/001_create_users_table_extension.sql
```

## Verification

After applying a migration, verify it with the corresponding verification script:

```bash
# For users table
supabase db execute --file supabase/verify-users-table.sql

# For complaints table
supabase db execute --file supabase/verify-complaints-table.sql

# For complaint_tags table
supabase db execute --file supabase/verify-complaint-tags-table.sql

# For complaint_attachments table
supabase db execute --file supabase/verify-complaint-attachments-table.sql

# For complaint_history table
supabase db execute --file supabase/verify-complaint-history-table.sql

# For complaint_comments table
supabase db execute --file supabase/verify-complaint-comments-table.sql

# For complaint_ratings table
supabase db execute --file supabase/verify-complaint-ratings-table.sql

# For complaint_templates table
supabase db execute --file supabase/verify-complaint-templates-table.sql

# For notifications table
supabase db execute --file supabase/verify-notifications-table.sql
```

Or run the verification SQL in the Supabase SQL Editor.

## Migration Order

⚠️ **Important**: Migrations must be applied in numerical order due to dependencies.

```
001 (users) → 002 (complaints) → 003 (complaint_related)
                                ↓
                              004 (feedback/notifications)
                                ↓
                              005 (voting)
                                ↓
                              006 (announcements)
                                ↓
                              007 (templates/escalation)
                                ↓
                              008 (indexes)
                                ↓
                              009 (full-text search)
                                ↓
                              010 (triggers)
```

## Current Status

- ✅ Migration 001: Users table extension - **READY**
- ✅ Migration 002: Complaints table - **READY**
- ✅ Migration 003: Complaint tags table - **READY**
- ✅ Migration 004: Complaint attachments table - **READY**
- ✅ Migration 005: Complaint history table - **READY**
- ⏳ Migration 006-013: **PENDING** (Subsequent tasks)

## Documentation

- **Quick Start**: See `../QUICK_START.md`
- **Full Guide**: See `../../docs/DATABASE_SETUP.md`
- **Main README**: See `../README.md`

## Rollback

If you need to rollback a migration, you can drop the created objects in reverse order. Example for users table:

```sql
-- Rollback 001_create_users_table_extension.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TABLE IF EXISTS public.users CASCADE;
DROP TYPE IF EXISTS user_role;
```

⚠️ **Warning**: Rollback will delete all data in the affected tables. Always backup first!
