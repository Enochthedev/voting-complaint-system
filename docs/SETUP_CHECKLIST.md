# Setup Checklist

Use this checklist to ensure your Student Complaint Resolution System is properly configured.

## ✅ Environment Variables Setup

### Step 1: Create Environment File

- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```

### Step 2: Configure Supabase (Required)

- [ ] Create a Supabase project at https://app.supabase.com
- [ ] Get your Project URL from: Settings > API > Project URL
- [ ] Get your anon/public key from: Settings > API > Project API keys
- [ ] Get your service_role key from: Settings > API > Project API keys
- [ ] Update these values in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Configure Application Settings (Optional)

- [ ] Set `NEXT_PUBLIC_APP_URL` (default: http://localhost:3000)
- [ ] Adjust file upload limits if needed:
  - `NEXT_PUBLIC_MAX_FILE_SIZE` (default: 10MB)
  - `NEXT_PUBLIC_MAX_FILES_PER_COMPLAINT` (default: 5)

### Step 4: Configure Feature Flags (Optional)

- [ ] Review and adjust feature flags in `.env.local`:
  - `NEXT_PUBLIC_ENABLE_ANONYMOUS_COMPLAINTS`
  - `NEXT_PUBLIC_ENABLE_VOTING`
  - `NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS`
  - `NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS`

### Step 5: Validate Configuration

- [ ] Run validation script:
  ```bash
  npm run validate-env
  ```
- [ ] Fix any errors reported by the validation script
- [ ] Ensure all required variables show ✓ (green checkmark)

## 📋 Next Steps

After completing environment setup:

1. **Database Setup** (Task 1.2)
   - ✅ Create users table extension (see `docs/DATABASE_SETUP.md`)
   - [ ] Create complaints table and related tables
   - [ ] Set up indexes for performance
   - [ ] Implement full-text search
   - [ ] Configure Row Level Security policies

2. **Authentication Setup** (Task 2.1)
   - Configure Supabase Auth settings
   - Set up email/password authentication
   - Test user registration and login

3. **Development**
   - Start the development server: `npm run dev`
   - Access the application at http://localhost:3000

## 🔒 Security Reminders

- ⚠️ Never commit `.env.local` to version control
- ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- ⚠️ Set `NEXT_PUBLIC_DEBUG_MODE=false` in production
- ⚠️ Use different credentials for development and production

## 📚 Documentation

- [Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md) - Comprehensive guide
- [Database Setup Guide](./DATABASE_SETUP.md) - Database schema and migration guide
- [README.md](../README.md) - Project overview and quick start
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) - Supabase configuration guide

## 🆘 Troubleshooting

If you encounter issues:

1. Check [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md#troubleshooting)
2. Run `npm run validate-env` for diagnostics
3. Verify Supabase credentials are correct
4. Restart development server after changing `.env.local`

## ✨ Quick Test

Test that environment variables are working:

```bash
# Validate environment
npm run validate-env

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

If the application loads without errors, your environment is configured correctly!
