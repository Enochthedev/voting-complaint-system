# Security Guidelines

## Environment Variables Security

### ✅ Safe for Frontend (Client-Side)

These variables are prefixed with `NEXT_PUBLIC_` and are safe to expose to the client:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-app.com
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
# ... all other NEXT_PUBLIC_* variables
```

**Why it's safe:**
- The `NEXT_PUBLIC_` prefix means Next.js will bundle these into the client-side JavaScript
- The Supabase anon key is designed to be public - it's protected by Row Level Security (RLS) policies
- These values are visible in the browser's network tab and source code

### ⚠️ NEVER Expose to Frontend

These variables should **NEVER** be prefixed with `NEXT_PUBLIC_` or exposed to the client:

```env
# ❌ DANGEROUS - Do not add to Vercel for frontend deployments
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Why it's dangerous:**
- The service role key **bypasses all RLS policies**
- Anyone with this key has full admin access to your database
- It can read, modify, or delete any data regardless of security rules

### Current Application Architecture

This application is **frontend-only** and uses:
- ✅ Client-side Supabase client with anon key
- ✅ Row Level Security (RLS) policies for data protection
- ✅ JWT-based authentication
- ❌ No server-side API routes that need service role key

**Result:** You do **NOT** need `SUPABASE_SERVICE_ROLE_KEY` for deployment.

## When Would You Need Service Role Key?

You would only need the service role key if you add:

1. **Server-Side API Routes** (Next.js API routes in `/app/api/`)
   - Admin operations that bypass RLS
   - Bulk data operations
   - System maintenance tasks

2. **Server Actions** (Next.js Server Actions)
   - Operations requiring elevated privileges
   - Background jobs

3. **Cron Jobs / Edge Functions**
   - Scheduled tasks
   - Auto-escalation (currently uses Edge Function with its own config)

## Best Practices

### ✅ DO:
- Use the anon key for all client-side operations
- Rely on RLS policies for data security
- Keep service role key in server-side code only
- Use environment variables for configuration
- Rotate keys if they're ever exposed
- Use different Supabase projects for dev/staging/production

### ❌ DON'T:
- Never commit `.env.local` to Git
- Never expose service role key to the client
- Never use service role key in client-side code
- Never share keys in public channels
- Never hardcode credentials in source code
- Never use production keys in development

## Vercel Deployment Security

When deploying to Vercel:

1. **Only add these to Vercel environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   NEXT_PUBLIC_APP_URL
   ```

2. **Do NOT add:**
   ```
   SUPABASE_SERVICE_ROLE_KEY  ❌
   ```

3. **Environment Selection:**
   - Add variables to all environments (Production, Preview, Development)
   - Or scope them per environment if needed

## Row Level Security (RLS)

The application's security relies on RLS policies:

### Students Can:
- ✅ Read their own complaints
- ✅ Create new complaints
- ✅ Update their own draft complaints
- ✅ Read public announcements
- ✅ Read their own notifications

### Students Cannot:
- ❌ Read other students' complaints (unless public)
- ❌ Modify other students' data
- ❌ Access admin functions
- ❌ Bypass security policies

### Lecturers Can:
- ✅ Read all complaints
- ✅ Update complaint status
- ✅ Add comments and feedback
- ✅ Create announcements
- ✅ View analytics

### Admins Can:
- ✅ All lecturer permissions
- ✅ Manage users
- ✅ Configure escalation rules
- ✅ Access system settings

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Anon key used for client-side operations
- [x] Service role key not exposed to frontend
- [x] `.env.local` in `.gitignore`
- [x] Environment variables documented
- [x] Authentication required for protected routes
- [x] Role-based access control implemented
- [ ] Regular security audits
- [ ] Key rotation schedule
- [ ] Monitoring and alerting

## Incident Response

If a key is exposed:

1. **Immediately rotate the key** in Supabase dashboard
2. Update environment variables in all deployments
3. Review access logs for suspicious activity
4. Audit affected data
5. Document the incident
6. Update security procedures

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Questions?

If you're unsure about security:
1. Check this document
2. Review Supabase RLS policies
3. Test with different user roles
4. Consult security documentation
5. Ask for a security review

---

**Remember:** When in doubt, don't expose it! The anon key + RLS is sufficient for most operations.
