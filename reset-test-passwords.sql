-- Reset passwords for test users
-- This needs to be run with admin privileges

-- Note: Supabase doesn't allow direct password updates via SQL
-- We need to use the Admin API or reset password flow
-- For now, let's verify the users exist

SELECT id, email, email_confirmed_at, encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email IN ('student@test.com', 'lecturer@test.com', 'admin@test.com')
ORDER BY email;
