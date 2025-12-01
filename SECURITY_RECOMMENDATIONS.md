# Security Recommendations - Action Plan

**Date**: December 1, 2024  
**Priority**: Implementation Roadmap  
**Status**: Ready for Review

---

## 🎯 Overview

This document provides actionable recommendations to enhance the security posture of the Student Complaint Resolution System. Recommendations are prioritized by urgency and impact.

---

## 🔴 Critical Priority (Do Before Production)

### 1. Remove 'unsafe-eval' from Production CSP

**Issue**: The Content Security Policy currently includes 'unsafe-eval' which allows the use of eval() and related functions. This can be exploited for XSS attacks.

**Impact**: High  
**Effort**: Low  
**Timeline**: Before production deployment

**Implementation**:

```typescript
// next.config.ts
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    // Conditional script-src based on environment
    `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'production' ? '' : "'unsafe-eval'"}`,
    // ... rest of CSP
  ].join('; '),
}
```

**Testing**:

1. Build for production: `npm run build`
2. Check CSP header doesn't include 'unsafe-eval'
3. Test all functionality works without eval()
4. Verify no console errors related to CSP

**Success Criteria**:

- Production CSP does not include 'unsafe-eval'
- All features work correctly
- No CSP violations in console

---

### 2. Enable Automated Dependency Scanning

**Issue**: No automated scanning for vulnerable dependencies. Security vulnerabilities in dependencies may go unnoticed.

**Impact**: High  
**Effort**: Low  
**Timeline**: This week

**Implementation**:

**Option A: GitHub Dependabot (Recommended)**

1. Go to repository Settings → Security & analysis
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"
4. Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
    reviewers:
      - 'your-team'
    labels:
      - 'dependencies'
      - 'security'
```

**Option B: Snyk**

1. Sign up at https://snyk.io
2. Connect GitHub repository
3. Configure automatic PR creation
4. Add Snyk badge to README

**Testing**:

1. Verify Dependabot/Snyk is active
2. Check for existing vulnerabilities
3. Test PR creation for updates
4. Review and merge security updates

**Success Criteria**:

- Automated scanning active
- Security alerts configured
- Team notified of vulnerabilities
- Regular updates applied

---

### 3. Implement Security Monitoring

**Issue**: No real-time monitoring of security events, errors, or suspicious activities.

**Impact**: High  
**Effort**: Medium  
**Timeline**: Within 2 weeks

**Implementation**:

**Option A: Sentry (Recommended)**

1. Sign up at https://sentry.io
2. Install Sentry SDK:

```bash
npm install @sentry/nextjs
```

3. Initialize Sentry:

```bash
npx @sentry/wizard@latest -i nextjs
```

4. Configure error tracking:

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  // Security-specific configuration
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },

  // Track security events
  integrations: [new Sentry.BrowserTracing()],
});
```

5. Add security event tracking:

```typescript
// Track authentication failures
Sentry.captureMessage('Authentication failed', {
  level: 'warning',
  tags: { security: 'auth' },
  extra: { email: sanitizedEmail },
});

// Track rate limit violations
Sentry.captureMessage('Rate limit exceeded', {
  level: 'warning',
  tags: { security: 'rate-limit' },
  extra: { operation: operationType },
});

// Track CSRF failures
Sentry.captureMessage('CSRF validation failed', {
  level: 'error',
  tags: { security: 'csrf' },
});
```

**Option B: LogRocket**

1. Sign up at https://logrocket.com
2. Install LogRocket:

```bash
npm install logrocket
```

3. Initialize:

```typescript
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');

// Identify users
LogRocket.identify(user.id, {
  email: user.email,
  role: user.role,
});
```

**Testing**:

1. Trigger test errors
2. Verify errors appear in dashboard
3. Test alert notifications
4. Review captured data for PII

**Success Criteria**:

- Error tracking active
- Security events logged
- Alerts configured
- Team has access to dashboard

---

## 🟡 High Priority (Within 1 Month)

### 4. Add Server-Side Rate Limiting

**Issue**: Current rate limiting is client-side only and can be bypassed.

**Impact**: High  
**Effort**: Medium  
**Timeline**: Within 1 month

**Implementation**:

**Option A: Supabase Edge Functions**

1. Create rate limiting Edge Function:

```typescript
// supabase/functions/rate-limit/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RATE_LIMITS = {
  read: { max: 100, window: 60 },
  write: { max: 30, window: 60 },
  bulk: { max: 10, window: 60 },
};

serve(async (req) => {
  const { userId, operation } = await req.json();

  // Check rate limit using Supabase storage
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: limits } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('operation', operation)
    .single();

  // Implement token bucket logic
  // ...

  return new Response(JSON.stringify({ allowed: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

2. Create rate_limits table:

```sql
CREATE TABLE rate_limits (
  user_id UUID NOT NULL,
  operation TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  last_refill TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, operation)
);
```

3. Call from client:

```typescript
async function checkRateLimit(operation: string) {
  const response = await fetch('/api/rate-limit', {
    method: 'POST',
    body: JSON.stringify({ operation }),
  });

  const { allowed } = await response.json();
  return allowed;
}
```

**Option B: Upstash Redis**

1. Sign up at https://upstash.com
2. Install Upstash:

```bash
npm install @upstash/redis
```

3. Implement rate limiting:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function checkRateLimit(userId: string, operation: string): Promise<boolean> {
  const key = `rate-limit:${userId}:${operation}`;
  const limit = RATE_LIMITS[operation];

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, limit.window);
  }

  return current <= limit.max;
}
```

**Testing**:

1. Make rapid API calls
2. Verify rate limiting enforced
3. Test across multiple clients
4. Verify limits reset correctly

**Success Criteria**:

- Server-side rate limiting active
- Cannot be bypassed from client
- Proper error messages returned
- Monitoring in place

---

### 5. Implement Automated Database Backups

**Issue**: No automated backup system in place. Risk of data loss in disaster scenarios.

**Impact**: Medium  
**Effort**: Low  
**Timeline**: Within 1 month

**Implementation**:

**Supabase Automated Backups**

1. Go to Supabase Dashboard → Database → Backups
2. Enable automated backups:
   - Daily backups: Enabled
   - Retention: 7 days (or more for paid plans)
   - Point-in-time recovery: Enabled (if available)

3. Create backup verification script:

```typescript
// scripts/verify-backups.ts
import { createClient } from '@supabase/supabase-js';

async function verifyBackups() {
  // Check backup status via Supabase Management API
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectId}/database/backups`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      },
    }
  );

  const backups = await response.json();

  // Verify recent backup exists
  const latestBackup = backups[0];
  const backupAge = Date.now() - new Date(latestBackup.created_at).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (backupAge > maxAge) {
    console.error('No recent backup found!');
    // Send alert
  }
}
```

4. Schedule verification (GitHub Actions):

```yaml
# .github/workflows/verify-backups.yml
name: Verify Backups
on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run verify-backups
```

**Testing**:

1. Verify backup creation
2. Test backup restoration (in staging)
3. Document restoration procedure
4. Test verification script

**Success Criteria**:

- Automated backups enabled
- Backups verified daily
- Restoration procedure documented
- Team trained on restoration

---

### 6. Add Multi-Factor Authentication (MFA)

**Issue**: Accounts can be compromised via password theft. No second factor of authentication.

**Impact**: Medium  
**Effort**: Medium  
**Timeline**: Within 2 months

**Implementation**:

**Supabase MFA (TOTP)**

1. Enable MFA in Supabase Dashboard:
   - Go to Authentication → Settings
   - Enable "Multi-Factor Authentication"

2. Add MFA enrollment UI:

```typescript
// components/auth/mfa-enrollment.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';

export function MFAEnrollment() {
  const [qrCode, setQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) {
      console.error('MFA enrollment error:', error);
      return;
    }

    // Generate QR code
    const qr = await QRCode.toDataURL(data.totp.uri);
    setQrCode(qr);
  };

  const verifyMFA = async () => {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId: factorId,
    });

    if (error) {
      console.error('MFA verification error:', error);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factorId,
      challengeId: data.id,
      code: verifyCode,
    });

    if (!verifyError) {
      alert('MFA enabled successfully!');
    }
  };

  return (
    <div>
      <button onClick={enrollMFA}>Enable MFA</button>
      {qrCode && (
        <>
          <img src={qrCode} alt="MFA QR Code" />
          <input
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="Enter 6-digit code"
          />
          <button onClick={verifyMFA}>Verify</button>
        </>
      )}
    </div>
  );
}
```

3. Add MFA verification to login:

```typescript
// components/auth/login-form.tsx
const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  // Check if MFA is required
  if (data.user?.factors && data.user.factors.length > 0) {
    setShowMFAPrompt(true);
  } else {
    router.push('/dashboard');
  }
};

const verifyMFACode = async () => {
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId: factorId,
  });

  // ... verification logic
};
```

4. Enforce MFA for admin accounts:

```typescript
// middleware.ts
if (userRole === 'admin') {
  const { data: factors } = await supabase.auth.mfa.listFactors();

  if (!factors || factors.length === 0) {
    return NextResponse.redirect(new URL('/settings/security?mfa_required=true', request.url));
  }
}
```

**Testing**:

1. Enroll test account with MFA
2. Test login with MFA
3. Test MFA recovery codes
4. Test MFA enforcement for admins

**Success Criteria**:

- MFA enrollment working
- MFA verification working
- Admin accounts require MFA
- Recovery codes available

---

## 🟢 Medium Priority (Within 3-6 Months)

### 7. Add File Content Scanning

**Issue**: Uploaded files are not scanned for malware or malicious content.

**Impact**: Medium  
**Effort**: High  
**Timeline**: Within 3 months

**Implementation**:

**Option A: ClamAV Integration**

1. Set up ClamAV service (Docker):

```dockerfile
# docker-compose.yml
services:
  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"
    volumes:
      - clamav-data:/var/lib/clamav
```

2. Create scanning Edge Function:

```typescript
// supabase/functions/scan-file/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { fileUrl } = await req.json();

  // Download file
  const fileResponse = await fetch(fileUrl);
  const fileBuffer = await fileResponse.arrayBuffer();

  // Scan with ClamAV
  const scanResult = await scanWithClamAV(fileBuffer);

  if (scanResult.infected) {
    // Quarantine file
    await quarantineFile(fileUrl);

    return new Response(JSON.stringify({ safe: false, threat: scanResult.threat }), {
      status: 200,
    });
  }

  return new Response(JSON.stringify({ safe: true }), { status: 200 });
});
```

3. Integrate with file upload:

```typescript
// After file upload
const scanResponse = await fetch('/api/scan-file', {
  method: 'POST',
  body: JSON.stringify({ fileUrl: uploadedFile.url }),
});

const { safe, threat } = await scanResponse.json();

if (!safe) {
  // Delete file and show error
  await supabase.storage.from('attachments').remove([uploadedFile.path]);
  throw new Error(`File contains malware: ${threat}`);
}
```

**Option B: VirusTotal API**

1. Sign up for VirusTotal API
2. Implement scanning:

```typescript
async function scanFileWithVirusTotal(fileBuffer: ArrayBuffer) {
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]));

  const response = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    headers: {
      'x-apikey': process.env.VIRUSTOTAL_API_KEY!,
    },
    body: formData,
  });

  const result = await response.json();
  return result;
}
```

**Testing**:

1. Upload clean test file
2. Upload EICAR test file (safe malware test)
3. Verify detection and quarantine
4. Test performance impact

**Success Criteria**:

- All uploads scanned
- Malicious files blocked
- Quarantine system working
- Performance acceptable

---

### 8. Define and Implement Data Retention Policies

**Issue**: No defined policies for how long data is retained. Potential GDPR compliance issues.

**Impact**: Low  
**Effort**: Medium  
**Timeline**: Within 6 months

**Implementation**:

1. Define retention policies:

```typescript
// lib/data-retention.ts
export const RETENTION_POLICIES = {
  complaints: {
    resolved: 365 * 3, // 3 years
    draft: 90, // 90 days
    deleted: 30, // 30 days in soft delete
  },
  notifications: {
    read: 90, // 90 days
    unread: 365, // 1 year
  },
  audit_logs: {
    all: 365 * 7, // 7 years
  },
  user_data: {
    inactive: 365 * 2, // 2 years
    deleted: 30, // 30 days grace period
  },
};
```

2. Create archival system:

```sql
-- Create archive tables
CREATE TABLE complaints_archive (
  LIKE complaints INCLUDING ALL
);

-- Create archival function
CREATE OR REPLACE FUNCTION archive_old_complaints()
RETURNS void AS $
BEGIN
  -- Move old resolved complaints to archive
  INSERT INTO complaints_archive
  SELECT * FROM complaints
  WHERE status = 'resolved'
  AND updated_at < NOW() - INTERVAL '3 years';

  -- Delete from main table
  DELETE FROM complaints
  WHERE status = 'resolved'
  AND updated_at < NOW() - INTERVAL '3 years';
END;
$ LANGUAGE plpgsql;
```

3. Schedule archival (cron job):

```typescript
// supabase/functions/archive-data/index.ts
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Run archival functions
  await supabase.rpc('archive_old_complaints');
  await supabase.rpc('archive_old_notifications');

  return new Response('Archival complete', { status: 200 });
});
```

**Testing**:

1. Test archival with old test data
2. Verify data moved to archive
3. Test data retrieval from archive
4. Verify deletion after retention period

**Success Criteria**:

- Retention policies documented
- Archival system implemented
- Automated archival running
- Compliance requirements met

---

## 📊 Implementation Timeline

### Week 1-2

- [ ] Remove 'unsafe-eval' from production CSP
- [ ] Enable automated dependency scanning
- [ ] Set up Sentry/LogRocket

### Month 1

- [ ] Implement server-side rate limiting
- [ ] Configure automated backups
- [ ] Add backup verification

### Month 2

- [ ] Implement MFA for admin accounts
- [ ] Add IP-based rate limiting
- [ ] Enhance security monitoring

### Month 3-6

- [ ] Add file content scanning
- [ ] Define data retention policies
- [ ] Implement data archival system
- [ ] Conduct penetration testing

---

## 💰 Cost Estimates

| Item                 | Service              | Cost      | Priority |
| -------------------- | -------------------- | --------- | -------- |
| Dependency Scanning  | GitHub Dependabot    | Free      | Critical |
| Error Monitoring     | Sentry (Team)        | $26/month | Critical |
| Server Rate Limiting | Upstash Redis        | $10/month | High     |
| Backups              | Supabase (included)  | Free      | High     |
| MFA                  | Supabase (included)  | Free      | High     |
| File Scanning        | ClamAV (self-hosted) | $20/month | Medium   |
| Data Archival        | Supabase Storage     | $5/month  | Low      |

**Total Monthly Cost**: ~$61/month

---

## 📈 Success Metrics

Track these metrics to measure security improvements:

1. **Security Incidents**: Target 0 per month
2. **Vulnerability Response Time**: Target < 24 hours
3. **Dependency Updates**: Target 100% within 7 days
4. **Backup Success Rate**: Target 100%
5. **MFA Adoption**: Target 100% for admins, 50% for users
6. **Rate Limit Violations**: Monitor trends
7. **File Scan Detections**: Track and investigate

---

## 🎯 Next Review

**Schedule next security audit**: June 1, 2025 (6 months)

**Interim reviews**:

- Monthly: Security metrics review
- Quarterly: Compliance check
- As needed: After major changes

---

## ✅ Sign-Off

Once all critical and high priority items are complete, update this document and notify the team.

**Last Updated**: December 1, 2024  
**Next Update**: After critical items complete

---

_For questions or clarifications, contact the security team._
