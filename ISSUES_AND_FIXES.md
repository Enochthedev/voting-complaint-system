# Comprehensive Code Review - Issues & Recommendations

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Stale Closure Bug in useAuth Hook**

**File**: `src/hooks/useAuth.ts:41`

**Issue**: The `user` variable in the TOKEN_REFRESHED event handler captures the value from the initial render, causing stale closures.

```typescript
// CURRENT CODE (BUGGY)
} else if (event === 'TOKEN_REFRESHED') {
  // BUG: 'user' here refers to the value when useEffect first ran
  if (!user) {
    await loadUser();
  }
}
```

**Impact**:

- If user signs in, the `user` in the closure is still `null`
- TOKEN_REFRESHED will always call loadUser() even when user is already loaded
- Causes unnecessary database queries

**Fix**: Use a ref or check session instead of user state

```typescript
} else if (event === 'TOKEN_REFRESHED') {
  // Check if we need to reload based on session, not stale closure
  const { data: { session } } = await supabase.auth.getSession();
  if (session && !user) {
    await loadUser();
  }
}
```

---

### 2. **Missing Dependencies in useEffect**

**File**: `src/hooks/useAuth.ts:61`

**Issue**: useEffect dependency array is incomplete

```typescript
// CURRENT CODE (INCOMPLETE)
}, [router]); // Missing: queryClient, user
```

**Impact**:

- React will use stale closures for queryClient and user
- Potential memory leaks
- Unpredictable behavior

**Fix**: Add all dependencies or use refs

```typescript
}, [router, queryClient]);
// Note: 'user' should not be a dependency as it's set inside loadUser
// 'loadUser' should be wrapped in useCallback to stabilize reference
```

---

### 3. **Race Condition in loadUser**

**File**: `src/hooks/useAuth.ts:63`

**Issue**: Multiple concurrent calls to `loadUser()` can race, causing the last one to complete to "win"

**Scenario**:

1. Component mounts → calls `loadUser()` (Request A)
2. SIGNED_IN event fires → calls `loadUser()` (Request B)
3. Request B completes first → sets user
4. Request A completes second → overwrites with potentially stale data

**Impact**:

- User data may be incorrect
- Loading states may be incorrect
- Race conditions hard to debug

**Fix**: Implement request cancellation or debouncing

```typescript
const loadUserRef = useRef(0);

const loadUser = async () => {
  const requestId = ++loadUserRef.current;

  try {
    // ... fetch logic ...

    // Only update state if this is still the latest request
    if (requestId === loadUserRef.current) {
      setUser(userData as AuthUser);
    }
  } finally {
    if (requestId === loadUserRef.current) {
      setIsLoading(false);
    }
  }
};
```

---

### 4. **Hard Redirect Loses Application State**

**File**: `src/lib/api-wrapper.ts:32, 61`

**Issue**: Using `window.location.href` causes hard page reload, losing all React state

```typescript
// CURRENT CODE (LOSES STATE)
if (typeof window !== 'undefined') {
  window.location.href = '/login?reason=session_expired';
}
```

**Impact**:

- User loses form data
- Navigation stack lost
- Poor UX

**Fix**: Import and use Next.js router (but this won't work in api-wrapper as it's not a React component)

**Alternative Fix**: Throw a specific error that components can catch

```typescript
export class SessionExpiredError extends Error {
  constructor(
    message: string,
    public reason: string
  ) {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

// Then throw it
throw new SessionExpiredError('Session expired', 'session_expired');

// Components can catch and handle:
try {
  await apiCall();
} catch (error) {
  if (error instanceof SessionExpiredError) {
    router.push(`/login?reason=${error.reason}`);
  }
}
```

---

### 5. **Infinite Loop Risk in withTokenRefresh**

**File**: `src/lib/api-wrapper.ts:70`

**Issue**: If refresh succeeds but API call still fails with auth error, it could retry indefinitely

**Current Flow**:

1. API call fails with auth error
2. Refresh token
3. Retry API call
4. If still auth error... infinite loop? (Actually no, but risk exists)

**Fix**: Add retry counter

```typescript
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> {
  let retryCount = 0;

  const executeWithRetry = async (): Promise<T> => {
    try {
      return await apiCall();
    } catch (error: any) {
      if (isAuthError && retryCount < maxRetries) {
        retryCount++;
        // refresh and retry
        return executeWithRetry();
      }
      throw error;
    }
  };

  return executeWithRetry();
}
```

---

## 🟡 HIGH PRIORITY ISSUES (Fix Soon)

### 6. **No Request Deduplication**

**Issue**: Multiple components can trigger the same API call simultaneously

**Example**:

- User navigates to /complaints
- ComplaintsPage component mounts → calls `useAllComplaints()`
- ComplaintsHeader component mounts → calls `useAllComplaints()`
- Same API called twice simultaneously

**Impact**:

- Wasted bandwidth
- Increased server load
- Rate limit exhaustion

**Fix**: React Query already handles this, but ensure queries use consistent keys

---

### 7. **Missing Error Boundaries for Async Operations**

**Issue**: Errors in async operations (mutations) aren't caught by ErrorBoundary

**Impact**:

- Silent failures
- User sees loading state forever
- Data inconsistency

**Fix**: Add error handling in mutation hooks

```typescript
export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComplaint,
    onError: (error) => {
      console.error('Failed to create complaint:', error);
      // Show toast notification
      toast.error('Failed to create complaint', error.message);
    },
  });
}
```

---

### 8. **Role Cache Not Invalidated on User Deletion**

**File**: `src/lib/role-cache.ts`

**Issue**: If admin deletes a user, their role remains in cache for 5 minutes

**Impact**:

- Deleted users can still access system for up to 5 minutes
- Security risk

**Fix**: Add cache invalidation to user deletion function

```typescript
export const deleteUser = async (userId: string) => {
  // ... delete user logic ...

  // Invalidate role cache
  if (typeof window === 'undefined') {
    const { invalidateRoleCache } = await import('@/lib/role-cache');
    invalidateRoleCache(userId);
  }
};
```

---

### 9. **No Cleanup in Rate Limiter**

**File**: `src/lib/rate-limiter.ts:72`

**Issue**: Rate limiter creates an interval in constructor but only cleans up when explicitly destroyed

**Impact**:

- Memory leak in long-running servers
- Interval continues running even if not needed

**Fix**: Already has cleanup, but ensure it's called

```typescript
// In Next.js middleware or app shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', () => {
    destroyRateLimiter();
  });
}
```

---

### 10. **Missing Input Validation**

**Issue**: No validation layer before API calls

**Impact**:

- Invalid data sent to database
- Potential SQL injection (mitigated by Supabase, but still risky)
- Poor error messages

**Fix**: Add Zod schemas for validation

```typescript
import { z } from 'zod';

const ComplaintSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['academic', 'administrative', 'facilities', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent', 'critical']),
  is_anonymous: z.boolean(),
  is_draft: z.boolean(),
  student_id: z.string().uuid(),
  status: z.string(),
});

export const createComplaint = async (complaint: unknown) => {
  // Validate input
  const validated = ComplaintSchema.parse(complaint);

  // Proceed with API call
  // ...
};
```

---

## 🟢 MEDIUM PRIORITY ISSUES (Consider Fixing)

### 11. **No Optimistic Updates**

**Issue**: All mutations wait for server response before updating UI

**Impact**:

- Slow perceived performance
- User waits for network roundtrip

**Fix**: Add optimistic updates to mutations

```typescript
export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComplaint,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: complaintKeys.detail(variables.id) });

      // Snapshot previous value
      const previous = queryClient.getQueryData(complaintKeys.detail(variables.id));

      // Optimistically update
      queryClient.setQueryData(complaintKeys.detail(variables.id), (old: any) => ({
        ...old,
        ...variables.updates,
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(complaintKeys.detail(variables.id), context?.previous);
    },
  });
}
```

---

### 12. **Large Bundle Size from Lazy Loading**

**Issue**: Lazy loading individual components instead of route-level code splitting

**Impact**:

- Slower initial page load
- Many small chunks instead of few large chunks

**Fix**: Use route-level code splitting in Next.js

```typescript
// app/complaints/page.tsx
export default async function ComplaintsPage() {
  // Server component - no client-side JS needed
}

// Only lazy-load client components
const ComplaintForm = lazy(() => import('./ComplaintForm'));
```

---

### 13. **No Database Connection Pooling Monitoring**

**Issue**: No visibility into Supabase connection pool usage

**Impact**:

- Can't detect connection pool exhaustion
- Hard to debug performance issues

**Fix**: Add monitoring

```typescript
// Create a monitoring utility
export async function checkDatabaseHealth() {
  const { data, error } = await supabase.rpc('get_connection_stats');

  if (data.active_connections > 80) {
    console.warn('High database connection usage:', data);
  }
}
```

---

### 14. **Missing Indexes Documentation**

**Issue**: No documentation of required database indexes

**Impact**:

- Slow queries
- Hard to optimize performance

**Fix**: Document indexes

```sql
-- Add to documentation
CREATE INDEX idx_complaints_student_id ON complaints(student_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaint_tags_complaint_id ON complaint_tags(complaint_id);
```

---

### 15. **No Request Timeout**

**Issue**: API calls can hang indefinitely

**Impact**:

- User stuck on loading screen
- Resource waste

**Fix**: Add timeout to Supabase client or use AbortController

```typescript
export async function createComplaintWithTimeout(complaint: unknown) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const { data, error } = await supabase
      .from('complaints')
      .insert(complaint)
      .abortSignal(controller.signal)
      .select()
      .single();

    clearTimeout(timeoutId);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
```

---

## 🔵 LOW PRIORITY ISSUES (Nice to Have)

### 16. **No Compression for API Responses**

**Issue**: Large API responses not compressed

**Fix**: Enable compression in Next.js config

```typescript
// next.config.ts
module.exports = {
  compress: true,
};
```

---

### 17. **No Service Worker for Offline Support**

**Issue**: App doesn't work offline

**Fix**: Add service worker for basic offline support

---

### 18. **Missing Telemetry/Analytics**

**Issue**: No visibility into user behavior or errors

**Fix**: Add error tracking (Sentry) and analytics

---

### 19. **No A/B Testing Framework**

**Issue**: Can't test UI variations

**Fix**: Add feature flags library

---

### 20. **Missing Accessibility Audit**

**Issue**: Unknown WCAG compliance level

**Fix**: Run Lighthouse accessibility audit

---

## Summary Table

| Priority    | Issue                          | Impact | Effort                               |
| ----------- | ------------------------------ | ------ | ------------------------------------ |
| 🔴 Critical | Stale Closure in useAuth       | High   | Low                                  |
| 🔴 Critical | Missing useEffect Dependencies | High   | Low                                  |
| 🔴 Critical | Race Condition in loadUser     | High   | Medium                               |
| 🔴 Critical | Hard Redirect Loses State      | Medium | Low                                  |
| 🔴 Critical | Infinite Loop Risk             | Medium | Low                                  |
| 🟡 High     | No Request Deduplication       | Medium | Low (already handled by React Query) |
| 🟡 High     | Missing Error Boundaries       | Medium | Medium                               |
| 🟡 High     | Role Cache Not Invalidated     | High   | Low                                  |
| 🟡 High     | No Cleanup in Rate Limiter     | Low    | Low                                  |
| 🟡 High     | Missing Input Validation       | Medium | High                                 |

---

## Recommended Fix Order

1. **Fix useAuth stale closure** (15 minutes)
2. **Fix useAuth dependencies** (10 minutes)
3. **Fix loadUser race condition** (30 minutes)
4. **Add role cache invalidation to user deletion** (10 minutes)
5. **Add input validation schemas** (2-3 hours)
6. **Add error handling to mutations** (1 hour)
7. **Add request timeouts** (1 hour)
8. **Add optimistic updates** (2-3 hours)

Total critical fixes: ~1.5 hours
Total high priority fixes: ~6-8 hours
