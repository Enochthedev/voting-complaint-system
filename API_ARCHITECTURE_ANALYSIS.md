# Comprehensive API Architecture Analysis

## Executive Summary

The Student Complaint System has a well-structured API layer with clear separation of concerns, comprehensive error handling, and modern data fetching patterns. The architecture uses:

- **Supabase** as the backend database and authentication provider
- **React Query (TanStack Query)** for client-side caching and data synchronization
- **Custom API modules** in `src/lib/api/` for business logic
- **Custom hooks** in `src/hooks/` for React component integration
- **Rate limiting, CSRF protection, and validation** for security
- **Token refresh and timeout handling** for reliability

---

## 1. API Layer Organization

### 1.1 API Modules Structure (`src/lib/api/`)

The API layer is organized into domain-specific modules:

```
src/lib/api/
├── complaints.ts          # Complaint CRUD and bulk operations
├── notifications.ts       # Notification management
├── users.ts              # User management (admin)
├── announcements.ts      # Announcement CRUD
├── votes.ts              # Voting system
├── templates.ts          # Complaint templates
├── escalation-rules.ts   # Escalation rule management
├── analytics.ts          # Analytics data aggregation
├── query-optimization.ts # Query optimization utilities
└── __tests__/            # API tests
```

### 1.2 API Module Pattern

Each API module follows a consistent pattern:

```typescript
// 1. Implementation function (private)
async function getComplaintByIdImpl(id: string) {
  const { data, error } = await supabase
    .from('complaints')
    .select('...')
    .eq('id', id)
    .single();

  if (error) throw new DatabaseError(...);
  return data;
}

// 2. Rate-limited export (public)
export const getComplaintById = withRateLimit(getComplaintByIdImpl, 'read');
```

**Benefits:**

- Separation of implementation from rate limiting
- Consistent error handling
- Easy to test implementation separately
- Rate limiting applied uniformly

---

## 2. Data Fetching Patterns

### 2.1 Query Hooks Pattern

Custom hooks wrap React Query for type-safe data fetching:

```typescript
// src/hooks/use-complaints.ts
export function useUserComplaints(userId: string) {
  return useQuery({
    queryKey: complaintKeys.user(userId),
    queryFn: () => getUserComplaints(userId),
    enabled: !!userId,
  });
}
```

**Key Features:**

- Centralized query key management
- Conditional query execution
- Type-safe data access
- Automatic caching and refetching

### 2.2 Mutation Hooks Pattern

Mutations handle create/update/delete with optimistic updates:

```typescript
export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => updateComplaint(id, updates),
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: complaintKeys.detail(id) });
      const previousData = queryClient.getQueryData(complaintKeys.detail(id));
      queryClient.setQueryData(complaintKeys.detail(id), (old) => ({
        ...old,
        ...updates,
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(complaintKeys.detail(variables.id), context.previousData);
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
    },
  });
}
```

**Benefits:**

- Optimistic UI updates for better UX
- Automatic rollback on errors
- Proper cache invalidation
- Error handling with user feedback

### 2.3 Query Key Management

Centralized query keys prevent cache misses:

```typescript
export const complaintKeys = {
  all: ['complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  list: (filters) => [...complaintKeys.lists(), { filters }] as const,
  details: () => [...complaintKeys.all, 'detail'] as const,
  detail: (id) => [...complaintKeys.details(), id] as const,
  user: (userId) => [...complaintKeys.all, 'user', userId] as const,
  userDrafts: (userId) => [...complaintKeys.all, 'drafts', userId] as const,
  userStats: (userId) => [...complaintKeys.all, 'stats', userId] as const,
};
```

---

## 3. Error Handling Patterns

### 3.1 Error Types

The system uses typed error classes:

```typescript
// Database errors with Supabase context
class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: string,
    public hint?: string
  ) {}
}

// Validation errors with field-level details
class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {}
}

// Timeout errors
class TimeoutError extends Error {
  constructor(
    message: string,
    public timeoutMs: number
  ) {}
}

// Rate limit errors
class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public limit: number
  ) {}
}
```

### 3.2 Error Handling in Hooks

Mutations provide comprehensive error handling:

```typescript
onError: (err: any, variables: any, context) => {
  let errorMessage = 'Failed to create complaint. Please try again.';

  if (err instanceof ValidationError) {
    errorMessage = err.getUserMessage();
  } else if (err instanceof TimeoutError) {
    errorMessage = 'Request timed out. Please check your connection and try again.';
  } else if (err instanceof DatabaseError) {
    errorMessage = err.details || err.message || 'Database error occurred';
  } else if (err?.message) {
    errorMessage = err.message;
  }

  toast.error(errorMessage, 'Error Creating Complaint');
  console.error('Create complaint error:', err);
};
```

### 3.3 Error Utilities

Centralized error handling utilities:

```typescript
// src/lib/error-handler.ts
-formatError() - // Format any error for display
  formatAuthError() - // Format auth-specific errors
  isNetworkError() - // Check if network error
  isAuthError() - // Check if auth error
  isRetryableError() - // Check if error can be retried
  retryWithBackoff() - // Retry with exponential backoff
  handleAsync(); // Wrap promises with error handling
```

---

## 4. State Management & Caching

### 4.1 React Query Configuration

```typescript
// src/lib/react-query.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      gcTime: 5 * 60 * 1000, // 5 minute garbage collection
      refetchOnWindowFocus: true, // Refetch when tab regains focus
      refetchOnMount: 'always', // Always refetch on mount
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      throwOnError: false, // Don't throw to error boundaries
    },
    mutations: {
      retry: false, // Don't retry mutations
      throwOnError: false,
    },
  },
});
```

### 4.2 Cache Invalidation Strategy

Mutations invalidate related queries:

```typescript
// Create complaint invalidates:
-complaintKeys.all -
  complaintKeys.user(userId) -
  complaintKeys.userStats(userId) -
  complaintKeys.userDrafts(userId) -
  // Update complaint invalidates:
  complaintKeys.detail(id) -
  complaintKeys.lists() -
  complaintKeys.user(userId) -
  complaintKeys.userStats(userId) -
  // Bulk operations invalidate:
  complaintKeys.all;
```

---

## 5. Authentication & Authorization

### 5.1 Token Refresh Pattern

Automatic token refresh on auth errors:

```typescript
// src/lib/api-wrapper.ts
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  try {
    // Validate session before API call
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      // Try to refresh
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        window.location.href = '/login?reason=session_expired';
        throw new Error('Session expired. Please log in again.');
      }
    }

    return await apiCall();
  } catch (error: any) {
    // If auth error, refresh and retry
    if (isAuthError(error)) {
      const { data, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !data.session) {
        window.location.href = '/login?reason=token_refresh_failed';
        throw error;
      }

      return await apiCall(); // Retry with fresh token
    }
    throw error;
  }
}
```

### 5.2 CSRF Protection

Double-submit cookie pattern:

```typescript
// src/lib/csrf.ts
-generateCsrfToken() - // Generate and store in HTTP-only cookie
  validateCsrfToken() - // Validate token from header vs cookie
  validateOrigin() - // Validate request origin
  requiresCsrfProtection(); // Check if method needs protection
```

---

## 6. Rate Limiting

### 6.1 Token Bucket Algorithm

```typescript
// src/lib/rate-limiter.ts
const RATE_LIMITS = {
  read: { maxRequests: 100, windowMs: 60000 }, // 100/min
  write: { maxRequests: 30, windowMs: 60000 }, // 30/min
  bulk: { maxRequests: 10, windowMs: 60000 }, // 10/min
  auth: { maxRequests: 20, windowMs: 60000 }, // 20/min
  search: { maxRequests: 50, windowMs: 60000 }, // 50/min
  upload: { maxRequests: 20, windowMs: 60000 }, // 20/min
};
```

### 6.2 Rate Limit Wrapper

```typescript
export const getUserComplaints = withRateLimit(getUserComplaintsImpl, 'read');
```

---

## 7. Input Validation

### 7.1 Zod Schemas

Comprehensive validation schemas:

```typescript
// src/lib/validation.ts
-ComplaintCategorySchema -
  ComplaintPrioritySchema -
  ComplaintStatusSchema -
  CreateComplaintSchema -
  UpdateComplaintSchema -
  BulkAssignSchema -
  BulkStatusChangeSchema -
  RatingSchema -
  UserRegistrationSchema;
```

### 7.2 Validation in API Calls

```typescript
async function createComplaintImpl(complaint: unknown) {
  // Validate input data
  const validatedData = validate(CreateComplaintSchema, complaint);

  // Use validated data
  const { data, error } = await supabase.from('complaints').insert(validatedData).select().single();
}
```

---

## 8. Real-Time Data Handling

### 8.1 Notification Polling

Notifications use polling instead of subscriptions:

```typescript
export function useNotifications(limit?: number) {
  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: () => fetchNotifications(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}
```

### 8.2 Unread Count Polling

```typescript
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
```

---

## 9. Timeout Handling

### 9.1 Timeout Configuration

```typescript
// src/lib/timeout.ts
export const TIMEOUT_CONFIG = {
  read: 15000, // 15 seconds
  write: 30000, // 30 seconds
  bulk: 60000, // 60 seconds
  auth: 10000, // 10 seconds
  search: 20000, // 20 seconds
  upload: 120000, // 120 seconds
  default: 30000, // 30 seconds
};
```

### 9.2 Timeout Wrapper

```typescript
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Request timed out after ${timeoutMs}ms`, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}
```

---

## 10. Current Strengths

✅ **Well-organized API modules** - Clear separation by domain
✅ **Consistent patterns** - All modules follow same structure
✅ **Comprehensive error handling** - Typed errors with context
✅ **Rate limiting** - Token bucket algorithm prevents abuse
✅ **CSRF protection** - Double-submit cookie pattern
✅ **Input validation** - Zod schemas for all inputs
✅ **Token refresh** - Automatic session management
✅ **Timeout handling** - Prevents hanging requests
✅ **React Query integration** - Modern caching and sync
✅ **Optimistic updates** - Better UX with rollback
✅ **Query key management** - Centralized cache keys
✅ **Bulk operations** - Efficient batch processing

---

## 11. Areas for Improvement

### 11.1 Real-Time Data (CRITICAL)

**Current:** Polling-based notifications (2-minute intervals)
**Issue:** Delays in real-time updates, unnecessary API calls
**Recommendation:** Implement Supabase Realtime subscriptions

```typescript
// Proposed: Real-time notifications
export function useNotificationsRealtime(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [userId]);

  return notifications;
}
```

### 11.2 API Response Normalization (HIGH)

**Current:** Each API returns different response structures
**Issue:** Inconsistent data shapes, harder to maintain
**Recommendation:** Implement response normalization layer

```typescript
// Proposed: Normalized response wrapper
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: {
    timestamp: string;
    requestId: string;
    cached: boolean;
  };
}

export async function normalizeResponse<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  try {
    const data = await fn();
    return {
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        cached: false,
      },
    };
  } catch (error) {
    return {
      data: null,
      error: normalizeError(error),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        cached: false,
      },
    };
  }
}
```

### 11.3 Request Deduplication (HIGH)

**Current:** React Query deduplicates, but no explicit control
**Issue:** Rapid successive calls might not deduplicate
**Recommendation:** Add explicit request deduplication

```typescript
// Proposed: Request deduplication
const requestCache = new Map<string, Promise<any>>();

export function withDeduplication<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);

    if (requestCache.has(key)) {
      return requestCache.get(key)!;
    }

    const promise = fn(...args);
    requestCache.set(key, promise);

    try {
      return await promise;
    } finally {
      requestCache.delete(key);
    }
  }) as T;
}
```

### 11.4 Batch Request Optimization (MEDIUM)

**Current:** Bulk operations use multiple individual queries
**Issue:** N+1 query problem in some scenarios
**Recommendation:** Implement batch query optimization

```typescript
// Proposed: Batch query optimization
export async function batchGetComplaints(ids: string[]) {
  // Instead of: ids.map(id => getComplaintById(id))
  // Use single query:
  const { data, error } = await supabase.from('complaints').select('*').in('id', ids);

  if (error) throw error;
  return data;
}
```

### 11.5 API Versioning (MEDIUM)

**Current:** No API versioning strategy
**Issue:** Breaking changes affect all clients
**Recommendation:** Implement API versioning

```typescript
// Proposed: API versioning
export const API_VERSION = 'v1';

export const apiEndpoints = {
  v1: {
    complaints: '/api/v1/complaints',
    notifications: '/api/v1/notifications',
  },
  v2: {
    complaints: '/api/v2/complaints',
    notifications: '/api/v2/notifications',
  },
};
```

### 11.6 Request/Response Logging (MEDIUM)

**Current:** Limited logging of API calls
**Issue:** Hard to debug production issues
**Recommendation:** Implement comprehensive logging

```typescript
// Proposed: Request/response logging
export function withLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    console.log(`[${requestId}] ${operationName} started`, { args });

    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ${operationName} completed`, { duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] ${operationName} failed`, { error, duration });
      throw error;
    }
  }) as T;
}
```

### 11.7 Pagination Consistency (MEDIUM)

**Current:** Pagination handled inconsistently across components
**Issue:** Different pagination implementations
**Recommendation:** Centralize pagination logic

```typescript
// Proposed: Pagination utilities
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getPaginatedComplaints(
  params: PaginationParams
): Promise<PaginatedResponse<Complaint>> {
  const offset = (params.page - 1) * params.pageSize;

  const { data, count, error } = await supabase
    .from('complaints')
    .select('*', { count: 'exact' })
    .range(offset, offset + params.pageSize - 1);

  return {
    data: data || [],
    total: count || 0,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil((count || 0) / params.pageSize),
  };
}
```

### 11.8 Error Recovery Strategies (MEDIUM)

**Current:** Basic error handling without recovery
**Issue:** Some errors could be recovered automatically
**Recommendation:** Implement error recovery strategies

```typescript
// Proposed: Error recovery
export async function withErrorRecovery<T>(
  fn: () => Promise<T>,
  recoveryStrategies: Array<{
    condition: (error: any) => boolean;
    recover: () => Promise<T>;
  }>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    for (const strategy of recoveryStrategies) {
      if (strategy.condition(error)) {
        try {
          return await strategy.recover();
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
      }
    }
    throw error;
  }
}
```

### 11.9 API Monitoring & Metrics (LOW)

**Current:** No API performance monitoring
**Issue:** Can't track performance degradation
**Recommendation:** Add API metrics collection

```typescript
// Proposed: API metrics
export interface ApiMetrics {
  operationName: string;
  duration: number;
  success: boolean;
  errorType?: string;
  timestamp: string;
}

const metrics: ApiMetrics[] = [];

export function recordMetric(metric: ApiMetrics) {
  metrics.push(metric);

  // Send to analytics service
  if (metrics.length >= 100) {
    sendMetricsToAnalytics(metrics);
    metrics.length = 0;
  }
}
```

### 11.10 Type Safety Improvements (LOW)

**Current:** Some `any` types in error handling
**Issue:** Loss of type safety in error paths
**Recommendation:** Improve type safety throughout

```typescript
// Proposed: Better type safety
type ApiError = DatabaseError | ValidationError | TimeoutError | RateLimitError;

export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof DatabaseError ||
    error instanceof ValidationError ||
    error instanceof TimeoutError ||
    error instanceof RateLimitError
  );
}
```

---

## 12. Inconsistencies & Anti-Patterns

### 12.1 Inconsistent Error Throwing

**Issue:** Some functions throw, others return null

```typescript
// Inconsistent
async function getComplaintByIdImpl(id: string) {
  const { data, error } = await supabase...;
  if (error) throw new DatabaseError(...);  // Throws
  return data;
}

async function getUserByIdImpl(userId: string) {
  const { data, error } = await supabase...;
  if (error) throw new DatabaseError(...);  // Also throws
  return data;
}
```

**Recommendation:** Standardize on throwing errors

### 12.2 Mixed Error Handling in Hooks

**Issue:** Some hooks use toast, others don't

```typescript
// Inconsistent
useCreateComplaint() {
  onError: (err) => {
    toast.error(errorMessage);  // Uses toast
  }
}

useUpdateComplaint() {
  onError: (err) => {
    toast.error(errorMessage);  // Also uses toast
  }
}

useDeleteComplaint() {
  onError: (err) => {
    toast.error(errorMessage);  // Consistent
  }
}
```

**Recommendation:** Create error handling utility for hooks

### 12.3 Inconsistent Query Refetch Intervals

**Issue:** Different refetch intervals for similar data

```typescript
// Inconsistent
useNotifications() {
  refetchInterval: 2 * 60 * 1000,  // 2 minutes
}

useUnreadNotificationCount() {
  refetchInterval: 60 * 1000,      // 1 minute
}
```

**Recommendation:** Centralize refetch intervals

### 12.4 Missing Abort Signals

**Issue:** No request cancellation on component unmount

```typescript
// Missing abort signal
const { data } = useQuery({
  queryFn: () => fetchComplaints(),
  // No abort signal handling
});
```

**Recommendation:** Ensure React Query handles cleanup (it does by default)

---

## 13. Recommendations Summary

### Priority 1 (Critical)

1. Implement Supabase Realtime for notifications
2. Add API response normalization layer
3. Implement explicit request deduplication

### Priority 2 (High)

4. Add batch query optimization
5. Implement API versioning strategy
6. Add comprehensive request/response logging

### Priority 3 (Medium)

7. Centralize pagination logic
8. Implement error recovery strategies
9. Add API monitoring and metrics

### Priority 4 (Low)

10. Improve type safety throughout
11. Add API documentation generation
12. Create API testing utilities

---

## 14. Code Examples for Improvements

### Example 1: Real-Time Notifications

```typescript
// src/hooks/use-notifications-realtime.ts
export function useNotificationsRealtime(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on('system', { event: 'join' }, () => setIsConnected(true))
      .on('system', { event: 'leave' }, () => setIsConnected(false))
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { notifications, isConnected };
}
```

### Example 2: Normalized API Response

```typescript
// src/lib/api-response.ts
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: {
    timestamp: string;
    requestId: string;
    duration: number;
  };
}

export async function executeApiCall<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  const requestId = generateRequestId();

  try {
    const data = await fn();
    return {
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        duration: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      data: null,
      error: normalizeError(error),
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        duration: Date.now() - startTime,
      },
    };
  }
}
```

---

## 15. Conclusion

The Student Complaint System has a solid API architecture with good separation of concerns, comprehensive error handling, and modern data fetching patterns. The main areas for improvement are:

1. **Real-time data handling** - Move from polling to subscriptions
2. **Response normalization** - Standardize API response format
3. **Request deduplication** - Explicit control over duplicate requests
4. **Monitoring & metrics** - Track API performance

The recommendations provided are prioritized and include concrete code examples for implementation. The current architecture provides a strong foundation for these improvements.
