# React Query Implementation Guide

## Overview

React Query (TanStack Query) has been implemented in the Student Complaint System to provide:

- **Automatic caching** - API responses are cached and reused
- **Background refetching** - Data stays fresh automatically
- **Request deduplication** - Multiple components requesting the same data only trigger one API call
- **Optimistic updates** - UI updates immediately while mutations are in progress
- **Loading and error states** - Built-in state management for async operations

## Installation

React Query has been installed with the following packages:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Configuration

### Provider Setup

The `ReactQueryProvider` is configured in `src/lib/react-query.tsx` and wraps the entire application in `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx
import { ReactQueryProvider } from '@/lib/react-query';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

### Default Configuration

- **staleTime**: 5 minutes - Data is considered fresh for 5 minutes
- **gcTime**: 10 minutes - Unused data is garbage collected after 10 minutes
- **refetchOnWindowFocus**: true - Refetch when user returns to the tab
- **retry**: 1 - Retry failed requests once

## Custom Hooks

### Complaints Hooks (`src/hooks/use-complaints.ts`)

#### Query Hooks

```tsx
import { 
  useUserComplaints, 
  useUserDrafts, 
  useUserComplaintStats,
  useComplaint,
  useAllComplaints 
} from '@/hooks/use-complaints';

// Fetch user's complaints
const { data, isLoading, error } = useUserComplaints(userId);

// Fetch user's drafts
const { data: drafts } = useUserDrafts(userId);

// Fetch complaint statistics
const { data: stats } = useUserComplaintStats(userId);

// Fetch single complaint
const { data: complaint } = useComplaint(complaintId);

// Fetch all complaints (lecturers/admins)
const { data: allComplaints } = useAllComplaints();
```

#### Mutation Hooks

```tsx
import { 
  useCreateComplaint, 
  useUpdateComplaint, 
  useDeleteComplaint,
  useReopenComplaint,
  useSubmitRating 
} from '@/hooks/use-complaints';

// Create complaint
const createMutation = useCreateComplaint();
createMutation.mutate(complaintData, {
  onSuccess: (data) => {
    console.log('Complaint created:', data);
  },
  onError: (error) => {
    console.error('Failed to create complaint:', error);
  }
});

// Update complaint
const updateMutation = useUpdateComplaint();
updateMutation.mutate({ id: complaintId, updates: { status: 'resolved' } });

// Delete complaint
const deleteMutation = useDeleteComplaint();
deleteMutation.mutate(complaintId);

// Reopen complaint
const reopenMutation = useReopenComplaint();
reopenMutation.mutate({ id, justification, userId });

// Submit rating
const ratingMutation = useSubmitRating();
ratingMutation.mutate({ complaintId, studentId, rating: 5, feedbackText: 'Great!' });
```

#### Bulk Operations

```tsx
import { 
  useBulkAssignComplaints, 
  useBulkChangeStatus, 
  useBulkAddTags 
} from '@/hooks/use-complaints';

// Bulk assign
const bulkAssign = useBulkAssignComplaints();
bulkAssign.mutate({ complaintIds, lecturerId, performedBy });

// Bulk status change
const bulkStatus = useBulkChangeStatus();
bulkStatus.mutate({ complaintIds, newStatus: 'resolved', performedBy });

// Bulk add tags
const bulkTags = useBulkAddTags();
bulkTags.mutate({ complaintIds, tags: ['urgent', 'facilities'], performedBy });
```

### Announcements Hooks (`src/hooks/use-announcements.ts`)

```tsx
import { useRecentAnnouncements } from '@/hooks/use-announcements';

// Fetch recent announcements
const { data: announcements } = useRecentAnnouncements(5);
```

### Notifications Hooks (`src/hooks/use-notifications.ts`)

```tsx
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead 
} from '@/hooks/use-notifications';

// Fetch notifications (auto-refetches every 2 minutes)
const { data: notifications } = useNotifications(10);

// Mark as read
const markRead = useMarkAsRead();
markRead.mutate(notificationId);

// Mark all as read
const markAllRead = useMarkAllAsRead();
markAllRead.mutate();
```

### Votes Hooks (`src/hooks/use-votes.ts`)

```tsx
import { useVotes, useHasStudentVoted } from '@/hooks/use-votes';

// Fetch votes
const { data: votes } = useVotes({ isActive: true });

// Check if student has voted
const { data: hasVoted } = useHasStudentVoted(voteId, studentId);
```

## Usage Examples

### Example 1: Component with Query

```tsx
'use client';

import { useUserComplaints } from '@/hooks/use-complaints';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';

export function ComplaintsList({ userId }: { userId: string }) {
  const { data: complaints, isLoading, error } = useUserComplaints(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="destructive">Failed to load complaints</Alert>;
  }

  return (
    <div className="space-y-4">
      {complaints?.map((complaint) => (
        <div key={complaint.id}>{complaint.title}</div>
      ))}
    </div>
  );
}
```

### Example 2: Component with Mutation

```tsx
'use client';

import { useState } from 'react';
import { useCreateComplaint } from '@/hooks/use-complaints';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateComplaintForm({ userId }: { userId: string }) {
  const [title, setTitle] = useState('');
  const createMutation = useCreateComplaint();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate(
      {
        title,
        student_id: userId,
        status: 'new',
        is_draft: false,
      },
      {
        onSuccess: () => {
          setTitle('');
          alert('Complaint created successfully!');
        },
        onError: (error) => {
          alert('Failed to create complaint: ' + error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Complaint title"
      />
      <Button 
        type="submit" 
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Complaint'}
      </Button>
    </form>
  );
}
```

### Example 3: Optimistic Updates

```tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useUpdateComplaint, complaintKeys } from '@/hooks/use-complaints';

export function UpdateComplaintStatus({ complaintId, currentStatus }) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateComplaint();

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate(
      { id: complaintId, updates: { status: newStatus } },
      {
        // Optimistic update
        onMutate: async ({ id, updates }) => {
          // Cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey: complaintKeys.detail(id) });

          // Snapshot previous value
          const previousComplaint = queryClient.getQueryData(complaintKeys.detail(id));

          // Optimistically update
          queryClient.setQueryData(complaintKeys.detail(id), (old: any) => ({
            ...old,
            ...updates,
          }));

          return { previousComplaint };
        },
        // Rollback on error
        onError: (err, variables, context) => {
          if (context?.previousComplaint) {
            queryClient.setQueryData(
              complaintKeys.detail(variables.id),
              context.previousComplaint
            );
          }
        },
      }
    );
  };

  return (
    <select value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)}>
      <option value="new">New</option>
      <option value="in_progress">In Progress</option>
      <option value="resolved">Resolved</option>
    </select>
  );
}
```

### Example 4: Dependent Queries

```tsx
'use client';

import { useComplaint, useHasRatedComplaint } from '@/hooks/use-complaints';

export function ComplaintDetail({ complaintId, userId }) {
  // First query
  const { data: complaint, isLoading: complaintLoading } = useComplaint(complaintId);

  // Second query depends on first
  const { data: hasRated, isLoading: ratingLoading } = useHasRatedComplaint(
    complaintId,
    userId
  );

  if (complaintLoading || ratingLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{complaint?.title}</h1>
      {complaint?.status === 'resolved' && !hasRated && (
        <div>Please rate this complaint</div>
      )}
    </div>
  );
}
```

## Query Keys

Query keys are centralized for better cache management:

```tsx
// Complaints
complaintKeys.all                           // ['complaints']
complaintKeys.lists()                       // ['complaints', 'list']
complaintKeys.detail(id)                    // ['complaints', 'detail', id]
complaintKeys.user(userId)                  // ['complaints', 'user', userId]
complaintKeys.userDrafts(userId)            // ['complaints', 'drafts', userId]
complaintKeys.userStats(userId)             // ['complaints', 'stats', userId]

// Announcements
announcementKeys.all                        // ['announcements']
announcementKeys.recent(limit)              // ['announcements', 'list', 'recent', limit]

// Notifications
notificationKeys.all                        // ['notifications']
notificationKeys.recent(limit)              // ['notifications', 'list', 'recent', limit]

// Votes
voteKeys.all                                // ['votes']
voteKeys.list(filters)                      // ['votes', 'list', filters]
voteKeys.hasVoted(voteId, studentId)        // ['votes', 'hasVoted', voteId, studentId]
```

## Cache Invalidation

Mutations automatically invalidate related queries:

```tsx
// When creating a complaint, these are invalidated:
- complaintKeys.all
- complaintKeys.user(userId)
- complaintKeys.userStats(userId)
- complaintKeys.userDrafts(userId) // if draft

// When updating a complaint, these are invalidated:
- complaintKeys.detail(id)
- complaintKeys.lists()
- complaintKeys.user(userId)
- complaintKeys.userStats(userId)
```

## DevTools

React Query DevTools are available in development mode:

- Press the floating React Query icon in the bottom corner
- View all queries and their states
- Inspect cache contents
- Manually trigger refetches
- View query timelines

## Performance Benefits

### Before React Query

```tsx
// Multiple components fetching the same data
function ComponentA() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchComplaints().then(setData); // API call 1
  }, []);
}

function ComponentB() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchComplaints().then(setData); // API call 2 (duplicate!)
  }, []);
}
```

### After React Query

```tsx
// Multiple components share cached data
function ComponentA() {
  const { data } = useUserComplaints(userId); // API call 1
}

function ComponentB() {
  const { data } = useUserComplaints(userId); // Uses cache, no API call!
}
```

## Best Practices

1. **Use query keys consistently** - Always use the centralized query key factories
2. **Enable queries conditionally** - Use `enabled` option when data depends on other data
3. **Handle loading and error states** - Always provide feedback to users
4. **Invalidate related queries** - When mutating data, invalidate all related queries
5. **Use optimistic updates** - For better UX, update UI immediately
6. **Set appropriate stale times** - Balance freshness with performance
7. **Use DevTools** - Debug query behavior in development

## Migration Guide

To migrate existing components to React Query:

1. Replace `useState` + `useEffect` with query hooks
2. Replace manual loading states with `isLoading` from hooks
3. Replace manual error handling with `error` from hooks
4. Replace manual refetch functions with query invalidation
5. Use mutation hooks for create/update/delete operations

## Testing

React Query provides testing utilities:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

## Summary

React Query has been successfully implemented across the Student Complaint System, providing:

- ✅ Automatic caching and background refetching
- ✅ Centralized data fetching logic
- ✅ Reduced boilerplate code
- ✅ Better performance through request deduplication
- ✅ Improved user experience with optimistic updates
- ✅ Built-in loading and error states
- ✅ DevTools for debugging

All major data fetching operations now use React Query hooks, making the application more performant and maintainable.
