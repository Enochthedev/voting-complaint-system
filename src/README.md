# Source Code Structure

This document describes the organization of the source code for the Student Complaint Resolution System.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── ui/               # Reusable UI components (buttons, inputs, cards, etc.)
│   ├── complaints/       # Complaint-related components
│   ├── notifications/    # Notification system components
│   ├── votes/           # Voting system components
│   ├── announcements/   # Announcement components
│   ├── analytics/       # Analytics and dashboard components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components (header, sidebar, etc.)
│
├── hooks/                # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useComplaints.ts # Complaint operations hook
│   ├── useNotifications.ts # Real-time notifications hook
│   └── ...
│
├── lib/                  # Utility functions and configurations
│   ├── api/             # API client functions for Supabase
│   ├── utils/           # Helper functions and utilities
│   ├── validations/     # Form validation schemas
│   ├── constants.ts     # Application constants
│   ├── env.ts           # Environment variable validation
│   ├── supabase.ts      # Supabase client (client-side)
│   ├── supabase-server.ts # Supabase client (server-side)
│   └── supabase-utils.ts  # Supabase utility functions
│
├── types/               # TypeScript type definitions
│   ├── database.types.ts # Supabase generated types
│   └── index.ts         # Central type exports
│
└── middleware.ts        # Next.js middleware for auth

```

## Component Organization

Components are organized by feature/domain to improve maintainability and discoverability:

- **ui/**: Generic, reusable UI components that can be used across the application
- **complaints/**: All components related to complaint management
- **notifications/**: Components for the notification system
- **votes/**: Components for the voting feature
- **announcements/**: Components for announcements
- **analytics/**: Dashboard and analytics components
- **auth/**: Authentication-related components
- **layout/**: Layout and navigation components

## Hooks

Custom React hooks encapsulate reusable logic:

- **useAuth**: Manages authentication state and operations
- **useComplaints**: Handles complaint data fetching and mutations
- **useNotifications**: Manages real-time notifications
- **useSupabase**: Provides access to Supabase client
- **useUser**: Manages current user data

## Library (lib/)

The lib directory contains:

- **api/**: Functions for interacting with Supabase (CRUD operations)
- **utils/**: Helper functions (date formatting, string manipulation, etc.)
- **validations/**: Form validation schemas using Zod or similar
- **constants.ts**: Application-wide constants (categories, statuses, etc.)
- **supabase*.ts**: Supabase client configurations

## Types

TypeScript types are centralized in the types directory:

- **database.types.ts**: Auto-generated types from Supabase schema
- **index.ts**: Central export point for all types

## Best Practices

1. **Colocation**: Keep related files close together
2. **Naming**: Use descriptive names that reflect the component's purpose
3. **Exports**: Use named exports for better tree-shaking
4. **Imports**: Use absolute imports from `@/` for cleaner import paths
5. **Types**: Always define proper TypeScript types
6. **Documentation**: Add JSDoc comments for complex functions

## Next Steps

As you implement features, create files in the appropriate directories following this structure. The `.gitkeep` files can be removed once actual files are added to each directory.
