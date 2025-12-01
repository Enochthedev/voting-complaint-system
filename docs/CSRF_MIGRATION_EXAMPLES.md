# CSRF Protection Migration Examples

This document provides practical examples of migrating existing code to use CSRF protection.

## Example 1: Simple Form Submission

### Before (Without CSRF Protection)

```typescript
'use client';

import { useState } from 'react';

export function ComplaintForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### After (With CSRF Protection)

```typescript
'use client';

import { useState } from 'react';
import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

export function ComplaintForm() {
  const [loading, setLoading] = useState(false);
  const { csrfFetch } = useCsrfFetch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await csrfFetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Changes:**

1. Import `useCsrfFetch` hook
2. Replace `fetch` with `csrfFetch`

---

## Example 2: React Query Mutation

### Before (Without CSRF Protection)

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ComplaintData) => {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create complaint');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}
```

### After (With CSRF Protection)

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const { csrfFetch } = useCsrfFetch();

  return useMutation({
    mutationFn: async (data: ComplaintData) => {
      const response = await csrfFetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create complaint');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}
```

**Changes:**

1. Import `useCsrfFetch` hook
2. Call `useCsrfFetch()` to get `csrfFetch`
3. Replace `fetch` with `csrfFetch`

---

## Example 3: Supabase Client Operations

### Before (Without CSRF Protection)

```typescript
'use client';

import { supabase } from '@/lib/supabase';

export function ComplaintActions() {
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete failed:', error);
    }
  };

  return <button onClick={() => handleDelete('123')}>Delete</button>;
}
```

### After (With CSRF Protection)

```typescript
'use client';

import { useCsrfToken } from '@/components/providers/csrf-provider';
import { createCsrfProtectedSupabaseClient } from '@/lib/supabase-csrf';

export function ComplaintActions() {
  const { token } = useCsrfToken();

  const handleDelete = async (id: string) => {
    const supabase = createCsrfProtectedSupabaseClient(token);

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete failed:', error);
    }
  };

  return <button onClick={() => handleDelete('123')}>Delete</button>;
}
```

**Changes:**

1. Import `useCsrfToken` and `createCsrfProtectedSupabaseClient`
2. Get token from `useCsrfToken()`
3. Create CSRF-protected Supabase client with token
4. Use the protected client for operations

---

## Example 4: Multiple API Calls

### Before (Without CSRF Protection)

```typescript
'use client';

export function BulkActions() {
  const handleBulkUpdate = async (ids: string[], status: string) => {
    // Update status
    const statusResponse = await fetch('/api/complaints/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });

    // Add tags
    const tagsResponse = await fetch('/api/complaints/bulk-tags', {
      method: 'POST',
      body: JSON.stringify({ ids, tags: ['urgent'] }),
    });

    // Send notifications
    const notifyResponse = await fetch('/api/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, message: 'Updated' }),
    });

    return {
      status: await statusResponse.json(),
      tags: await tagsResponse.json(),
      notifications: await notifyResponse.json(),
    };
  };

  return <button onClick={() => handleBulkUpdate(['1', '2'], 'resolved')}>
    Bulk Update
  </button>;
}
```

### After (With CSRF Protection)

```typescript
'use client';

import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

export function BulkActions() {
  const { csrfFetch } = useCsrfFetch();

  const handleBulkUpdate = async (ids: string[], status: string) => {
    // Update status
    const statusResponse = await csrfFetch('/api/complaints/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });

    // Add tags
    const tagsResponse = await csrfFetch('/api/complaints/bulk-tags', {
      method: 'POST',
      body: JSON.stringify({ ids, tags: ['urgent'] }),
    });

    // Send notifications
    const notifyResponse = await csrfFetch('/api/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, message: 'Updated' }),
    });

    return {
      status: await statusResponse.json(),
      tags: await tagsResponse.json(),
      notifications: await notifyResponse.json(),
    };
  };

  return <button onClick={() => handleBulkUpdate(['1', '2'], 'resolved')}>
    Bulk Update
  </button>;
}
```

**Changes:**

1. Import `useCsrfFetch` hook
2. Replace all `fetch` calls with `csrfFetch`
3. CSRF token is automatically included in all requests

---

## Example 5: Custom API Wrapper

### Before (Without CSRF Protection)

```typescript
// src/lib/api-client.ts
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }
}

// Usage
const client = new ApiClient();
await client.post('/complaints', data);
```

### After (With CSRF Protection)

```typescript
// src/lib/api-client.ts
export class ApiClient {
  private baseUrl: string;
  private csrfToken?: string;

  constructor(baseUrl: string = '/api', csrfToken?: string) {
    this.baseUrl = baseUrl;
    this.csrfToken = csrfToken;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken;
    }

    return headers;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }
}

// Usage in component
import { useCsrfToken } from '@/components/providers/csrf-provider';

function MyComponent() {
  const { token } = useCsrfToken();
  const client = new ApiClient('/api', token);

  await client.post('/complaints', data);
}
```

**Changes:**

1. Add `csrfToken` parameter to constructor
2. Create `getHeaders()` method that includes CSRF token
3. Use `getHeaders()` in all requests
4. Pass token when creating client instance

---

## Example 6: File Upload with CSRF

### Before (Without CSRF Protection)

```typescript
'use client';

export function FileUpload() {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  };

  return <input type="file" onChange={(e) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  }} />;
}
```

### After (With CSRF Protection)

```typescript
'use client';

import { useCsrfToken } from '@/components/providers/csrf-provider';

export function FileUpload() {
  const { token } = useCsrfToken();

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-csrf-token': token!,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  };

  return <input type="file" onChange={(e) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  }} />;
}
```

**Changes:**

1. Import `useCsrfToken` hook
2. Get token from hook
3. Add `x-csrf-token` header to request
4. **Note**: Don't set `Content-Type` for FormData - browser sets it automatically

---

## Example 7: Conditional CSRF (Skip for External APIs)

### Before (Without CSRF Protection)

```typescript
'use client';

export function DataSync() {
  const syncInternal = async () => {
    await fetch('/api/sync', { method: 'POST' });
  };

  const syncExternal = async () => {
    await fetch('https://external-api.com/sync', { method: 'POST' });
  };

  return (
    <>
      <button onClick={syncInternal}>Sync Internal</button>
      <button onClick={syncExternal}>Sync External</button>
    </>
  );
}
```

### After (With CSRF Protection)

```typescript
'use client';

import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

export function DataSync() {
  const { csrfFetch } = useCsrfFetch();

  const syncInternal = async () => {
    // Use CSRF protection for internal API
    await csrfFetch('/api/sync', { method: 'POST' });
  };

  const syncExternal = async () => {
    // Skip CSRF for external API
    await csrfFetch('https://external-api.com/sync', {
      method: 'POST',
      skipCsrf: true,
    });
  };

  return (
    <>
      <button onClick={syncInternal}>Sync Internal</button>
      <button onClick={syncExternal}>Sync External</button>
    </>
  );
}
```

**Changes:**

1. Use `csrfFetch` for all requests
2. Add `skipCsrf: true` option for external APIs
3. Internal APIs automatically get CSRF protection

---

## Migration Checklist

When migrating code to use CSRF protection:

- [ ] Identify all state-changing operations (POST, PUT, PATCH, DELETE)
- [ ] Import `useCsrfFetch` or `useCsrfToken` hook
- [ ] Replace `fetch` calls with `csrfFetch`
- [ ] For Supabase operations, use `createCsrfProtectedSupabaseClient`
- [ ] Test all forms and mutations
- [ ] Verify error handling for CSRF failures
- [ ] Check that loading states work correctly
- [ ] Test with browser dev tools (check headers)
- [ ] Verify cookies are set correctly
- [ ] Test in production environment

## Common Pitfalls

### ❌ Forgetting to use the hook

```typescript
// Wrong - no CSRF protection
const response = await fetch('/api/endpoint', { method: 'POST' });
```

```typescript
// Correct - CSRF protected
const { csrfFetch } = useCsrfFetch();
const response = await csrfFetch('/api/endpoint', { method: 'POST' });
```

### ❌ Using token before it's loaded

```typescript
// Wrong - token might be null
const { token } = useCsrfToken();
fetch('/api/endpoint', {
  headers: { 'x-csrf-token': token }, // token could be null!
});
```

```typescript
// Correct - check loading state
const { token, isLoading } = useCsrfToken();
if (isLoading) return <Loading />;
fetch('/api/endpoint', {
  headers: { 'x-csrf-token': token! },
});
```

### ❌ Setting Content-Type for FormData

```typescript
// Wrong - breaks multipart boundary
const formData = new FormData();
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data', // Don't do this!
    'x-csrf-token': token,
  },
  body: formData,
});
```

```typescript
// Correct - let browser set Content-Type
const formData = new FormData();
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'x-csrf-token': token,
  },
  body: formData,
});
```

## Need Help?

- See full documentation: `docs/CSRF_PROTECTION.md`
- See quick reference: `docs/CSRF_PROTECTION_QUICK_REFERENCE.md`
- Check examples in: `src/hooks/use-csrf-fetch.ts`
