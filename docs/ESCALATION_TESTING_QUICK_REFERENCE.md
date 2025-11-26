# Auto-Escalation Testing - Quick Reference

## Quick Test Commands

### Run Comprehensive Test Suite
```bash
node scripts/test-escalation-scenarios.js
```

Tests all 7 escalation scenarios in one run.

### Run Debug Test
```bash
node scripts/test-escalation-debug.js
```

Quick single-scenario test for debugging.

### Run Manual Simulation
```bash
node scripts/test-escalation-manual.js
```

Step-by-step simulation of edge function logic.

### Run Original Test
```bash
node scripts/test-auto-escalation.js
```

Original basic escalation test.

## Test Scenarios Covered

| # | Scenario | What It Tests |
|---|----------|---------------|
| 1 | Basic Escalation | Single complaint with matching rule |
| 2 | Multiple Rules | Different rules working independently |
| 3 | Batch Escalation | Multiple complaints at once |
| 4 | Exclusion Cases | Complaints that should NOT escalate |
| 5 | No Active Rules | Graceful handling of no rules |
| 6 | Re-escalation | Multiple escalation levels |
| 7 | Status Filtering | Only 'new' and 'open' statuses |

## Expected Output

### Success
```
📊 Test Summary
==================================================
Total Tests: 7
Passed: 7 ✅
Failed: 0
Success Rate: 100.0%

🎉 All tests passed!
```

### Failure
```
📊 Test Summary
==================================================
Total Tests: 7
Passed: 6 ✅
Failed: 1 ❌
Success Rate: 85.7%

⚠️  Some tests failed. Please review the output above.
```

## Prerequisites

1. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Test Users**
   - At least one admin user
   - At least one lecturer user
   - At least one student user

3. **Database Access**
   - Supabase connection active
   - Proper permissions configured

## Troubleshooting

### Test Fails: "Missing required test users"
**Solution**: Create test users with admin, lecturer, and student roles.

### Test Fails: "Edge function call failed"
**Solution**: 
1. Check edge function is deployed: `npx supabase functions deploy auto-escalate-complaints`
2. Verify environment variables are set

### Test Fails: "Invalid enum value"
**Solution**: Check database enum values match the code:
```sql
-- Check priority enum
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'complaint_priority'::regtype;

-- Check status enum
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'complaint_status'::regtype;
```

### Tests Pass But Complaints Not Escalating in Production
**Solution**:
1. Check escalation rules are active: `SELECT * FROM escalation_rules WHERE is_active = true;`
2. Verify cron job is configured and running
3. Check edge function logs: `npx supabase functions logs auto-escalate-complaints`

## Manual Testing

### Create Test Data
```sql
-- Create escalation rule
INSERT INTO escalation_rules (category, priority, hours_threshold, escalate_to, is_active)
VALUES ('academic', 'high', 2, 'admin-user-id', true);

-- Create old complaint
INSERT INTO complaints (student_id, title, description, category, priority, status, created_at)
VALUES (
  'student-user-id',
  'Test Complaint',
  'Testing escalation',
  'academic',
  'high',
  'new',
  NOW() - INTERVAL '3 hours'
);
```

### Invoke Edge Function
```bash
curl -X POST "${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auto-escalate-complaints" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json"
```

### Verify Escalation
```sql
-- Check if complaint was escalated
SELECT 
  id,
  title,
  escalated_at,
  escalation_level,
  assigned_to
FROM complaints
WHERE title = 'Test Complaint';

-- Check history
SELECT * FROM complaint_history
WHERE action = 'escalated'
ORDER BY created_at DESC
LIMIT 5;

-- Check notifications
SELECT * FROM notifications
WHERE type = 'complaint_escalated'
ORDER BY created_at DESC
LIMIT 5;
```

## Cleanup Test Data

```sql
-- Delete test complaints
DELETE FROM complaints WHERE title LIKE '%Test%';

-- Delete test rules
DELETE FROM escalation_rules WHERE hours_threshold < 24;
```

## Important Notes

1. **Test Isolation**: The comprehensive test suite disables existing rules during testing and re-enables them after.

2. **Cleanup**: All test scripts clean up their test data automatically.

3. **Status Values**: Use `'open'` not `'opened'` - this was a bug that has been fixed.

4. **Priority Values**: Use `'urgent'` not `'critical'` - the database uses 'urgent'.

## Related Files

- `scripts/test-escalation-scenarios.js` - Comprehensive test suite
- `scripts/test-escalation-debug.js` - Debug test
- `scripts/test-escalation-manual.js` - Manual simulation
- `scripts/test-auto-escalation.js` - Original test
- `supabase/functions/auto-escalate-complaints/index.ts` - Edge function
- `docs/ESCALATION_TESTING_COMPLETE.md` - Full test report

---

**Last Updated**: November 26, 2025
**Status**: All tests passing ✅
