# Setting Up Test Users with Authentication

The test users exist in the database but need to have their passwords set in Supabase Auth.

## Option 1: Use Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/tnenutksxxdhamlyogto/auth/users
2. For each test user (student@test.com, lecturer@test.com, admin@test.com):
   - Click on the user
   - Click "Reset Password"
   - Set password to: `password123`
   - Confirm the password

## Option 2: Use Supabase CLI

Run these commands to reset passwords:

```bash
# Reset student password
supabase auth users reset-password student@test.com --password password123

# Reset lecturer password  
supabase auth users reset-password lecturer@test.com --password password123

# Reset admin password
supabase auth users reset-password admin@test.com --password password123
```

## Option 3: Sign Up New Users

If the above doesn't work, you can sign up new users:

1. Go to http://localhost:3000/auth/register
2. Sign up with:
   - Email: `student@test.com`
   - Password: `password123`
   - Full Name: `Test Student`
3. Repeat for lecturer@test.com and admin@test.com

**Note:** After signing up, you'll need to update the user's role in the database:

```sql
-- Set role to lecturer
UPDATE users SET role = 'lecturer' WHERE email = 'lecturer@test.com';

-- Set role to admin
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

## Verify Users

Check that users exist and have passwords:

```sql
SELECT id, email, email_confirmed_at, encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email IN ('student@test.com', 'lecturer@test.com', 'admin@test.com')
ORDER BY email;
```

All users should show `has_password: true` and have an `email_confirmed_at` timestamp.
