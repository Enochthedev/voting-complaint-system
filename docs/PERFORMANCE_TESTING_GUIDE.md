# Performance Testing Guide

This guide explains how to test page load times and performance metrics for the Student Complaint Resolution System.

## Overview

The system includes comprehensive performance testing to ensure compliance with **NFR1: Performance** requirements:

- Page load times under 2 seconds
- Real-time notifications delivered within 1 second
- Support for at least 1000 concurrent users

## Test Scripts

### 1. Page Load Time Testing

**Script:** `scripts/test-page-load-times.js`

Tests the load times of all major pages in the application to ensure they meet the 2-second threshold.

#### Usage

```bash
# Start the development server first
npm run dev

# In another terminal, run the test
node scripts/test-page-load-times.js

# Or with custom parameters
node scripts/test-page-load-times.js --url=http://localhost:3000 --threshold=2000
```

#### Parameters

- `--url`: Base URL of the application (default: `http://localhost:3000`)
- `--threshold`: Maximum acceptable load time in milliseconds (default: `2000`)

#### Pages Tested

**Public Pages:**

- Login Page
- Register Page

**Student Pages:**

- Student Dashboard
- Complaints List
- New Complaint Form
- Draft Complaints
- Votes List
- Announcements
- Notifications

**Lecturer Pages:**

- Lecturer Dashboard
- Admin Complaints
- Analytics Dashboard

#### Test Process

1. **Warmup**: Each page receives 1 warmup request to prime caches
2. **Testing**: Each page is tested 3 times
3. **Metrics**: Average, minimum, and maximum load times are calculated
4. **Evaluation**: Results are compared against the threshold

#### Output

The script provides:

- ✓ PASS/✗ FAIL status for each page
- Average, min, and max load times
- Color-coded results (green = pass, yellow = warning, red = fail)
- Summary statistics

#### Example Output

```
================================================================================
Page Load Time Test Results
================================================================================

Configuration:
  Base URL: http://localhost:3000
  Threshold: 2000ms
  Iterations per page: 3
  Warmup requests: 1

Summary:
  Total pages tested: 11
  Passed: 10
  Failed: 1

Detailed Results:

Successful Tests:

  ✓ PASS Login Page
    Path: /login
    Average: 450ms
    Min: 420ms
    Max: 480ms
    Threshold: 2000ms

  ✗ FAIL Analytics Dashboard
    Path: /admin/dashboard
    Average: 2150ms
    Min: 2100ms
    Max: 2200ms
    Threshold: 2000ms
```

### 2. Comprehensive Performance Metrics

**Script:** `scripts/test-performance-metrics.js`

Provides detailed performance metrics including database queries, API endpoints, and bundle sizes.

#### Usage

```bash
# Run the comprehensive test
node scripts/test-performance-metrics.js
```

#### Metrics Tested

**Bundle Size Analysis:**

- Analyzes Next.js build output
- Shows bundle sizes per page
- Identifies large bundles

**Database Query Performance:**

- Fetch complaints list (paginated)
- Fetch single complaint with relations
- Full-text search query
- Fetch notifications
- Fetch announcements

**API Endpoint Performance:**

- Health check
- Complaints endpoint
- Notifications endpoint

#### Output

The script provides:

- Query execution times
- Success/failure status
- Average and maximum query times
- Performance assessment (EXCELLENT/GOOD/NEEDS IMPROVEMENT)
- Recommendations for optimization

#### Example Output

```
================================================================================
Database Query Performance
================================================================================

  ✓ Fetch complaints list (paginated)
    Duration: 245ms
    Records: 20

  ✓ Fetch single complaint with relations
    Duration: 380ms

  ✓ Full-text search query
    Duration: 156ms
    Records: 15

Query Statistics:
  Average query time: 260.33ms
  Slowest query: 380ms
  Successful queries: 5/5

================================================================================
Performance Report Summary
================================================================================

Database Performance:
  Success rate: 5/5 (100.0%)
  Average query time: 260.33ms
  Status: EXCELLENT

API Performance:
  Success rate: 3/3 (100.0%)
  Average response time: 145.67ms
  Status: EXCELLENT

Overall Assessment:
  ✓ All performance metrics are within acceptable ranges
```

## Prerequisites

### Test Users

The performance tests require test users to exist in your database:

**Student Account:**

- Email: `student@test.com`
- Password: `Test123!@#`
- Role: `student`

**Lecturer Account:**

- Email: `lecturer@test.com`
- Password: `Test123!@#`
- Role: `lecturer`

### Creating Test Users

You can create test users using the Supabase dashboard or by running:

```sql
-- Insert test users (run in Supabase SQL Editor)
-- Note: You'll need to create these through Supabase Auth first,
-- then update the user metadata

-- After creating users through Supabase Auth, update their roles:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE email = 'student@test.com';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"lecturer"'
)
WHERE email = 'lecturer@test.com';
```

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Start server
        run: npm start &
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Wait for server
        run: npx wait-on http://localhost:3000

      - name: Run performance tests
        run: node scripts/test-page-load-times.js
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Run metrics tests
        run: node scripts/test-performance-metrics.js
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Performance Optimization Tips

If tests reveal performance issues, consider these optimizations:

### 1. Database Optimization

- **Add indexes** on frequently queried columns
- **Use composite indexes** for common query patterns
- **Optimize complex queries** with EXPLAIN ANALYZE
- **Implement query result caching** with React Query

### 2. Frontend Optimization

- **Code splitting**: Use dynamic imports for large components
- **Image optimization**: Use Next.js Image component
- **Bundle analysis**: Run `npm run build:analyze`
- **Lazy loading**: Load components on demand
- **Virtual scrolling**: For large lists

### 3. API Optimization

- **Reduce payload size**: Select only needed fields
- **Implement pagination**: Limit result sets
- **Use CDN**: For static assets
- **Enable compression**: Gzip/Brotli

### 4. Caching Strategy

- **React Query**: Cache API responses
- **Service Worker**: Cache static assets
- **Browser caching**: Set appropriate cache headers
- **Memoization**: Use React.memo for expensive components

## Monitoring in Production

### Recommended Tools

1. **Vercel Analytics**: Built-in performance monitoring
2. **Sentry**: Error tracking and performance monitoring
3. **Google Lighthouse**: Regular audits
4. **WebPageTest**: Detailed performance analysis

### Key Metrics to Monitor

- **Time to First Byte (TTFB)**: < 600ms
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

## Troubleshooting

### Common Issues

**Issue: Tests fail with "Cannot connect to server"**

- Solution: Ensure `npm run dev` is running in another terminal

**Issue: Authentication fails**

- Solution: Verify test users exist with correct credentials

**Issue: All pages show slow load times**

- Solution: Check network connection, database performance, or server resources

**Issue: Specific pages are slow**

- Solution: Use browser DevTools to identify bottlenecks (Network, Performance tabs)

### Debug Mode

For more detailed output, you can modify the scripts to include additional logging:

```javascript
// Add to test scripts for debugging
console.log('Request headers:', headers);
console.log('Response status:', response.status);
console.log('Response time:', loadTime);
```

## Best Practices

1. **Run tests regularly**: Include in CI/CD pipeline
2. **Test on production-like environment**: Use staging server
3. **Test with realistic data**: Populate database with sample data
4. **Monitor trends**: Track performance over time
5. **Set up alerts**: Get notified when performance degrades
6. **Test different scenarios**: Various user roles, data volumes
7. **Document baselines**: Record acceptable performance ranges

## Additional Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Supabase Performance Tips](https://supabase.com/docs/guides/platform/performance)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)

## Support

If you encounter issues with performance testing:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [performance optimization tips](#performance-optimization-tips)
3. Consult the development team
4. File an issue with test results and environment details
