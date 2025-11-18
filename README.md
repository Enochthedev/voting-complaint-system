This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Student Complaint Resolution System

A web application that enables students to submit complaints (openly or anonymously) and allows lecturers/admins to manage, respond to, and create engagement opportunities around these complaints.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Environment Setup

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:

### Required Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (found in Project Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (found in Project Settings > API)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (Server-side only - for admin operations)

### Optional Configuration Variables

#### Application Settings

- `NEXT_PUBLIC_APP_URL`: Base URL for the application (default: `http://localhost:3000`)

#### File Upload Settings

- `NEXT_PUBLIC_MAX_FILE_SIZE`: Maximum file size in bytes (default: `10485760` = 10MB)
- `NEXT_PUBLIC_MAX_FILES_PER_COMPLAINT`: Maximum number of files per complaint (default: `5`)

#### Feature Flags

- `NEXT_PUBLIC_ENABLE_ANONYMOUS_COMPLAINTS`: Enable anonymous complaint submission (default: `true`)
- `NEXT_PUBLIC_ENABLE_VOTING`: Enable voting system (default: `true`)
- `NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS`: Enable announcements (default: `true`)
- `NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS`: Enable real-time notifications (default: `true`)

#### Pagination Settings

- `NEXT_PUBLIC_DEFAULT_PAGE_SIZE`: Default number of items per page (default: `20`)
- `NEXT_PUBLIC_MAX_PAGE_SIZE`: Maximum number of items per page (default: `100`)

#### Session & Security

- `SESSION_TIMEOUT`: Session timeout in seconds (default: `3600` = 1 hour)
- `RATE_LIMIT_COMPLAINTS_PER_HOUR`: Maximum complaints per user per hour (default: `10`)

#### Analytics & Debug

- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable analytics tracking (default: `false`)
- `NEXT_PUBLIC_DEBUG_MODE`: Enable debug logging (default: `false`, set to `false` in production)

### Environment Variable Security

⚠️ **Important Security Notes:**

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables (without `NEXT_PUBLIC_` prefix) are only available on the server

### Type-Safe Environment Access

The project includes a type-safe environment configuration in `src/lib/env.ts`:

```typescript
import { env, serverEnv } from '@/lib/env';

// Client-safe environment variables
const supabaseUrl = env.supabase.url;
const maxFileSize = env.upload.maxFileSize;

// Server-only variables (use only in server components/API routes)
const serviceRoleKey = serverEnv.supabase.serviceRoleKey;
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
