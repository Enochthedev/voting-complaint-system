# Environment Variables Documentation

This document provides comprehensive information about all environment variables used in the Student Complaint Resolution System.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Required Variables](#required-variables)
3. [Optional Variables](#optional-variables)
4. [Security Best Practices](#security-best-practices)
5. [Environment-Specific Configuration](#environment-specific-configuration)
6. [Validation](#validation)
7. [Troubleshooting](#troubleshooting)

## Quick Start

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to **Settings > API**
   - Copy the **Project URL** and **anon/public key**

3. Update `.env.local` with your credentials

4. Validate your configuration:
   ```bash
   npm run validate-env
   ```

## Required Variables

### `NEXT_PUBLIC_SUPABASE_URL`

- **Description**: Your Supabase project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to find**: Supabase Dashboard > Project Settings > API > Project URL
- **Client-side**: ✅ Yes (prefixed with `NEXT_PUBLIC_`)

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Description**: Supabase anonymous/public API key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard > Project Settings > API > Project API keys > anon/public
- **Client-side**: ✅ Yes (prefixed with `NEXT_PUBLIC_`)
- **Note**: This key is safe to expose to the client as it respects Row Level Security (RLS) policies

### `SUPABASE_SERVICE_ROLE_KEY`

- **Description**: Supabase service role key for admin operations
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard > Project Settings > API > Project API keys > service_role
- **Client-side**: ❌ No (server-only)
- **⚠️ CRITICAL**: This key bypasses RLS policies. NEVER expose it to the client!

## Optional Variables

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`

- **Description**: Base URL for the application
- **Default**: `http://localhost:3000`
- **Production Example**: `https://complaints.university.edu`
- **Client-side**: ✅ Yes
- **Usage**: Used for redirects, email links, and OAuth callbacks

### File Upload Configuration

#### `NEXT_PUBLIC_MAX_FILE_SIZE`

- **Description**: Maximum file size in bytes
- **Default**: `10485760` (10 MB)
- **Example**: `20971520` (20 MB)
- **Client-side**: ✅ Yes
- **Usage**: Enforces file size limits on complaint attachments

#### `NEXT_PUBLIC_MAX_FILES_PER_COMPLAINT`

- **Description**: Maximum number of files per complaint
- **Default**: `5`
- **Example**: `10`
- **Client-side**: ✅ Yes
- **Usage**: Limits the number of attachments per complaint

### Feature Flags

#### `NEXT_PUBLIC_ENABLE_ANONYMOUS_COMPLAINTS`

- **Description**: Enable/disable anonymous complaint submission
- **Default**: `true`
- **Values**: `true` | `false`
- **Client-side**: ✅ Yes
- **Usage**: Controls whether students can submit complaints anonymously

#### `NEXT_PUBLIC_ENABLE_VOTING`

- **Description**: Enable/disable voting system
- **Default**: `true`
- **Values**: `true` | `false`
- **Client-side**: ✅ Yes
- **Usage**: Controls whether lecturers can create polls and students can vote

#### `NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS`

- **Description**: Enable/disable announcements feature
- **Default**: `true`
- **Values**: `true` | `false`
- **Client-side**: ✅ Yes
- **Usage**: Controls whether lecturers can create system-wide announcements

#### `NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS`

- **Description**: Enable/disable real-time notifications via WebSocket
- **Default**: `true`
- **Values**: `true` | `false`
- **Client-side**: ✅ Yes
- **Usage**: Controls whether real-time notifications are enabled

### Pagination Configuration

#### `NEXT_PUBLIC_DEFAULT_PAGE_SIZE`

- **Description**: Default number of items per page
- **Default**: `20`
- **Example**: `50`
- **Client-side**: ✅ Yes
- **Usage**: Sets the default pagination size for complaint lists

#### `NEXT_PUBLIC_MAX_PAGE_SIZE`

- **Description**: Maximum number of items per page
- **Default**: `100`
- **Example**: `200`
- **Client-side**: ✅ Yes
- **Usage**: Prevents excessive data loading by limiting page size

### Session & Security

#### `SESSION_TIMEOUT`

- **Description**: Session timeout in seconds
- **Default**: `3600` (1 hour)
- **Example**: `7200` (2 hours)
- **Client-side**: ❌ No (server-only)
- **Usage**: Controls how long user sessions remain active

#### `RATE_LIMIT_COMPLAINTS_PER_HOUR`

- **Description**: Maximum complaints a user can submit per hour
- **Default**: `10`
- **Example**: `20`
- **Client-side**: ❌ No (server-only)
- **Usage**: Prevents spam and abuse by rate-limiting complaint submissions

### Analytics & Debug

#### `NEXT_PUBLIC_ENABLE_ANALYTICS`

- **Description**: Enable/disable analytics tracking
- **Default**: `false`
- **Values**: `true` | `false`
- **Client-side**: ✅ Yes
- **Usage**: Controls whether analytics events are tracked

#### `NEXT_PUBLIC_DEBUG_MODE`

- **Description**: Enable/disable debug logging
- **Default**: `false`
- **Values**: `true` | `false`
- **Client-side**: ✅ Yes
- **⚠️ WARNING**: Always set to `false` in production!

## Security Best Practices

### 1. Never Commit Sensitive Variables

- `.env.local` is in `.gitignore` by default
- Never commit files containing real credentials
- Use `.env.example` as a template only

### 2. Client vs Server Variables

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables (no prefix) are only available on the server
- Never prefix sensitive keys like `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`

### 3. Service Role Key Protection

```typescript
// ❌ WRONG - Never do this!
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// ✅ CORRECT - Server-only access
import { serverEnv } from '@/lib/env';
const serviceKey = serverEnv.supabase.serviceRoleKey; // Only in server components
```

### 4. Production Configuration

- Use strong, unique keys for production
- Rotate keys regularly
- Use different keys for development and production
- Enable debug mode only in development

### 5. Environment Variable Validation

- Run `npm run validate-env` before deployment
- The build process automatically validates required variables
- Fix any validation errors before deploying

## Environment-Specific Configuration

### Development (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG_MODE=true
```

### Production (.env.production)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
NEXT_PUBLIC_APP_URL=https://complaints.university.edu
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all required variables
4. Set environment scope (Production, Preview, Development)
5. Redeploy after adding variables

## Validation

### Automatic Validation

The project includes automatic environment validation:

```bash
# Validate manually
npm run validate-env

# Automatic validation before build
npm run build
```

### Validation Script Output

```
🔍 Validating Environment Variables...

Required Variables:
  ✓ NEXT_PUBLIC_SUPABASE_URL
  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY

Recommended Variables:
  ✓ SUPABASE_SERVICE_ROLE_KEY
  ✓ NEXT_PUBLIC_APP_URL

Validation Checks:
  ✓ Supabase URL format is valid

✅ All Environment Variables Validated Successfully!
```

## Troubleshooting

### Error: Missing required environment variable

**Problem**: Build fails with missing variable error

**Solution**:

1. Check that `.env.local` exists
2. Verify the variable is set in `.env.local`
3. Ensure the variable name is spelled correctly
4. Restart the development server after adding variables

### Error: Supabase URL format invalid

**Problem**: Validation warns about invalid URL format

**Solution**:

- Ensure URL starts with `https://`
- Verify URL ends with `.supabase.co`
- Copy URL directly from Supabase Dashboard

### Variables not updating

**Problem**: Changes to `.env.local` not reflected in app

**Solution**:

1. Restart the development server (`npm run dev`)
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

### Service role key exposed to client

**Problem**: Service role key accessible in browser

**Solution**:

- Remove `NEXT_PUBLIC_` prefix from `SUPABASE_SERVICE_ROLE_KEY`
- Never use service role key in client components
- Use only in server components, API routes, or Edge Functions

### Rate limiting not working

**Problem**: Rate limits not being enforced

**Solution**:

- Verify `RATE_LIMIT_COMPLAINTS_PER_HOUR` is set
- Ensure rate limiting middleware is implemented
- Check server logs for rate limit errors

## Type-Safe Access

The project provides type-safe environment variable access:

```typescript
import { env, serverEnv, isFeatureEnabled } from '@/lib/env';

// Client-safe variables
const supabaseUrl = env.supabase.url;
const maxFileSize = env.upload.maxFileSize;
const pageSize = env.pagination.defaultPageSize;

// Check feature flags
if (isFeatureEnabled('anonymousComplaints')) {
  // Show anonymous option
}

// Server-only variables (use only in server components/API routes)
const serviceKey = serverEnv.supabase.serviceRoleKey;
const sessionTimeout = serverEnv.session.timeout;
```

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Variables Guide](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues with environment configuration:

1. Check this documentation
2. Run `npm run validate-env` for diagnostics
3. Review the [Troubleshooting](#troubleshooting) section
4. Check the project README.md
