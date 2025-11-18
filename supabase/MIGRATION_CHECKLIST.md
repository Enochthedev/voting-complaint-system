# Migration Application Checklist

Use this checklist when applying database migrations to ensure everything is set up correctly.

## Pre-Migration Checklist

- [ ] Supabase project is created
- [ ] Environment variables are configured in `.env.local`
- [ ] You have access to Supabase Dashboard
- [ ] You have reviewed the migration SQL file
- [ ] You have backed up existing data (if applicable)

## Migration 001: Users Table Extension

### Step 1: Review the Migration

- [ ] Read `migrations/001_create_users_table_extension.sql`
- [ ] Understand what will be created:
  - [ ] `user_role` enum type
  - [ ] `public.users` table
  - [ ] RLS policies (3 policies)
  - [ ] Triggers (2 triggers)
  - [ ] Functions (2 functions)
  - [ ] Indexes (2 indexes)

### Step 2: Apply the Migration

Choose one method:

#### Method A: Supabase Dashboard (Recommended)

- [ ] Open [Supabase Dashboard](https://app.supabase.com)
- [ ] Navigate to your project
- [ ] Click **SQL Editor** in the left sidebar
- [ ] Click **New Query**
- [ ] Copy contents of `migrations/001_create_users_table_extension.sql`
- [ ] Paste into SQL Editor
- [ ] Click **Run** (or press Ctrl/Cmd + Enter)
- [ ] Verify success message: "Success. No rows returned"

#### Method B: Supabase CLI

- [ ] Install Supabase CLI (if not installed)
- [ ] Run: `./supabase/apply-migration.sh supabase/migrations/001_create_users_table_extension.sql`
- [ ] Check for success message

### Step 3: Verify the Migration

- [ ] Run verification script in SQL Editor:
  - Copy contents of `verify-users-table.sql`
  - Paste and run in SQL Editor
  - Check all tests show "✓ PASS"

- [ ] Manual verification:
  ```sql
  -- Check table exists
  SELECT * FROM public.users LIMIT 1;
  
  -- Check enum
  SELECT enum_range(NULL::user_role);
  
  -- Check triggers
  SELECT trigger_name FROM information_schema.triggers 
  WHERE event_object_table = 'users';
  ```

### Step 4: Test the Setup

- [ ] Create a test user via Supabase Dashboard:
  - Go to **Authentication** → **Users**
  - Click **Add user**
  - Enter email and password
  - Add user metadata:
    ```json
    {
      "role": "student",
      "full_name": "Test Student"
    }
    ```
  - Click **Create user**

- [ ] Verify profile was auto-created:
  ```sql
  SELECT * FROM public.users 
  WHERE email = 'your-test-email@example.com';
  ```

- [ ] Test RLS policies:
  - Log in as the test user in your application
  - Try to fetch user profile
  - Verify you can only see your own profile

### Step 5: Document Completion

- [ ] Mark task as complete in `tasks.md`
- [ ] Update `SETUP_CHECKLIST.md` if needed
- [ ] Commit migration files to git
- [ ] Document any issues encountered

## Post-Migration Checklist

- [ ] All verification tests passed
- [ ] Test user created successfully
- [ ] Profile auto-creation works
- [ ] RLS policies are functioning
- [ ] No errors in Supabase logs
- [ ] TypeScript types are up to date

## Troubleshooting

### Issue: "type user_role already exists"

**Solution**: The migration was already applied. You can either:
- Skip this migration
- Drop the type first: `DROP TYPE IF EXISTS user_role CASCADE;`
- Then re-run the migration

### Issue: "permission denied"

**Solution**: 
- Ensure you're using the SQL Editor in Supabase Dashboard
- Check you have proper permissions on the project
- Try using service_role key if available

### Issue: Profile not created on signup

**Solution**:
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
- Re-run the migration if needed
- Check Supabase logs for errors

### Issue: RLS blocking access

**Solution**:
- Verify user is authenticated
- Check JWT token contains correct claims
- Review RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'users';`
- Test with service_role key to bypass RLS temporarily

## Next Steps

After completing this migration:

1. ✅ Users table extension is complete
2. ⏭️ Proceed to Task 1.2 next sub-task: Create complaints table
3. ⏭️ Continue with remaining database schema tasks

## Quick Reference

- **Migration file**: `migrations/001_create_users_table_extension.sql`
- **Verification**: `verify-users-table.sql`
- **Documentation**: `docs/DATABASE_SETUP.md`
- **Quick start**: `QUICK_START.md`

## Notes

Add any notes or observations here:

```
Date applied: _______________
Applied by: _______________
Environment: [ ] Development [ ] Staging [ ] Production
Issues encountered: _______________
Resolution time: _______________
```

---

**Status**: 
- [ ] Not started
- [ ] In progress
- [ ] Completed
- [ ] Verified
- [ ] Tested

**Completion Date**: _______________
