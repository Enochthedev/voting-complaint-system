# Supabase Configuration Guide

## Installed Packages

- `@supabase/supabase-js` - Main Supabase client library
- `@supabase/ssr` - Server-side rendering support for Next.js

## Files Created

### Environment Configuration

- `.env.local` - Local environment variables (not committed to git)
- `.env.example` - Template for environment variables

### Supabase Client Files

- `src/lib/supabase.ts` - Client-side Supabase client
- `src/lib/supabase-server.ts` - Server-side Supabase client for Server Components
- `src/lib/supabase-utils.ts` - Utility functions for common operations
- `src/middleware.ts` - Middleware for session management

### Type Definitions

- `src/types/database.types.ts` - TypeScript types for database schema

## Configuration Steps

### 1. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Get your credentials from your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### 2. Client-Side Usage

For client components, import the client from `src/lib/supabase.ts`:

```typescript
import { supabase } from '@/lib/supabase';

// Example: Fetch data
const { data, error } = await supabase.from('complaints').select('*');
```

### 3. Server-Side Usage

For server components and API routes, use the server client:

```typescript
import { createServerClient } from '@/lib/supabase-server';

// In an async server component or API route
const supabase = await createServerClient();
const { data, error } = await supabase.from('complaints').select('*');
```

### 4. Utility Functions

Common authentication operations are available in `src/lib/supabase-utils.ts`:

```typescript
import { getCurrentUser, hasRole, signOut } from '@/lib/supabase-utils';

// Get current user
const user = await getCurrentUser();

// Check role
const isLecturer = await hasRole('lecturer');

// Sign out
await signOut();
```

## Middleware

The middleware in `src/middleware.ts` automatically:

- Refreshes expired sessions
- Manages authentication cookies
- Runs on all routes except static files

## Next Steps

1. Set up your Supabase database schema (see design.md)
2. Configure Row Level Security (RLS) policies
3. Set up authentication providers in Supabase dashboard
4. Create the database tables and triggers
5. Configure storage buckets for file attachments

## Security Notes

- Never commit `.env.local` to version control
- The `.env*` pattern is already in `.gitignore`
- Use environment variables for all sensitive credentials
- RLS policies should be configured in Supabase for data security
