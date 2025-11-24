# React Hooks

This directory contains custom React hooks for the Student Complaint Resolution System.

## Available Hooks

### useAttachmentUpload

Manages file upload state and provides functions for uploading attachments to complaints.

**Location**: `use-attachment-upload.ts`

**Features**:
- Upload single or multiple files
- Track upload progress for each file
- Manage uploaded attachments
- Handle errors gracefully
- Remove uploaded attachments

**Usage**:
```typescript
import { useAttachmentUpload } from '@/hooks/use-attachment-upload';

function MyComponent() {
  const {
    uploadProgress,      // Array of upload progress
    uploadedAttachments, // Array of uploaded attachments
    isUploading,         // Boolean upload status
    uploadFiles,         // Function to upload files
    removeAttachment,    // Function to remove attachment
    clearProgress,       // Function to clear progress
    reset,               // Function to reset all state
  } = useAttachmentUpload();

  const handleUpload = async (files: File[]) => {
    await uploadFiles(files, complaintId, userId);
  };

  return (
    <FileUpload
      onFilesSelected={handleUpload}
      uploadProgress={uploadProgress}
      disabled={isUploading}
    />
  );
}
```

**See Also**:
- `src/lib/attachment-upload.ts` - Core upload functions
- `docs/ATTACHMENT_UPLOAD_QUICK_START.md` - Quick start guide
- `docs/ATTACHMENT_UPLOAD_IMPLEMENTATION.md` - Detailed documentation

## Creating New Hooks

When creating new hooks:

1. **Naming**: Use `use` prefix (e.g., `useComplaintForm`, `useNotifications`)
2. **Location**: Place in this directory
3. **Documentation**: Add JSDoc comments
4. **Testing**: Create test file in `__tests__` subdirectory
5. **Update**: Add entry to this README

## Hook Guidelines

### Best Practices

1. **Single Responsibility**: Each hook should have one clear purpose
2. **Reusability**: Design hooks to be reusable across components
3. **Type Safety**: Use TypeScript for type safety
4. **Error Handling**: Handle errors gracefully
5. **Cleanup**: Clean up subscriptions and timers

### Example Hook Structure

```typescript
import { useState, useEffect, useCallback } from 'react';

export interface UseMyHookReturn {
  data: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useMyHook(param: string): UseMyHookReturn {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch data
      const result = await fetchSomething(param);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [param]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
```

## Common Hook Patterns

### Data Fetching

```typescript
export function useComplaintData(complaintId: string) {
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchComplaint() {
      const data = await getComplaint(complaintId);
      setComplaint(data);
      setIsLoading(false);
    }
    fetchComplaint();
  }, [complaintId]);

  return { complaint, isLoading };
}
```

### Form State Management

```typescript
export function useFormState<T>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const reset = () => {
    setFormData(initialState);
    setErrors({});
  };

  return { formData, errors, updateField, setErrors, reset };
}
```

### Real-time Subscriptions

```typescript
export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return notifications;
}
```

## Future Hooks

Planned hooks for future implementation:

- `useAuth` - Authentication state and functions
- `useComplaintForm` - Complaint form state management
- `useNotifications` - Real-time notifications
- `useSearch` - Search functionality with debouncing
- `useFilters` - Advanced filtering state
- `usePagination` - Pagination state and controls
- `useRealtime` - Generic real-time subscription
- `useLocalStorage` - Persistent local storage
- `useDebounce` - Debounced values
- `useMediaQuery` - Responsive design helpers

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript with React Hooks](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks)
