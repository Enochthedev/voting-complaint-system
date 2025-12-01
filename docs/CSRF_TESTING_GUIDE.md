# CSRF Protection Testing Guide

## Overview

This guide provides step-by-step instructions for testing the CSRF protection implementation in the Student Complaint Resolution System.

## Prerequisites

- Application running locally (`npm run dev`)
- `curl` command-line tool installed
- Browser with developer tools
- Optional: Postman or similar API testing tool

## Test Scenarios

### Test 1: Verify CSRF Token Generation

**Objective**: Confirm that CSRF tokens are generated correctly.

**Steps:**

1. Start the application:

```bash
npm run dev
```

2. Request a CSRF token:

```bash
curl -c cookies.txt http://localhost:3000/api/csrf-token
```

**Expected Response:**

```json
{
  "token": "abc123...64-character-hex-string",
  "message": "CSRF token generated successfully"
}
```

**Verification:**

- Token should be 64 characters long
- Token should contain only hex characters (0-9, a-f)
- Cookie file should contain `csrf_token` cookie

3. Check the cookie:

```bash
cat cookies.txt
```

**Expected Output:**

```
localhost:3000	FALSE	/	FALSE	0	csrf_token	abc123...
```

**✅ Pass Criteria:**

- Token is generated
- Token is 64 characters
- Cookie is set with correct attributes

---

### Test 2: Valid CSRF Request

**Objective**: Verify that requests with valid CSRF tokens are accepted.

**Steps:**

1. Get CSRF token and save cookies:

```bash
curl -c cookies.txt http://localhost:3000/api/csrf-token
```

2. Extract token from response (save it to a variable):

```bash
TOKEN=$(curl -s -c cookies.txt http://localhost:3000/api/csrf-token | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

3. Make a protected request with the token:

```bash
curl -b cookies.txt \
  -H "x-csrf-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint
```

**Expected Response:**

- Request should be accepted (not 403)
- Response depends on the endpoint

**✅ Pass Criteria:**

- Request is not rejected with 403
- CSRF validation passes

---

### Test 3: Missing CSRF Token (Should Fail)

**Objective**: Verify that requests without CSRF tokens are rejected.

**Steps:**

1. Make a POST request without CSRF token:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint
```

**Expected Response:**

```json
{
  "error": "CSRF validation failed",
  "message": "Invalid or missing CSRF token"
}
```

**Expected Status Code:** 403 Forbidden

**✅ Pass Criteria:**

- Request is rejected with 403
- Error message indicates CSRF validation failure

---

### Test 4: Invalid CSRF Token (Should Fail)

**Objective**: Verify that requests with invalid tokens are rejected.

**Steps:**

1. Get cookies (but use wrong token):

```bash
curl -c cookies.txt http://localhost:3000/api/csrf-token
```

2. Make request with invalid token:

```bash
curl -b cookies.txt \
  -H "x-csrf-token: invalid-token-12345" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint
```

**Expected Response:**

```json
{
  "error": "CSRF validation failed",
  "message": "Invalid or missing CSRF token"
}
```

**Expected Status Code:** 403 Forbidden

**✅ Pass Criteria:**

- Request is rejected with 403
- Token mismatch is detected

---

### Test 5: Token in Header but Not in Cookie (Should Fail)

**Objective**: Verify that both cookie and header are required.

**Steps:**

1. Make request with header but no cookie:

```bash
curl -H "x-csrf-token: abc123def456" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint
```

**Expected Response:**

```json
{
  "error": "CSRF validation failed",
  "message": "Invalid or missing CSRF token"
}
```

**Expected Status Code:** 403 Forbidden

**✅ Pass Criteria:**

- Request is rejected with 403
- Missing cookie is detected

---

### Test 6: Safe Methods Don't Require CSRF

**Objective**: Verify that GET requests don't require CSRF tokens.

**Steps:**

1. Make GET request without CSRF token:

```bash
curl http://localhost:3000/api/test-endpoint
```

**Expected Response:**

- Request should be accepted
- No CSRF validation error

**✅ Pass Criteria:**

- GET request succeeds without CSRF token
- No 403 error

---

### Test 7: Cross-Origin Request (Should Fail)

**Objective**: Verify that cross-origin requests are blocked.

**Steps:**

1. Get token and cookies:

```bash
curl -c cookies.txt http://localhost:3000/api/csrf-token
TOKEN=$(curl -s -c cookies.txt http://localhost:3000/api/csrf-token | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

2. Make request with different origin:

```bash
curl -b cookies.txt \
  -H "x-csrf-token: $TOKEN" \
  -H "Origin: http://evil.com" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint
```

**Expected Response:**

```json
{
  "error": "CSRF validation failed",
  "message": "Invalid or missing CSRF token"
}
```

**Expected Status Code:** 403 Forbidden

**✅ Pass Criteria:**

- Request is rejected with 403
- Cross-origin request is blocked

---

### Test 8: Browser Testing

**Objective**: Test CSRF protection in a real browser environment.

**Steps:**

1. Open browser and navigate to:

```
http://localhost:3000
```

2. Open Developer Tools (F12)

3. Go to Application/Storage tab

4. Check Cookies:
   - Should see `csrf_token` cookie
   - Cookie should have `HttpOnly` flag
   - Cookie should have `SameSite=Strict`

5. Go to Network tab

6. Perform an action that makes a POST request (e.g., submit a form)

7. Check the request headers:
   - Should see `x-csrf-token` header
   - Token value should match cookie value

8. Check the response:
   - Request should succeed (200 status)
   - No CSRF errors

**✅ Pass Criteria:**

- CSRF cookie is set correctly
- CSRF token is included in requests
- Requests succeed without errors

---

### Test 9: Token Expiration

**Objective**: Verify that expired tokens are rejected.

**Steps:**

1. Get a CSRF token:

```bash
curl -c cookies.txt http://localhost:3000/api/csrf-token
TOKEN=$(curl -s -c cookies.txt http://localhost:3000/api/csrf-token | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

2. Wait for token to expire (1 hour) or manually modify cookie expiration

3. Try to use the expired token:

```bash
curl -b cookies.txt \
  -H "x-csrf-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint
```

**Expected Response:**

```json
{
  "error": "CSRF validation failed",
  "message": "Invalid or missing CSRF token"
}
```

**Expected Status Code:** 403 Forbidden

**✅ Pass Criteria:**

- Expired token is rejected
- New token must be obtained

---

### Test 10: React Component Integration

**Objective**: Test CSRF protection in React components.

**Steps:**

1. Create a test component:

```typescript
// src/app/test-csrf/page.tsx
'use client';

import { useCsrfFetch } from '@/hooks/use-csrf-fetch';
import { useState } from 'react';

export default function TestCsrfPage() {
  const { csrfFetch, isLoading } = useCsrfFetch();
  const [result, setResult] = useState('');

  const testCsrf = async () => {
    try {
      const response = await csrfFetch('/api/test-endpoint', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });
      setResult('Success: ' + JSON.stringify(await response.json()));
    } catch (error) {
      setResult('Error: ' + error.message);
    }
  };

  if (isLoading) {
    return <div>Loading CSRF token...</div>;
  }

  return (
    <div>
      <button onClick={testCsrf}>Test CSRF</button>
      <div>{result}</div>
    </div>
  );
}
```

2. Navigate to the test page:

```
http://localhost:3000/test-csrf
```

3. Click "Test CSRF" button

4. Check the result

**✅ Pass Criteria:**

- Token loads successfully
- Request includes CSRF token
- Request succeeds

---

## Automated Testing Script

Create a test script to run all tests:

```bash
#!/bin/bash
# test-csrf.sh

echo "=== CSRF Protection Test Suite ==="
echo ""

# Test 1: Token Generation
echo "Test 1: Token Generation"
RESPONSE=$(curl -s -c cookies.txt http://localhost:3000/api/csrf-token)
if echo "$RESPONSE" | grep -q "token"; then
  echo "✅ PASS: Token generated"
else
  echo "❌ FAIL: Token not generated"
fi
echo ""

# Test 2: Valid Request
echo "Test 2: Valid CSRF Request"
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
RESPONSE=$(curl -s -b cookies.txt \
  -H "x-csrf-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint)
if ! echo "$RESPONSE" | grep -q "CSRF validation failed"; then
  echo "✅ PASS: Valid request accepted"
else
  echo "❌ FAIL: Valid request rejected"
fi
echo ""

# Test 3: Missing Token
echo "Test 3: Missing CSRF Token"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint)
if echo "$RESPONSE" | grep -q "403"; then
  echo "✅ PASS: Request without token rejected"
else
  echo "❌ FAIL: Request without token accepted"
fi
echo ""

# Test 4: Invalid Token
echo "Test 4: Invalid CSRF Token"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -b cookies.txt \
  -H "x-csrf-token: invalid-token" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"test":"data"}' \
  http://localhost:3000/api/test-endpoint)
if echo "$RESPONSE" | grep -q "403"; then
  echo "✅ PASS: Invalid token rejected"
else
  echo "❌ FAIL: Invalid token accepted"
fi
echo ""

# Test 5: GET Request (No CSRF Required)
echo "Test 5: GET Request (No CSRF Required)"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/test-endpoint)
if ! echo "$RESPONSE" | grep -q "403"; then
  echo "✅ PASS: GET request allowed without CSRF"
else
  echo "❌ FAIL: GET request blocked"
fi
echo ""

# Cleanup
rm -f cookies.txt

echo "=== Test Suite Complete ==="
```

Run the script:

```bash
chmod +x test-csrf.sh
./test-csrf.sh
```

---

## Troubleshooting

### Issue: Token not being set in cookie

**Check:**

1. Verify middleware is running
2. Check browser console for errors
3. Verify cookie settings in browser

**Solution:**

- Ensure `CsrfProvider` is in root layout
- Check that API route is accessible
- Verify cookie settings allow cookies

### Issue: Token validation always fails

**Check:**

1. Verify token is being sent in header
2. Check token matches cookie value
3. Verify token hasn't expired

**Solution:**

- Use `useCsrfFetch` hook
- Check browser network tab
- Refresh token if expired

### Issue: CORS errors

**Check:**

1. Verify origin header
2. Check allowed origins configuration

**Solution:**

- Add origin to `ALLOWED_ORIGINS` env var
- Ensure request is same-origin

---

## Test Results Template

Use this template to document test results:

```
CSRF Protection Test Results
Date: [DATE]
Tester: [NAME]
Environment: [dev/staging/production]

Test 1: Token Generation
Status: [PASS/FAIL]
Notes: [Any observations]

Test 2: Valid CSRF Request
Status: [PASS/FAIL]
Notes: [Any observations]

Test 3: Missing CSRF Token
Status: [PASS/FAIL]
Notes: [Any observations]

Test 4: Invalid CSRF Token
Status: [PASS/FAIL]
Notes: [Any observations]

Test 5: Token in Header but Not in Cookie
Status: [PASS/FAIL]
Notes: [Any observations]

Test 6: Safe Methods Don't Require CSRF
Status: [PASS/FAIL]
Notes: [Any observations]

Test 7: Cross-Origin Request
Status: [PASS/FAIL]
Notes: [Any observations]

Test 8: Browser Testing
Status: [PASS/FAIL]
Notes: [Any observations]

Test 9: Token Expiration
Status: [PASS/FAIL]
Notes: [Any observations]

Test 10: React Component Integration
Status: [PASS/FAIL]
Notes: [Any observations]

Overall Result: [PASS/FAIL]
Issues Found: [List any issues]
Recommendations: [Any recommendations]
```

---

## Continuous Testing

### Development

Run tests before committing:

```bash
./test-csrf.sh
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Test CSRF Protection
  run: |
    npm run dev &
    sleep 5
    ./test-csrf.sh
```

### Production Monitoring

Monitor CSRF failures in production:

- Check logs for "CSRF validation failed"
- Set up alerts for high failure rates
- Track metrics in monitoring dashboard

---

## References

- [CSRF Protection Documentation](./CSRF_PROTECTION.md)
- [Quick Reference Guide](./CSRF_PROTECTION_QUICK_REFERENCE.md)
- [Migration Examples](./CSRF_MIGRATION_EXAMPLES.md)
