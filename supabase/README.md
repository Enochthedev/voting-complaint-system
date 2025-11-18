# Supabase Database Migrations

This directory contains SQL migration files for the Student Complaint Resolution System database schema.

## Directory Structure

```
supabase/
├── migrations/          # SQL migration files
│   ├── 001_create_users_table_extension.sql
│   ├── 002_create_complaints_table.sql
│   └── ...
└── README.md           # This file
```

## Applying Migrations

### Option 1: Using Supabase Dashboard (Recommended for Development)

1. Log in to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Open each migration file in order (001, 002, 003, etc.)
4. Copy the SQL content and paste it into the SQL Editor
5. Click **Run** to execute the migration
6. Verify the tables were created in the **Table Editor** section

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Or apply a specific migration
supabase db execute --file supabase/migrations/001_create_users_table_extension.sql
```

### Option 3: Manual Execution via psql

If you have direct database access:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_create_users_table_extension.sql
```

## Migration Order

Migrations must be applied in numerical order:

1. `001_create_users_table_extension.sql` - Creates users table and role enum
2. `002_create_complaints_table.sql` - Creates complaints table (depends on users)
3. `003_create_complaint_related_tables.sql` - Creates tags, attachments, history, comments, ratings
4. `004_create_feedback_notifications.sql` - Creates feedback and notifications tables
5. `005_create_voting_system.sql` - Creates votes and vote_responses tables
6. `006_create_announcements.sql` - Creates announcements table
7. `007_create_templates_escalation.sql` - Creates templates and escalation rules
8. `008_create_indexes.sql` - Creates performance indexes
9. `009_create_full_text_search.sql` - Sets up full-text search
10. `010_create_triggers.sql` - Creates database triggers for automation

## Verifying Migrations

After applying migrations, verify they were successful:

### Check Tables

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check RLS Policies

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Triggers

```sql
-- List all triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Check Functions

```sql
-- List all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

## Rolling Back Migrations

If you need to roll back a migration, you can create a corresponding rollback file:

```sql
-- Example: rollback_001_create_users_table_extension.sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TABLE IF EXISTS public.users CASCADE;
DROP TYPE IF EXISTS user_role;
```

## Testing Migrations

After applying migrations, test the schema:

1. **Test User Creation**: Sign up a new user and verify the profile is created
2. **Test RLS Policies**: Try accessing data with different user roles
3. **Test Triggers**: Perform actions that should trigger database functions
4. **Test Constraints**: Try inserting invalid data to verify constraints work

## Environment-Specific Migrations

- **Development**: Apply migrations directly via Supabase Dashboard
- **Staging**: Use Supabase CLI with staging project link
- **Production**: Use Supabase CLI with production project link and test thoroughly in staging first

## Troubleshooting

### Error: "relation already exists"

The table already exists. Either:
- Skip this migration
- Drop the table first (be careful in production!)
- Use `CREATE TABLE IF NOT EXISTS`

### Error: "permission denied"

Ensure you're connected with sufficient privileges (postgres role or service_role key).

### Error: "type already exists"

The enum type already exists. Either:
- Skip the enum creation
- Drop and recreate: `DROP TYPE IF EXISTS user_role CASCADE;`

## Best Practices

1. **Always backup** before applying migrations in production
2. **Test migrations** in development/staging first
3. **Apply migrations in order** - don't skip numbers
4. **Document changes** - add comments to complex SQL
5. **Version control** - commit migration files to git
6. **Idempotent migrations** - use `IF NOT EXISTS` where possible
7. **Rollback plan** - have a rollback script ready for production

## Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
