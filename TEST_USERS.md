# Test User Credentials

This document contains the login credentials for test users in the Student Complaint Resolution System.

## Test Users

### Admin User

- **Email**: admin@university.edu
- **Password**: Admin123!
- **Role**: Admin
- **Full Name**: System Administrator

### Lecturer User

- **Email**: lecturer@university.edu
- **Password**: Lecturer123!
- **Role**: Lecturer
- **Full Name**: Dr. Jane Smith

### Student User

- **Email**: student@university.edu
- **Password**: Student123!
- **Role**: Student
- **Full Name**: John Doe

## Usage Instructions

1. Navigate to the login page at `/login`
2. Use any of the above email/password combinations
3. You will be redirected to the appropriate dashboard based on your role

## Security Notes

- These are test credentials for development/testing purposes only
- Do not use these credentials in production
- Change all passwords before deploying to production
- Ensure proper user management is in place for production use

## Password Reset

If you need to reset passwords for these test users, you can:

1. Use the "Forgot Password" link on the login page
2. Or run the password reset SQL script: `reset-test-passwords.sql`

## Database Setup

These users should already exist in your Supabase database. If they don't exist, you can create them by:

1. Running the user setup script
2. Or manually creating them through the Supabase dashboard
3. Ensure the `users` table has the correct role assignments
