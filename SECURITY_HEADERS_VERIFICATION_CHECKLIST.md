# Security Headers Verification Checklist

Use this checklist to verify security headers are properly configured after deployment.

## Pre-Deployment Verification

### Local Testing

- [ ] **Start Development Server**

  ```bash
  npm run dev
  ```

- [ ] **Run Automated Test Script**

  ```bash
  node scripts/test-security-headers.js http://localhost:3000
  ```

  - [ ] All 7 headers show ✅ PASS
  - [ ] No ❌ FAIL or MISSING headers

- [ ] **Manual Browser Check**
  - [ ] Open http://localhost:3000 in browser
  - [ ] Open DevTools (F12) → Network tab
  - [ ] Refresh page
  - [ ] Click on document request
  - [ ] Verify all headers in Response Headers section

- [ ] **Test Application Functionality**
  - [ ] Login works correctly
  - [ ] Images load (including Supabase storage)
  - [ ] Styles render properly
  - [ ] API calls succeed
  - [ ] Real-time features work
  - [ ] File uploads work
  - [ ] No console errors related to CSP

## Post-Deployment Verification

### Production Testing

- [ ] **Deploy to Production**

  ```bash
  git push origin main  # or your deployment branch
  ```

- [ ] **Wait for Deployment to Complete**
  - [ ] Vercel/hosting platform shows successful deployment
  - [ ] No build errors

- [ ] **Run Automated Test on Production**

  ```bash
  node scripts/test-security-headers.js https://your-production-url.vercel.app
  ```

  - [ ] All 7 headers show ✅ PASS
  - [ ] HSTS header is present (requires HTTPS)

- [ ] **Manual Browser Check on Production**
  - [ ] Open production URL in browser
  - [ ] Open DevTools (F12) → Network tab
  - [ ] Refresh page
  - [ ] Verify all headers present

### Online Security Scanners

- [ ] **Mozilla Observatory**
  - [ ] Visit https://observatory.mozilla.org/
  - [ ] Enter your production URL
  - [ ] Run scan
  - [ ] Expected score: **A or A+**
  - [ ] Screenshot results for documentation

- [ ] **Security Headers Scanner**
  - [ ] Visit https://securityheaders.com/
  - [ ] Enter your production URL
  - [ ] Run scan
  - [ ] Expected score: **A**
  - [ ] Screenshot results for documentation

- [ ] **SSL Labs (HTTPS only)**
  - [ ] Visit https://www.ssllabs.com/ssltest/
  - [ ] Enter your production URL
  - [ ] Run scan
  - [ ] Expected score: **A**
  - [ ] Verify HSTS is enabled

## Functional Testing

### Core Features

- [ ] **Authentication**
  - [ ] Login page loads
  - [ ] Can log in successfully
  - [ ] Session persists
  - [ ] Logout works

- [ ] **Dashboard**
  - [ ] Dashboard loads without errors
  - [ ] All widgets display correctly
  - [ ] No CSP violations in console

- [ ] **Complaints**
  - [ ] Can view complaint list
  - [ ] Can create new complaint
  - [ ] Can view complaint details
  - [ ] Rich text editor works
  - [ ] Tag autocomplete works

- [ ] **File Uploads**
  - [ ] Can upload files
  - [ ] File previews display
  - [ ] Can download attachments
  - [ ] Images from Supabase storage load

- [ ] **Real-time Features**
  - [ ] Notifications update in real-time
  - [ ] WebSocket connection established
  - [ ] No connection errors

- [ ] **Styling**
  - [ ] All styles load correctly
  - [ ] Google Fonts load (if used)
  - [ ] Dark mode works (if implemented)
  - [ ] No missing styles

- [ ] **API Calls**
  - [ ] All API endpoints respond
  - [ ] Supabase queries work
  - [ ] No CORS errors
  - [ ] No CSP blocking errors

## Browser Compatibility

Test on multiple browsers:

- [ ] **Chrome/Edge**
  - [ ] All features work
  - [ ] No console errors
  - [ ] Headers present

- [ ] **Firefox**
  - [ ] All features work
  - [ ] No console errors
  - [ ] Headers present

- [ ] **Safari**
  - [ ] All features work
  - [ ] No console errors
  - [ ] Headers present

## Security Validation

### Header Presence

- [ ] **X-Frame-Options**: DENY
- [ ] **X-Content-Type-Options**: nosniff
- [ ] **X-XSS-Protection**: 1; mode=block
- [ ] **Referrer-Policy**: strict-origin-when-cross-origin
- [ ] **Permissions-Policy**: Contains camera=(), microphone=(), geolocation=()
- [ ] **Strict-Transport-Security**: Contains max-age (HTTPS only)
- [ ] **Content-Security-Policy**: Contains default-src, script-src, style-src, etc.

### CSP Directives

Verify CSP includes:

- [ ] `default-src 'self'`
- [ ] `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
- [ ] `style-src 'self' 'unsafe-inline'`
- [ ] `img-src 'self' data: blob: https://*.supabase.co`
- [ ] `connect-src 'self' https://*.supabase.co wss://*.supabase.co`
- [ ] `font-src 'self'`
- [ ] `object-src 'none'`
- [ ] `base-uri 'self'`
- [ ] `form-action 'self'`
- [ ] `frame-ancestors 'none'`
- [ ] `upgrade-insecure-requests`

## Troubleshooting

If any checks fail, refer to:

- [ ] `docs/SECURITY_HEADERS.md` - Comprehensive troubleshooting guide
- [ ] `docs/SECURITY_HEADERS_QUICK_REFERENCE.md` - Quick fixes
- [ ] Browser console for specific CSP violation errors

### Common Issues

- [ ] **Headers not appearing**
  - Restart dev server
  - Clear browser cache
  - Verify next.config.ts is deployed

- [ ] **CSP blocking resources**
  - Check browser console for violations
  - Update CSP directives in next.config.ts
  - Add required domains

- [ ] **HSTS not working**
  - Verify site is accessed via HTTPS
  - HSTS only works over secure connections

## Documentation

- [ ] **Update Security Documentation**
  - [ ] Add scanner results to docs
  - [ ] Document any CSP adjustments made
  - [ ] Note any issues encountered

- [ ] **Team Communication**
  - [ ] Notify team of security headers implementation
  - [ ] Share scanner results
  - [ ] Document any breaking changes

## Sign-Off

- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] Online scanners show A/A+ scores
- [ ] No functionality broken
- [ ] Documentation updated
- [ ] Team notified

**Verified By**: ********\_\_\_********

**Date**: ********\_\_\_********

**Production URL**: ********\_\_\_********

**Scanner Scores**:

- Mozilla Observatory: **\_** / A+
- Security Headers: **\_** / A
- SSL Labs: **\_** / A

---

## Quick Test Commands

```bash
# Local testing
npm run dev
node scripts/test-security-headers.js http://localhost:3000

# Production testing
node scripts/test-security-headers.js https://your-app.vercel.app

# Check specific header
curl -I https://your-app.vercel.app | grep -i "content-security-policy"
```

## Expected Test Output

```
🔒 Security Headers Test

Testing URL: https://your-app.vercel.app

Status Code: 200

Security Headers Check:

────────────────────────────────────────────────────────────────────────────────
✅ PASS | x-frame-options
         Prevents clickjacking attacks
         Value: DENY
────────────────────────────────────────────────────────────────────────────────
✅ PASS | x-content-type-options
         Prevents MIME type sniffing
         Value: nosniff
────────────────────────────────────────────────────────────────────────────────
✅ PASS | x-xss-protection
         Enables browser XSS protection
         Value: 1; mode=block
────────────────────────────────────────────────────────────────────────────────
✅ PASS | referrer-policy
         Controls referrer information
         Value: strict-origin-when-cross-origin
────────────────────────────────────────────────────────────────────────────────
✅ PASS | permissions-policy
         Restricts browser features
         Value: camera=(), microphone=(), geolocation=(), interest-cohort=()
────────────────────────────────────────────────────────────────────────────────
✅ PASS | strict-transport-security
         Forces HTTPS connections
         Value: max-age=31536000; includeSubDomains; preload
────────────────────────────────────────────────────────────────────────────────
✅ PASS | content-security-policy
         Defines trusted content sources
         Value: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self'...
────────────────────────────────────────────────────────────────────────────────

📊 Summary:

Total Headers Checked: 7
✅ Passed: 7
❌ Failed: 0

🎉 All security headers are properly configured!
```

---

**Status**: Ready for verification ✅
