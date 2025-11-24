# Loading States and Error Handling Documentation

This document describes the loading states and error handling mechanisms implemented in the Student Complaint System.

## Overview

The application now includes comprehensive loading states and error handling across all authentication pages and provides reusable components for consistent UX throughout the app.

## Components

### 1. Protected Route Wrapper

**Location:** `src/components/auth/protected-route.tsx`

Wraps components that require authentication and optionally role-based access control.

#### Usage:

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student', 'lecturer']}>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

#### Props:
- `children`: Components to render if authorized
- `allowedRoles`: Optional array of roles that can access this route
- `redirectTo`: Optional custom redirect path (defaults to `/auth/login`)
- `loadingComponent`: Optional custom loading component

#### Hook Usage:

```tsx
import { useProtectedRoute } from '@/components/auth/protected-route';

function MyComponent() {
  const { isLoading, user, isAuthorized, error } = useProtectedRoute(['lecturer']);
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return <div>Not authorized</div>;
  
  return <div>Protected content</div>;
}
```

### 2. Loading Components

**Location:** `src/components/ui/loading.tsx`

Provides consistent loading indicators across the application.

#### Loading Component:

```tsx
import { Loading } from '@/components/ui/loading';

// Full screen loading
<Loading size="lg" text="Loading..." fullScreen />

// Inline loading
<Loading size="md" text="Processing..." />
```

#### Loading Skeleton:

```tsx
import { LoadingSkeleton } from '@/components/ui/loading';

<LoadingSkeleton className="h-20 w-full" />
```

#### Loading Spinner:

```tsx
import { LoadingSpinner } from '@/components/ui/loading';

<LoadingSpinner size="sm" />
```

### 3. Error Boundary

**Location:** `src/components/ui/error-boundary.tsx`

Catches JavaScript errors in component trees and displays fallback UI.

#### Usage:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary onError={(error, errorInfo) => console.error(error)}>
  <YourComponent />
</ErrorBoundary>
```

#### Error Display Component:

```tsx
import { ErrorDisplay } from '@/components/ui/error-boundary';

<ErrorDisplay
  title="Failed to load data"
  message="Could not fetch complaints. Please try again."
  onRetry={() => refetch()}
/>
```

### 4. Toast Notifications

**Location:** `src/components/ui/toast.tsx`

Provides toast notifications for user feedback.

#### Setup:

The `ToastProvider` is already added to the root layout. Use the `useToast` hook in any component:

```tsx
import { useToast } from '@/components/ui/toast';

function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong', 'Error');
  };
  
  const handleInfo = () => {
    toast.info('New notification received');
  };
  
  const handleWarning = () => {
    toast.warning('Please review your input');
  };
  
  return <button onClick={handleSuccess}>Show Toast</button>;
}
```

### 5. Error Handler Utilities

**Location:** `src/lib/error-handler.ts`

Provides utilities for consistent error handling.

#### Format Errors:

```tsx
import { formatError, formatAuthError } from '@/lib/error-handler';

try {
  await someOperation();
} catch (error) {
  const message = formatError(error);
  toast.error(message);
}
```

#### Handle Async Operations:

```tsx
import { handleAsync } from '@/lib/error-handler';

const [data, error] = await handleAsync(
  fetchComplaints(),
  'Failed to fetch complaints'
);

if (error) {
  toast.error(error.message);
  return;
}

// Use data
```

#### Retry with Backoff:

```tsx
import { retryWithBackoff } from '@/lib/error-handler';

const data = await retryWithBackoff(
  () => fetchData(),
  3, // max retries
  1000 // base delay in ms
);
```

#### Log Errors:

```tsx
import { logError } from '@/lib/error-handler';

try {
  await operation();
} catch (error) {
  logError(error, 'Operation failed', { userId: user.id });
}
```

## Authentication Pages

All authentication pages now include:

### Loading States:
- Button loading indicators with spinner
- Disabled form inputs during submission
- Loading text feedback

### Error Handling:
- Field-level validation errors
- Form-level error messages
- Network error handling
- Authentication error formatting
- Success state displays

### Features:

#### Login Form:
- Email and password validation
- Show/hide password toggle
- Loading state during sign-in
- Error messages for invalid credentials
- Redirect to requested page after login
- Success redirect handling

#### Register Form:
- Full name, email, password validation
- Role selection (student, lecturer, admin)
- Password strength requirements
- Confirm password matching
- Loading state during registration
- Success message with email verification prompt

#### Forgot Password Form:
- Email validation
- Loading state during request
- Success message with instructions
- Option to resend email

#### Reset Password Form:
- New password validation
- Password strength requirements
- Confirm password matching
- Loading state during reset
- Success redirect to login

## Middleware Protection

**Location:** `src/middleware.ts`

The middleware now includes:

### Features:
- Session refresh on every request
- Automatic redirect to login for unauthenticated users
- Redirect authenticated users away from auth pages
- Error handling for auth failures
- Redirect parameter preservation
- Graceful error handling to prevent app breakage

### Protected Routes:
- All routes except `/`, `/auth/*` require authentication
- Auth callback and reset-password pages allow authenticated access
- Unauthenticated users are redirected to login with return URL

## Best Practices

### 1. Always Show Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await operation();
  } finally {
    setIsLoading(false);
  }
};

return (
  <Button disabled={isLoading}>
    {isLoading ? <LoadingSpinner /> : 'Submit'}
  </Button>
);
```

### 2. Handle Errors Gracefully

```tsx
try {
  await operation();
  toast.success('Success!');
} catch (error) {
  const message = formatError(error);
  toast.error(message);
  logError(error, 'Operation context');
}
```

### 3. Provide User Feedback

```tsx
// Good: Clear feedback
toast.success('Complaint submitted successfully!');

// Bad: No feedback
// User doesn't know if action succeeded
```

### 4. Disable Actions During Loading

```tsx
<Input disabled={isLoading} />
<Button disabled={isLoading}>Submit</Button>
```

### 5. Use Error Boundaries for Component Errors

```tsx
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>
```

## Testing

When testing components with loading and error states:

1. Test loading state display
2. Test error state display
3. Test success state display
4. Test disabled states during loading
5. Test error recovery (retry functionality)

## Future Enhancements

Potential improvements:
- Add progress indicators for long operations
- Implement optimistic UI updates
- Add offline detection and handling
- Implement request cancellation
- Add skeleton screens for data loading
- Implement error recovery strategies
