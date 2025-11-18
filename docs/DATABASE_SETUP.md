# Database Setup Guide

This guide walks you through setting up the database schema for the Student Complaint Resolution System.

## Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Access to your Supabase project dashboard
- Your Supabase credentials configured in `.env.local`

## Quick Start

### Step 1: Apply Migrations

The database schema is defined in SQL migration files located in `supabase/migrations/`. Apply them in numerical order:

1. **Create Users Table Extension** (`001_create_users_table_extension.sql`)
   - Extends Supabase auth.users with role and profile information
   - Creates user_role enum (student, lecturer, admin)
   - Sets up Row Level Security policies
   - Creates triggers for automatic profile creation

2. **Create Complaints Table** (to be created in next task)
3. **Create Related Tables** (to be created in subsequent tasks)

### Step 2: Apply via Supabase Dashboard

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `supabase/migrations/001_create_users_table_extension.sql`
6. Paste into the SQL Editor
7. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
8. Verify success - you should see "Success. No rows returned"

### Step 3: Verify the Setup

Run this query in the SQL Editor to verify the users table was created:

```sql
-- Check if users table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

You should see columns: id, email, role, full_name, created_at, updated_at

## Users Table Schema

### Table: `public.users`

Extends the Supabase `auth.users` table with application-specific fields.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users(id) |
| `email` | TEXT | User's email address |
| `role` | user_role | User role: 'student', 'lecturer', or 'admin' |
| `full_name` | TEXT | User's full name for display |
| `created_at` | TIMESTAMP | When the user was created |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Enum: `user_role`

```sql
CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin');
```

## Row Level Security (RLS) Policies

The users table has the following RLS policies:

1. **Users can view own profile**
   - Users can SELECT their own user record
   - Condition: `auth.uid() = id`

2. **Users can update own profile**
   - Users can UPDATE their own user record
   - Condition: `auth.uid() = id`

3. **Lecturers and admins can view all users**
   - Lecturers and admins can SELECT all user records
   - Condition: Current user has role 'lecturer' or 'admin'

## Automatic Triggers

### 1. Auto-create User Profile on Signup

When a new user signs up via Supabase Auth, a trigger automatically creates their profile in the `public.users` table.

**Function**: `handle_new_user()`
**Trigger**: `on_auth_user_created`

The trigger reads metadata from the signup:
- `role` from `raw_user_meta_data->>'role'` (defaults to 'student')
- `full_name` from `raw_user_meta_data->>'full_name'`

### 2. Auto-update Timestamp

When a user profile is updated, the `updated_at` field is automatically set to the current timestamp.

**Function**: `update_updated_at_column()`
**Trigger**: `update_users_updated_at`

## Testing the Setup

### Test 1: Create a Test User

Use the Supabase Auth UI or API to create a test user:

```javascript
// In your application or via Supabase Dashboard Auth section
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'securepassword123',
  options: {
    data: {
      role: 'student',
      full_name: 'Test Student'
    }
  }
});
```

### Test 2: Verify Profile Creation

Check that the profile was automatically created:

```sql
SELECT * FROM public.users WHERE email = 'test@example.com';
```

### Test 3: Test RLS Policies

Try accessing the users table with different authentication contexts:

```javascript
// As the user themselves - should work
const { data: ownProfile } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// As a student trying to view another user - should fail
const { data: otherProfile } = await supabase
  .from('users')
  .select('*')
  .eq('id', otherUserId)
  .single();
// Expected: null or error due to RLS

// As a lecturer - should work
const { data: allUsers } = await supabase
  .from('users')
  .select('*');
// Expected: Returns all users if current user is lecturer/admin
```

## User Registration Flow

When implementing user registration in your application:

1. **Collect user information**: email, password, full_name, role
2. **Call Supabase Auth signup**:
   ```javascript
   const { data, error } = await supabase.auth.signUp({
     email: userEmail,
     password: userPassword,
     options: {
       data: {
         role: userRole, // 'student', 'lecturer', or 'admin'
         full_name: userFullName
       }
     }
   });
   ```
3. **Profile is automatically created** by the `on_auth_user_created` trigger
4. **User can now log in** and their profile will be available in `public.users`

## Troubleshooting

### Issue: Profile not created after signup

**Possible causes:**
1. Trigger not created properly
2. Insufficient permissions

**Solution:**
- Re-run the migration SQL
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Manually create profile if needed:
  ```sql
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    'user-uuid-here',
    'user@example.com',
    'student',
    'User Name'
  );
  ```

### Issue: RLS policy blocking access

**Possible causes:**
1. User not authenticated
2. JWT token doesn't contain correct role information

**Solution:**
- Verify user is logged in: `const { data: { user } } = await supabase.auth.getUser();`
- Check JWT claims in Supabase Dashboard > Authentication > Users
- Ensure role is set in user metadata

### Issue: Cannot update user role

**Possible causes:**
1. Role is set during signup and typically shouldn't change
2. Need admin privileges to change roles

**Solution:**
- For role changes, create an admin function or use Supabase Dashboard
- Update via SQL Editor:
  ```sql
  UPDATE public.users 
  SET role = 'lecturer' 
  WHERE id = 'user-uuid-here';
  ```

## Next Steps

After setting up the users table:

1. ✅ Users table extension created
2. ⏭️ Create complaints table (Task 1.2 - next sub-task)
3. ⏭️ Create related tables (tags, attachments, history, etc.)
4. ⏭️ Set up indexes for performance
5. ⏭️ Implement full-text search
6. ⏭️ Create additional triggers and functions

## Security Best Practices

1. **Never expose service_role key** to the client
2. **Always use RLS policies** - never disable RLS in production
3. **Validate user roles** on both client and server
4. **Use JWT claims** for role-based access control
5. **Audit user actions** through complaint_history table
6. **Regularly review** RLS policies and permissions

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
