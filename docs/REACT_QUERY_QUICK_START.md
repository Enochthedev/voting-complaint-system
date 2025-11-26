# React Query Quick Start Guide

## 🚀 Quick Reference

### Installation
Already installed! React Query is configured and ready to use.

### Basic Usage

#### 1. Fetching Data (Query)
```tsx
import { useUserComplaints } from '@/hooks/use-complaints';

function MyComponent({ userId }: { userId: string }) {
  const { data, isLoading, error } = useUserComplaints(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data?.length} complaints</div>;
}
```

#### 2. Mutating Data (Create/Update/Delete)
```tsx
import { useCreateComplaint } from '@/hooks/use-complaints';

function CreateForm() {
  const createMutation = useCreateComplaint();

  const handleSubmit = () => {
    createMutation.mutate(
      { title: 'New Complaint', student_id: userId },
      {
        onSuccess: () => alert('Created!'),
        onError: (error) => alert('Failed: ' + error.message),
      }
    );
  };

  return (
    <button 
      onClick={handleSubmit}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? 'Creating...' : 'Create'}
    </button>
  );
}
```

## 📚 Available Hooks

### Complaints
```tsx
// Queries
useUserComplaints(userId)
useUserDrafts(userId)
useUserComplaintStats(userId)
useComplaint(id)
useAllComplaints()

// Mutations
useCreateComplaint()
useUpdateComplaint()
useDeleteComplaint()
useReopenComplaint()
useSubmitRating()
useBulkAssignComplaints()
useBulkChangeStatus()
useBulkAddTags()
```

### Notifications
```tsx
// Queries
useNotifications(limit?)
useUnreadNotificationCount()

// Mutations
useMarkAsRead()
useMarkAllAsRead()
```

### Announcements
```tsx
useRecentAnnouncements(limit)
```

### Votes
```tsx
useVotes(filters?)
useHasStudentVoted(voteId, studentId)
```

## 🎯 Common Patterns

### Loading State
```tsx
const { data, isLoading } = useUserComplaints(userId);

if (isLoading) {
  return <Skeleton />;
}
```

### Error Handling
```tsx
const { data, error } = useUserComplaints(userId);

if (error) {
  return <Alert variant="destructive">{error.message}</Alert>;
}
```

### Conditional Fetching
```tsx
// Only fetch if userId exists
const { data } = useUserComplaints(userId, {
  enabled: !!userId,
});
```

### Manual Refetch
```tsx
const { data, refetch } = useUserComplaints(userId);

<button onClick={() => refetch()}>Refresh</button>
```

### Mutation with Callbacks
```tsx
const mutation = useCreateComplaint();

mutation.mutate(data, {
  onSuccess: (result) => {
    console.log('Created:', result);
  },
  onError: (error) => {
    console.error('Failed:', error);
  },
  onSettled: () => {
    console.log('Done (success or error)');
  },
});
```

## 🔧 DevTools

Press the floating React Query icon in development mode to:
- View all active queries
- Inspect cache contents
- Manually trigger refetches
- View query timelines

## 💡 Tips

1. **Don't fetch in useEffect** - Use query hooks instead
2. **Mutations auto-invalidate** - Related queries refresh automatically
3. **Data is cached** - Multiple components share the same data
4. **Stale time = 5 minutes** - Data stays fresh for 5 minutes
5. **Auto-refetch on focus** - Data refreshes when you return to the tab

## 📖 Full Documentation

See `docs/REACT_QUERY_IMPLEMENTATION.md` for complete documentation.
