# Vercel Deployment Configuration Guide

## Environment Variables Setup

To fix the session and authentication issues on Vercel, you need to set the following environment variables in your Vercel dashboard:

### Required Variables (Critical)

```
NEXT_PUBLIC_SUPABASE_URL=https://tnenutksxxdhamlyogto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZW51dGtzeHhkaGFtbHlvZ3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjM0NjgsImV4cCI6MjA3OTAzOTQ2OH0.FFrGY6yEdz6gKIxIJADch6LaiSQurz_061qPc9Y_Gvk
```

### Production App URL (Important)

```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Replace `your-app-name.vercel.app` with your actual Vercel deployment URL**

### Optional Variables

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZW51dGtzeHhkaGFtbHlvZ3RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ2MzQ2OCwiZXhwIjoyMDc5MDM5NDY4fQ.FTHE8QU-zVqjh9sj-1vFyNiHPeG-m90iMoH7oPtXlfo
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_MAX_FILES_PER_COMPLAINT=5
NEXT_PUBLIC_ENABLE_ANONYMOUS_COMPLAINTS=true
NEXT_PUBLIC_ENABLE_VOTING=true
NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS=true
NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS=true
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=20
NEXT_PUBLIC_MAX_PAGE_SIZE=100
SESSION_TIMEOUT=3600
RATE_LIMIT_COMPLAINTS_PER_HOUR=10
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true
```

## How to Set Environment Variables on Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set them for all environments (Production, Preview, Development)
6. Redeploy your application

## Supabase Configuration

### 1. Update Supabase Auth Settings

In your Supabase dashboard:

1. Go to Authentication → Settings
2. Add your Vercel URL to "Site URL": `https://your-app-name.vercel.app`
3. Add your Vercel URL to "Redirect URLs": `https://your-app-name.vercel.app/callback`

### 2. Check RLS Policies

Ensure your Row Level Security policies are properly configured:

- Users should be able to read their own data
- Users should be able to create complaints
- Proper role-based access is set up

## Common Issues and Solutions

### Issue 1: Dashboard Not Loading

**Cause**: User authentication failing
**Solution**:

- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Verify Supabase Site URL includes your Vercel domain

### Issue 2: Can't Submit Complaints

**Cause**: Authentication or RLS policy issues
**Solution**:

- Check browser console for authentication errors
- Verify RLS policies allow authenticated users to insert complaints
- Ensure user session is valid

### Issue 3: Redirect Loops

**Cause**: Incorrect redirect URLs
**Solution**:

- Set `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
- Update Supabase redirect URLs to match

## Testing Checklist

After deployment:

- [ ] Can access login page
- [ ] Can log in with test credentials
- [ ] Dashboard loads without errors
- [ ] Can submit complaints
- [ ] Navigation works properly
- [ ] No console errors related to authentication

## Debug Mode

Set `NEXT_PUBLIC_DEBUG_MODE=true` to enable detailed logging in production for troubleshooting.

## Test Credentials

Use the credentials from `TEST_USERS.md`:

- Student: student@university.edu / Student123!
- Lecturer: lecturer@university.edu / Lecturer123!
- Admin: admin@university.edu / Admin123!
