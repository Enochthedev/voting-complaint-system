# Performance Testing Quick Reference

## Quick Start

```bash
# 1. Start the development server
npm run dev

# 2. In another terminal, run performance tests
npm run test:performance

# 3. Run comprehensive metrics
npm run test:metrics

# 4. Run all performance tests
npm run test:perf:all
```

## Test Scripts

| Script              | Command                    | Purpose                            |
| ------------------- | -------------------------- | ---------------------------------- |
| Page Load Times     | `npm run test:performance` | Tests all pages meet 2s threshold  |
| Performance Metrics | `npm run test:metrics`     | Database, API, and bundle analysis |
| All Tests           | `npm run test:perf:all`    | Runs both test suites              |

## Custom Parameters

```bash
# Test with custom URL
node scripts/test-page-load-times.js --url=http://localhost:3000

# Test with custom threshold (3 seconds)
node scripts/test-page-load-times.js --threshold=3000

# Combine parameters
node scripts/test-page-load-times.js --url=http://localhost:3000 --threshold=2000
```

## Test Requirements

### Required Test Users

Create these users in Supabase Auth:

| Role     | Email               | Password     |
| -------- | ------------------- | ------------ |
| Student  | `student@test.com`  | `Test123!@#` |
| Lecturer | `lecturer@test.com` | `Test123!@#` |

### Environment Variables

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Understanding Results

### Page Load Times

```
✓ PASS Login Page
  Average: 450ms    ← Must be < 2000ms
  Min: 420ms
  Max: 480ms
```

**Status Indicators:**

- 🟢 Green (< 2000ms): PASS
- 🟡 Yellow (2000-3000ms): WARNING
- 🔴 Red (> 3000ms): FAIL

### Database Performance

```
Query Statistics:
  Average query time: 260ms
  Slowest query: 380ms
```

**Performance Levels:**

- **EXCELLENT**: < 500ms average
- **GOOD**: 500-1000ms average
- **NEEDS IMPROVEMENT**: > 1000ms average

## Common Issues & Solutions

| Issue                      | Solution                            |
| -------------------------- | ----------------------------------- |
| "Cannot connect to server" | Run `npm run dev` first             |
| "Authentication failed"    | Create test users in Supabase       |
| All pages slow             | Check network/database connection   |
| Specific page slow         | Use DevTools to identify bottleneck |

## Performance Thresholds

### NFR1 Requirements

| Metric                  | Threshold   | Status              |
| ----------------------- | ----------- | ------------------- |
| Page Load Time          | < 2 seconds | ✓ Tested            |
| Real-time Notifications | < 1 second  | ⚠️ Manual test      |
| Concurrent Users        | 1000+       | ⚠️ Load test needed |

### Additional Metrics

| Metric | Target  | Tool       |
| ------ | ------- | ---------- |
| TTFB   | < 600ms | Lighthouse |
| FCP    | < 1.8s  | Lighthouse |
| LCP    | < 2.5s  | Lighthouse |
| TTI    | < 3.8s  | Lighthouse |
| CLS    | < 0.1   | Lighthouse |

## Quick Optimization Checklist

### If Tests Fail

- [ ] Check database indexes
- [ ] Review slow queries with EXPLAIN ANALYZE
- [ ] Enable React Query caching
- [ ] Implement code splitting
- [ ] Optimize images with Next.js Image
- [ ] Enable lazy loading for heavy components
- [ ] Review bundle size with `npm run build:analyze`
- [ ] Check network latency
- [ ] Verify server resources

### Before Deployment

- [ ] Run all performance tests
- [ ] Check bundle sizes
- [ ] Test on production-like environment
- [ ] Verify all pages < 2s load time
- [ ] Test with realistic data volume
- [ ] Review Lighthouse scores
- [ ] Set up monitoring (Vercel Analytics, Sentry)

## CI/CD Integration

Add to `.github/workflows/performance.yml`:

```yaml
- name: Run performance tests
  run: npm run test:perf:all
```

## Monitoring in Production

### Recommended Setup

1. **Vercel Analytics**: Automatic with Vercel deployment
2. **Sentry Performance**: Add to `_app.tsx`
3. **Google Lighthouse**: Weekly audits
4. **Custom Alerts**: Set up for > 2s load times

### Key Metrics Dashboard

Monitor these in production:

- Average page load time
- 95th percentile load time
- Error rate
- Database query times
- API response times

## Resources

- 📖 [Full Testing Guide](./PERFORMANCE_TESTING_GUIDE.md)
- 🔧 [Optimization Tips](./PERFORMANCE_TESTING_GUIDE.md#performance-optimization-tips)
- 🐛 [Troubleshooting](./PERFORMANCE_TESTING_GUIDE.md#troubleshooting)
- 📊 [Monitoring Setup](./PERFORMANCE_TESTING_GUIDE.md#monitoring-in-production)

## Support

For issues or questions:

1. Check the [full guide](./PERFORMANCE_TESTING_GUIDE.md)
2. Review test output for specific errors
3. Consult development team
4. File issue with test results
