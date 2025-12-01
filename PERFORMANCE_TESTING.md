# Performance Testing

## Quick Start

```bash
# 1. Start the development server
npm run dev

# 2. In another terminal, run performance tests
npm run test:performance

# Or run all tests
npm run test:perf:all
```

## Available Tests

| Command                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `npm run test:performance` | Test page load times for all major pages               |
| `npm run test:metrics`     | Test database queries, API endpoints, and bundle sizes |
| `npm run test:perf:all`    | Run all performance tests                              |

## Requirements

### Test Users

Create these users in Supabase Auth:

- **Student**: `student@test.com` / `Test123!@#`
- **Lecturer**: `lecturer@test.com` / `Test123!@#`

### Environment Variables

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Performance Thresholds

| Metric           | Threshold   | Status    |
| ---------------- | ----------- | --------- |
| Page Load Time   | < 2 seconds | ✅ Tested |
| Database Queries | < 500ms avg | ✅ Tested |
| API Response     | < 200ms avg | ✅ Tested |

## Documentation

- 📖 **[Full Testing Guide](./docs/PERFORMANCE_TESTING_GUIDE.md)** - Comprehensive documentation
- 📋 **[Quick Reference](./docs/PERFORMANCE_TESTING_QUICK_REFERENCE.md)** - Quick commands and tips
- ✅ **[Implementation Details](./docs/TASK_12.1_PAGE_LOAD_TESTING_COMPLETE.md)** - Task completion summary

## Test Scripts

- `scripts/test-page-load-times.js` - Page load time testing
- `scripts/test-performance-metrics.js` - Comprehensive metrics

## Example Output

```
================================================================================
Page Load Time Test Results
================================================================================

Summary:
  Total pages tested: 11
  Passed: 10
  Failed: 1

  ✓ PASS Login Page
    Average: 450ms
    Threshold: 2000ms

  ✓ PASS Student Dashboard
    Average: 680ms
    Threshold: 2000ms
```

## Troubleshooting

| Issue                      | Solution                      |
| -------------------------- | ----------------------------- |
| "Cannot connect to server" | Run `npm run dev` first       |
| "Authentication failed"    | Create test users in Supabase |
| All pages slow             | Check network/database        |

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run performance tests
  run: npm run test:perf:all
```

## Next Steps

1. ✅ Run initial tests: `npm run test:perf:all`
2. ✅ Create test users in Supabase
3. ✅ Document baseline performance
4. ⏳ Set up CI/CD integration
5. ⏳ Configure production monitoring

---

For detailed information, see the [Full Testing Guide](./docs/PERFORMANCE_TESTING_GUIDE.md).
