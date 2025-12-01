# CSRF Protection - Quick Reference

## What is CSRF Protection?

CSRF (Cross-Site Request Forgery) protection prevents malicious websites from making unauthorized requests on behalf of authenticated users.

## Quick Start

### 1. Using CSRF-Protected Fetch (Recommended)

```typescript
'use client';

import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

export function MyComponent() {
  const { csrfFetch } = useCsrfFetch();

  const handleSubmit = async () => {
    const response = await csrfFetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
}
```

### 2. Using CSRF Token Directly

```typescript
'use client';

import { useCsrfToken } from '@/components/providers/csrf-provider';

export function MyComponent() {
  const { token } = useCsrfToken();

  const handleSubmit = async () => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: {
        'x-csrf-token': token!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };
}
```

### 3. Using with Supabase

```typescript
'use client';

import { useCsrfToken } from '@/components/providers/csrf-provider';
import { createCsrfProtectedSupabaseClient } from '@/lib/supabase-csrf';

export function MyComponent() {
  const { token } = useCsrfToken();
  const supabase = createCsrfProtectedSupabaseClient(token);

  const handleSubmit = async () => {
    const { data, error } = await supabase.from('table').insert(data);
  };
}
```

## When is CSRF Protection Required?

CSRF protection is **automatically enforced** for:

- POST requests
- PUT requests
- PATCH requests
- DELETE requests

CSRF protection is **NOT required** for:

- GET requests
- HEAD requests
- OPTIONS requests
- Server-side operations

## How It Works

1. **Token Generation**: A secure random token is generated on the server
2. **Cookie Storage**: Token is stored in an HTTP-only cookie
3. **Client Access**: Same token is provided to client via context
4. **Request Validation**: Client includes token in `x-csrf-token` header
5. **Server Validation**: Middleware validates token matches cookie

## Common Patterns

### Form Submission

```typescript
const { csrfFetch } = useCsrfFetch();

const onSubmit = async (formData: FormData) => {
  const response = await csrfFetch('/api/complaints', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Submission failed');
  }

  return response.json();
};
```

### Mutation with React Query

```typescript
import { useMutation } from '@tanstack/react-query';
import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

function useCreateComplaint() {
  const { csrfFetch } = useCsrfFetch();

  return useMutation({
    mutationFn: async (data: ComplaintData) => {
      const response = await csrfFetch('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });
}
```

### Bulk Operations

```typescript
const { csrfFetch } = useCsrfFetch();

const bulkUpdate = async (ids: string[], updates: any) => {
  const response = await csrfFetch('/api/complaints/bulk', {
    method: 'PATCH',
    body: JSON.stringify({ ids, updates }),
  });

  return response.json();
};
```

## Troubleshooting

### Error: "CSRF token not available"

**Solution**: Wait for token to load

```typescript
const { token, isLoading } = useCsrfToken();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Error: "CSRF validation failed"

**Possible causes**:

1. Token not included in request header
2. Token expired (tokens last 1 hour)
3. Cookie not sent with request
4. Cross-origin request

**Solution**: Use `useCsrfFetch` hook which handles this automatically

### Error: "Cross-origin request not allowed"

**Solution**: Add origin to allowed list in `.env.local`:

```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Testing

### Manual Test

```bash
# 1. Get CSRF token
curl -c cookies.txt http://localhost:3000/api/csrf-token

# 2. Extract token from response
TOKEN="your-token-here"

# 3. Make protected request
curl -b cookies.txt \
  -H "x-csrf-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"data":"test"}' \
  http://localhost:3000/api/endpoint
```

### Test Without Token (Should Fail)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}' \
  http://localhost:3000/api/endpoint

# Expected: 403 Forbidden
```

## Security Features

✅ **Double-Submit Cookie Pattern**: Token in cookie + header  
✅ **Cryptographically Secure**: Uses `crypto.getRandomValues`  
✅ **HTTP-Only Cookies**: Prevents XSS token theft  
✅ **SameSite Strict**: Prevents cross-site cookie sending  
✅ **Origin Validation**: Checks request origin/referer  
✅ **Constant-Time Comparison**: Prevents timing attacks  
✅ **Token Expiration**: Tokens expire after 1 hour

## Best Practices

1. ✅ **Always use `useCsrfFetch` for mutations**
2. ✅ **Check `isLoading` before making requests**
3. ✅ **Use HTTPS in production**
4. ✅ **Keep tokens short-lived**
5. ✅ **Validate origin headers**
6. ❌ **Never disable CSRF protection**
7. ❌ **Never expose tokens in URLs**
8. ❌ **Never store tokens in localStorage**

## API Reference

### Hooks

#### `useCsrfToken()`

Returns CSRF token and loading state.

```typescript
const { token, isLoading } = useCsrfToken();
```

#### `useCsrfFetch()`

Returns fetch wrapper with automatic CSRF protection.

```typescript
const { csrfFetch, token, isLoading } = useCsrfFetch();
```

### Functions

#### `getOrCreateCsrfToken()`

Server-side function to get or create CSRF token.

```typescript
const token = await getOrCreateCsrfToken();
```

#### `validateCsrfRequest(request)`

Validate CSRF token in middleware.

```typescript
const isValid = await validateCsrfRequest(request);
```

### Components

#### `<CsrfProvider>`

Provides CSRF token context to application.

```typescript
<CsrfProvider initialToken={token}>
  {children}
</CsrfProvider>
```

## Environment Variables

```bash
# Optional: Comma-separated list of allowed origins
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

## Files Reference

- **Core Library**: `src/lib/csrf.ts`
- **Provider**: `src/components/providers/csrf-provider.tsx`
- **Hook**: `src/hooks/use-csrf-fetch.ts`
- **API Route**: `src/app/api/csrf-token/route.ts`
- **Middleware**: `middleware.ts`
- **Tests**: `src/lib/__tests__/csrf.test.ts`

## Need More Help?

See full documentation: `docs/CSRF_PROTECTION.md`
