# Admin Setup Guide

## Security Update
The signup process has been secured. Users can no longer select their role during signup. All new users are automatically assigned the `student` role.

## Promoting a User to Admin or Lecturer
To promote a user to `admin` or `lecturer`, you must execute a SQL command in the Supabase SQL Editor.

### 1. Get the User's Email
Ask the user to sign up via the application. Once they have signed up, get their email address.

### 2. Run the Promotion SQL
Run the following SQL query in your Supabase SQL Editor, replacing `target_email@example.com` with the actual email and `new_role` with either `'admin'` or `'lecturer'`.

```sql
-- Promote a user to admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'target_email@example.com';

-- Verify the change
SELECT * FROM public.users WHERE email = 'target_email@example.com';
```

### 3. Verify Access
Ask the user to sign out and sign back in (or refresh the page) to see their new permissions.
