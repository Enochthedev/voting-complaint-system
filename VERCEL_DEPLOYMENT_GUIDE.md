# Vercel Deployment Guide

## Quick Setup

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Recommended Variables:**
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional Variables (with defaults):**
```
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
NEXT_PUBLIC_DEBUG_MODE=false
```

### 2. How to Add Environment Variables in Vercel

#### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Your actual value
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

#### Via Vercel CLI:
```bash
# Set a single variable
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Pull environment variables to local
vercel env pull .env.local
```

### 3. Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Redeploy

After adding environment variables:
```bash
# Trigger a new deployment
vercel --prod

# Or push to GitHub (if auto-deploy is enabled)
git push origin main
```

## Troubleshooting

### Build Fails with "Environment Variables Not Set"

**Solution**: Make sure you've added all required environment variables in Vercel dashboard and redeployed.

### "Invalid Supabase URL" Error

**Solution**: 
- Check that your URL starts with `https://`
- Verify it ends with `.supabase.co`
- Example: `https://abcdefghijk.supabase.co`

### Environment Variables Not Working

**Solution**:
1. Check variable names are exactly correct (case-sensitive)
2. Make sure you selected the right environments (Production, Preview, Development)
3. Redeploy after adding variables
4. Clear Vercel cache: Settings → General → Clear Cache

### Build Works Locally But Fails on Vercel

**Solution**:
- Verify all environment variables are set in Vercel
- Check that you're not using `.env.local` values that aren't in Vercel
- Review build logs for specific error messages

## Deployment Checklist

- [ ] Created Supabase production project
- [ ] Ran all database migrations
- [ ] Deployed Edge Functions
- [ ] Added all required environment variables in Vercel
- [ ] Added recommended environment variables
- [ ] Triggered deployment
- [ ] Verified build succeeded
- [ ] Tested deployed application
- [ ] Created test users for each role
- [ ] Verified all features work in production

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to Git
- Never share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- Use different Supabase projects for development and production
- Rotate keys if they're ever exposed

## Next Steps After Deployment

1. **Test the Application**
   - Create test users for each role
   - Test all major features
   - Verify notifications work
   - Test file uploads

2. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor Supabase logs
   - Set up error tracking (Sentry)

3. **Set Up Custom Domain** (Optional)
   - Go to Vercel → Settings → Domains
   - Add your custom domain
   - Update `NEXT_PUBLIC_APP_URL` environment variable

4. **Enable Production Features**
   - Set `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
   - Configure email templates in Supabase
   - Set up backup schedule

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check Supabase logs
3. Review browser console for errors
4. Refer to documentation in `/docs` folder
