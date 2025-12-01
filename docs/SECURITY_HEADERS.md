# Security Headers Implementation

## Overview

Security headers have been implemented in the Next.js configuration to protect the Student Complaint Resolution System against common web vulnerabilities. These headers are automatically applied to all routes in the application.

## Implemented Security Headers

### 1. X-Frame-Options: DENY

**Purpose**: Prevents clickjacking attacks by preventing the site from being embedded in iframes.

**Value**: `DENY`

**Protection**:

- Prevents attackers from embedding your site in a malicious iframe
- Stops UI redressing attacks where users are tricked into clicking hidden elements

**Impact**: The application cannot be embedded in any iframe, including on your own domains.

---

### 2. X-Content-Type-Options: nosniff

**Purpose**: Prevents MIME type sniffing attacks.

**Value**: `nosniff`

**Protection**:

- Forces browsers to respect the declared Content-Type
- Prevents browsers from interpreting files as a different MIME type
- Stops attackers from uploading malicious files disguised as safe types

**Example**: A malicious JavaScript file uploaded as an image won't be executed.

---

### 3. X-XSS-Protection: 1; mode=block

**Purpose**: Enables browser's built-in XSS (Cross-Site Scripting) protection.

**Value**: `1; mode=block`

**Protection**:

- Activates the browser's XSS filter
- Blocks the page if an XSS attack is detected
- Legacy header but still provides defense-in-depth

**Note**: Modern browsers rely more on CSP, but this provides additional protection for older browsers.

---

### 4. Referrer-Policy: strict-origin-when-cross-origin

**Purpose**: Controls how much referrer information is sent with requests.

**Value**: `strict-origin-when-cross-origin`

**Protection**:

- Sends full URL for same-origin requests
- Sends only origin (domain) for cross-origin requests
- Protects sensitive information in URLs from leaking to third parties

**Example**: When navigating from `https://yourapp.com/complaints/123` to an external site, only `https://yourapp.com` is sent.

---

### 5. Permissions-Policy

**Purpose**: Controls which browser features and APIs can be used.

**Value**: `camera=(), microphone=(), geolocation=(), interest-cohort=()`

**Protection**:

- Disables camera access (not needed for this application)
- Disables microphone access (not needed for this application)
- Disables geolocation tracking
- Opts out of Google's FLoC/Topics (privacy protection)

**Benefit**: Reduces attack surface by disabling unnecessary browser features.

---

### 6. Strict-Transport-Security (HSTS)

**Purpose**: Forces HTTPS connections and prevents protocol downgrade attacks.

**Value**: `max-age=31536000; includeSubDomains; preload`

**Protection**:

- Forces all connections to use HTTPS for 1 year (31536000 seconds)
- Applies to all subdomains
- Eligible for browser HSTS preload list
- Prevents man-in-the-middle attacks via SSL stripping

**Important**: Only works when site is accessed via HTTPS. Vercel automatically provides HTTPS.

---

### 7. Content-Security-Policy (CSP)

**Purpose**: The most powerful security header - defines trusted sources for all content types.

**Value**: Comprehensive policy (see below)

**Protection**: Prevents XSS attacks, data injection, and unauthorized resource loading.

#### CSP Directives Explained:

```
default-src 'self'
```

- Default policy: only allow resources from same origin
- Applies to any directive not explicitly set

```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

- Scripts: allow from same origin
- `unsafe-inline`: Required for Next.js inline scripts
- `unsafe-eval`: Required for development and some React features
- **Note**: In production, consider removing `unsafe-eval` if possible

```
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

- Styles: allow from same origin and inline styles
- Allow Google Fonts stylesheets
- `unsafe-inline`: Required for styled-components and CSS-in-JS

```
img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in
```

- Images: allow from same origin, data URIs, blob URIs
- Allow Supabase storage for uploaded attachments
- Supports both `.co` and `.in` Supabase domains

```
font-src 'self' https://fonts.gstatic.com
```

- Fonts: allow from same origin and Google Fonts CDN

```
connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in
```

- API connections: allow same origin and Supabase API
- Includes WebSocket connections (wss://) for Realtime features
- Required for all Supabase database and auth operations

```
media-src 'self' https://*.supabase.co https://*.supabase.in
```

- Media files: allow from same origin and Supabase storage
- Supports video/audio attachments if added in future

```
object-src 'none'
```

- Completely disallow plugins like Flash, Java applets
- Prevents legacy plugin-based attacks

```
base-uri 'self'
```

- Restricts `<base>` tag to same origin
- Prevents base tag hijacking attacks

```
form-action 'self'
```

- Forms can only submit to same origin
- Prevents form hijacking to external sites

```
frame-ancestors 'none'
```

- Prevents embedding in iframes (modern alternative to X-Frame-Options)
- More flexible than X-Frame-Options for future needs

```
upgrade-insecure-requests
```

- Automatically upgrades HTTP requests to HTTPS
- Ensures all resources load securely

---

## Testing Security Headers

### 1. Manual Testing

Check headers in browser DevTools:

1. Open the application in your browser
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Click on the document request
6. Check the Response Headers section

### 2. Online Security Scanners

Test your deployed application with:

- **Mozilla Observatory**: https://observatory.mozilla.org/
- **Security Headers**: https://securityheaders.com/
- **SSL Labs**: https://www.ssllabs.com/ssltest/

### 3. Automated Testing Script

```bash
# Test security headers locally (requires curl)
curl -I http://localhost:3000

# Test security headers on production
curl -I https://your-production-url.vercel.app
```

---

## CSP Violation Reporting (Optional Enhancement)

To monitor CSP violations in production, you can add a `report-uri` or `report-to` directive:

```typescript
// In next.config.ts, add to CSP:
"report-uri /api/csp-report",
```

Then create an API route to log violations:

```typescript
// app/api/csp-report/route.ts
export async function POST(request: Request) {
  const report = await request.json();
  console.error('CSP Violation:', report);
  // Optionally send to monitoring service
  return new Response('OK', { status: 200 });
}
```

---

## Troubleshooting

### Issue: Styles not loading

**Cause**: CSP blocking inline styles or external stylesheets

**Solution**:

- Verify `style-src` includes `'unsafe-inline'` and required CDN domains
- Check browser console for CSP violation errors

### Issue: Images not displaying

**Cause**: CSP blocking image sources

**Solution**:

- Add the image domain to `img-src` directive
- For Supabase storage, ensure `https://*.supabase.co` is included

### Issue: API calls failing

**Cause**: CSP blocking API connections

**Solution**:

- Verify `connect-src` includes your API domain
- For Supabase, ensure both `https://` and `wss://` protocols are allowed

### Issue: Third-party scripts not working

**Cause**: CSP blocking external scripts

**Solution**:

- Add the script domain to `script-src` directive
- Consider using `nonce` or `hash` instead of `unsafe-inline` for better security

---

## Security Best Practices

### 1. Regular Updates

- Review and update CSP directives as new features are added
- Remove unused directives to minimize attack surface
- Test thoroughly after any CSP changes

### 2. Production Hardening

Consider these improvements for production:

```typescript
// Remove unsafe-eval in production
script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'production' ? '' : "'unsafe-eval'"}

// Add nonce-based CSP for inline scripts
// This requires Next.js middleware to generate nonces
```

### 3. Monitoring

- Set up CSP violation reporting
- Monitor security headers with automated tools
- Review security headers after deployments

### 4. Defense in Depth

Security headers are one layer of protection. Also ensure:

- ✅ Input validation and sanitization (implemented)
- ✅ CSRF protection (implemented)
- ✅ Rate limiting (implemented)
- ✅ Row Level Security in database (implemented)
- ✅ Secure authentication (implemented)
- ✅ Regular security audits

---

## Compliance and Standards

These security headers help meet various security standards:

- **OWASP Top 10**: Addresses A03:2021 - Injection and A05:2021 - Security Misconfiguration
- **PCI DSS**: Requirement 6.5 - Secure coding practices
- **GDPR**: Privacy protection through reduced tracking
- **SOC 2**: Security controls for data protection

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

## Summary

✅ **X-Frame-Options**: Prevents clickjacking
✅ **X-Content-Type-Options**: Prevents MIME sniffing
✅ **X-XSS-Protection**: Browser XSS filter
✅ **Referrer-Policy**: Controls referrer information
✅ **Permissions-Policy**: Restricts browser features
✅ **Strict-Transport-Security**: Forces HTTPS
✅ **Content-Security-Policy**: Comprehensive content restrictions

All security headers are now active and protecting the application against common web vulnerabilities.
