# Quick Start: Users Table Setup

## TL;DR

1. Open [Supabase Dashboard](https://app.supabase.com) → Your Project → SQL Editor
2. Copy contents of `migrations/001_create_users_table_extension.sql`
3. Paste and click **Run**
4. Done! ✅

## What This Creates

- ✅ `public.users` table extending `auth.users`
- ✅ `user_role` enum (student, lecturer, admin)
- ✅ Row Level Security policies
- ✅ Auto-create profile trigger on user signup
- ✅ Auto-update timestamp trigger

## Quick Test

After applying the migration, test it:

```javascript
// Sign up a new user
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123',
  options: {
    data: {
      role: 'student',
      full_name: 'Test User'
    }
  }
});

// Profile is automatically created in public.users!
```

## Verify in SQL Editor

```sql
-- Check the table exists
SELECT * FROM public.users LIMIT 5;

-- Check the enum
SELECT enum_range(NULL::user_role);

-- Check triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users';
```

## What's Next?

After this migration:
- [ ] Create complaints table
- [ ] Create complaint-related tables
- [ ] Set up indexes
- [ ] Implement full-text search

See `docs/DATABASE_SETUP.md` for detailed documentation.

## Troubleshooting

**Error: "type user_role already exists"**
- The migration was already applied. Skip or drop the type first.

**Error: "permission denied"**
- Make sure you're using the SQL Editor in Supabase Dashboard with proper permissions.

**Profile not created on signup?**
- Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Re-run the migration if needed.

## File Locations

- Migration SQL: `supabase/migrations/001_create_users_table_extension.sql`
- TypeScript types: `src/types/database.types.ts` (already includes User interface)
- Full documentation: `docs/DATABASE_SETUP.md`
