# CSRF Protection Implementation

## Overview

This document describes the Cross-Site Request Forgery (CSRF) protection implementation for the Student Complaint Resolution System. CSRF protection prevents malicious websites from making unauthorized requests on behalf of authenticated users.

## Security Features

### 1. Double-Submit Cookie Pattern

The system uses the double-submit cookie pattern for CSRF protection:

- A CSRF token is generated on the server and stored in an HTTP-only cookie
- The same token is provided to the client for inclusion in request headers
- The server validates that both tokens match for state-changing requests

### 2. Token Generation

- Tokens are generated using cryptographically secure random values (`crypto.getRandomValues`)
- Each token is 32 bytes (64 hex characters) long
- Tokens expire after 1 hour
- Tokens are stored in HTTP-only cookies with secure attributes

### 3. Origin Validation

The middleware validates request origins to prevent cross-origin attacks:

- Checks `Origin` and `Referer` headers
- Allows same-origin requests
- Supports configurable allowed origins via `ALLOWED_ORIGINS` environment variable

### 4. Protected Methods

CSRF protection is enforced for all state-changing HTTP methods:

- POST
- PUT
- PATCH
- DELETE

Safe methods (GET, HEAD, OPTIONS) do not require CSRF tokens.

## Implementation Components

### 1. Core CSRF Library (`src/lib/csrf.ts`)

Provides core CSRF functionality:

```typescript
// Generate a new CSRF token
const token = await generateCsrfToken();

// Get existing token
const token = await getCsrfToken();

// Get or create token
const token = await getOrCreateCsrfToken();

// Validate CSRF token from request
const isValid = await validateCsrfToken(request);

// Validate request origin
const isValid = validateOrigin(request);

// Validate complete CSRF request
const isValid = await validateCsrfRequest(request);
```

### 2. CSRF Provider (`src/components/providers/csrf-provider.tsx`)

React context provider that makes CSRF tokens available throughout the application:

```typescript
import { CsrfProvider, useCsrfToken } from '@/components/providers/csrf-provider';

// In your component
function MyComponent() {
  const { token, isLoading } = useCsrfToken();

  // Use token in requests
}
```

### 3. CSRF Fetch Hook (`src/hooks/use-csrf-fetch.ts`)

Custom hook for making CSRF-protected fetch requests:

```typescript
import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

function MyComponent() {
  const { csrfFetch } = useCsrfFetch();

  const handleSubmit = async () => {
    const response = await csrfFetch('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
}
```

### 4. Middleware Integration (`middleware.ts`)

The Next.js middleware automatically validates CSRF tokens:

```typescript
// CSRF validation happens automatically in middleware
// No additional code needed in route handlers
```

### 5. API Route (`src/app/api/csrf-token/route.ts`)

Endpoint for fetching CSRF tokens:

```
GET /api/csrf-token
```

Response:

```json
{
  "token": "abc123...",
  "message": "CSRF token generated successfully"
}
```

## Usage Guide

### For Client Components

#### Option 1: Using the CSRF Fetch Hook (Recommended)

```typescript
'use client';

import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

export function ComplaintForm() {
  const { csrfFetch } = useCsrfFetch();

  const handleSubmit = async (data: ComplaintData) => {
    try {
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

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  };

  return (
    // Your form JSX
  );
}
```

#### Option 2: Using the CSRF Token Directly

```typescript
'use client';

import { useCsrfToken } from '@/components/providers/csrf-provider';

export function ComplaintForm() {
  const { token, isLoading } = useCsrfToken();

  const handleSubmit = async (data: ComplaintData) => {
    if (isLoading || !token) {
      throw new Error('CSRF token not available');
    }

    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
      },
      body: JSON.stringify(data),
    });

    // Handle response
  };

  return (
    // Your form JSX
  );
}
```

#### Option 3: Using with Supabase Client

```typescript
'use client';

import { useCsrfToken } from '@/components/providers/csrf-provider';
import { createCsrfProtectedSupabaseClient } from '@/lib/supabase-csrf';

export function ComplaintForm() {
  const { token } = useCsrfToken();

  const handleSubmit = async (data: ComplaintData) => {
    const supabase = createCsrfProtectedSupabaseClient(token);

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return complaint;
  };

  return (
    // Your form JSX
  );
}
```

### For Server Components and API Routes

Server-side operations don't need CSRF tokens as they're not vulnerable to CSRF attacks:

```typescript
// Server Component
import { createServerClient } from '@/lib/supabase-server';

export default async function ComplaintsPage() {
  const supabase = await createServerClient();

  const { data: complaints } = await supabase
    .from('complaints')
    .select('*');

  return (
    // Your JSX
  );
}
```

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Optional: Comma-separated list of allowed origins for CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Cookie Configuration

CSRF tokens are stored with the following cookie attributes:

- `httpOnly: true` - Prevents JavaScript access
- `secure: true` (production only) - Requires HTTPS
- `sameSite: 'strict'` - Prevents cross-site cookie sending
- `path: '/'` - Available for all routes
- `maxAge: 3600` - Expires after 1 hour

## Security Best Practices

### 1. Always Use HTTPS in Production

CSRF protection is most effective when combined with HTTPS. The `secure` flag on cookies ensures tokens are only sent over encrypted connections.

### 2. Keep Tokens Short-Lived

Tokens expire after 1 hour. This limits the window of opportunity for attacks.

### 3. Validate Origin Headers

The middleware validates `Origin` and `Referer` headers to prevent cross-origin attacks.

### 4. Use HTTP-Only Cookies

CSRF tokens are stored in HTTP-only cookies, preventing JavaScript access and XSS-based token theft.

### 5. Constant-Time Comparison

Token validation uses constant-time comparison to prevent timing attacks.

## Testing CSRF Protection

### Manual Testing

1. **Test Valid Request:**

```bash
# Get CSRF token
curl -c cookies.txt http://localhost:3000/api/csrf-token

# Extract token from response
TOKEN="your-token-here"

# Make protected request
curl -b cookies.txt \
  -H "x-csrf-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"title":"Test"}' \
  http://localhost:3000/api/complaints
```

2. **Test Missing Token:**

```bash
# Should fail with 403
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}' \
  http://localhost:3000/api/complaints
```

3. **Test Invalid Token:**

```bash
# Should fail with 403
curl -b cookies.txt \
  -H "x-csrf-token: invalid-token" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"title":"Test"}' \
  http://localhost:3000/api/complaints
```

### Automated Testing

Create tests in `src/lib/__tests__/csrf.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateCsrfToken, validateCsrfToken } from '@/lib/csrf';

describe('CSRF Protection', () => {
  it('should generate valid tokens', async () => {
    const token = await generateCsrfToken();
    expect(token).toBeTruthy();
    expect(token.length).toBe(64); // 32 bytes in hex
  });

  it('should validate matching tokens', async () => {
    // Test implementation
  });

  it('should reject mismatched tokens', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Issue: "CSRF token not available"

**Cause:** The CSRF provider hasn't loaded the token yet.

**Solution:** Check that `CsrfProvider` is properly configured in the root layout and wait for `isLoading` to be false.

### Issue: "CSRF validation failed: No token in cookie"

**Cause:** The CSRF cookie is not being sent with the request.

**Solution:**

- Ensure cookies are enabled in the browser
- Check that the request is same-origin
- Verify cookie settings (SameSite, Secure, etc.)

### Issue: "CSRF validation failed: Token mismatch"

**Cause:** The token in the header doesn't match the token in the cookie.

**Solution:**

- Ensure you're using the latest token from the provider
- Check that the token hasn't expired
- Verify the token is being sent correctly in the header

### Issue: "CSRF validation failed: Cross-origin request not allowed"

**Cause:** The request is coming from a different origin.

**Solution:**

- Add the origin to `ALLOWED_ORIGINS` environment variable
- Ensure the request is same-origin
- Check `Origin` and `Referer` headers

## Migration Guide

### Updating Existing API Calls

Before:

```typescript
const response = await fetch('/api/complaints', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

After:

```typescript
import { useCsrfFetch } from '@/hooks/use-csrf-fetch';

const { csrfFetch } = useCsrfFetch();

const response = await csrfFetch('/api/complaints', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

### Updating Supabase Calls

Before:

```typescript
import { supabase } from '@/lib/supabase';

const { data } = await supabase.from('complaints').insert(complaint);
```

After:

```typescript
import { useCsrfToken } from '@/components/providers/csrf-provider';
import { createCsrfProtectedSupabaseClient } from '@/lib/supabase-csrf';

const { token } = useCsrfToken();
const supabase = createCsrfProtectedSupabaseClient(token);

const { data } = await supabase.from('complaints').insert(complaint);
```

## Performance Considerations

### Token Caching

- Tokens are cached in React context to avoid repeated API calls
- Initial token is generated server-side and passed to the client
- Tokens are reused until expiration

### Minimal Overhead

- CSRF validation adds minimal overhead (~1-2ms per request)
- Token generation uses efficient crypto APIs
- Validation uses constant-time comparison

## Compliance

This CSRF protection implementation helps meet security requirements:

- **OWASP Top 10:** Addresses A01:2021 - Broken Access Control
- **CWE-352:** Cross-Site Request Forgery (CSRF)
- **PCI DSS:** Requirement 6.5.9 - Protection against CSRF

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
