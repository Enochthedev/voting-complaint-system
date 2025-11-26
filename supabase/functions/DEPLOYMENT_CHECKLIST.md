# Edge Functions Deployment Checklist

## Pre-Deployment

### 1. Prerequisites
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Supabase project linked (`supabase link --project-ref YOUR_REF`)
- [ ] Service role key available
- [ ] Project URL known

### 2. Environment Setup
- [ ] `.env.local` file configured with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Ready
- [ ] All required tables exist:
  - `complaints`
  - `escalation_rules`
  - `notifications`
  - `complaint_history`
  - `users`
- [ ] Indexes are in place
- [ ] RLS policies configured

## Deployment Steps

### Deploy Edge Function

```bash
# 1. Navigate to project root
cd /path/to/your/project

# 2. Deploy the function
supabase functions deploy auto-escalate-complaints

# 3. Verify deployment
supabase functions list
```

Expected output:
```
┌──────────────────────────┬─────────┬────────────────────┐
│ NAME                     │ VERSION │ CREATED AT         │
├──────────────────────────┼─────────┼────────────────────┤
│ auto-escalate-complaints │ 1       │ 2024-01-01 12:00   │
└──────────────────────────┴─────────┴────────────────────┘
```

### Test Deployment

```bash
# Test the deployed function
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-escalate-complaints
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully processed X rule(s) and escalated Y complaint(s)",
  "results": [...]
}
```

## Post-Deployment

### 1. Set Up Scheduling

Choose one of the following options:

#### Option A: GitHub Actions

1. Create `.github/workflows/auto-escalate.yml`:

```yaml
name: Auto-Escalate Complaints

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  escalate:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            https://${{ secrets.SUPABASE_PROJECT_REF }}.supabase.co/functions/v1/auto-escalate-complaints
```

2. Add GitHub Secrets:
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_PROJECT_REF`

3. Test workflow:
   - Go to Actions tab
   - Select "Auto-Escalate Complaints"
   - Click "Run workflow"

#### Option B: Supabase Cron (If Available)

```bash
supabase functions schedule auto-escalate-complaints --cron "0 * * * *"
```

#### Option C: External Cron Service

Use services like:
- Vercel Cron Jobs
- AWS EventBridge
- Google Cloud Scheduler
- Cron-job.org

Configure to call:
```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-escalate-complaints
Authorization: Bearer YOUR_SERVICE_ROLE_KEY
```

### 2. Create Escalation Rules

Create at least one active escalation rule:

```sql
-- Example: Escalate high priority academic complaints after 24 hours
INSERT INTO escalation_rules (category, priority, hours_threshold, escalate_to, is_active)
VALUES (
  'academic',
  'high',
  24,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true
);
```

### 3. Verify Setup

Run the automated test:

```bash
node scripts/test-auto-escalation.js
```

Expected output:
```
🧪 Testing Auto-Escalation Edge Function

1️⃣ Finding admin user...
✅ Found admin: Admin Name (uuid)

2️⃣ Finding student user...
✅ Found student: Student Name (uuid)

3️⃣ Creating test escalation rule...
✅ Created escalation rule: uuid

4️⃣ Creating test complaint (3 hours old)...
✅ Created test complaint: uuid

5️⃣ Invoking auto-escalation edge function...
✅ Edge function executed successfully

6️⃣ Verifying complaint escalation...
✅ Complaint was successfully escalated!

7️⃣ Checking notification...
✅ Notification created

8️⃣ Checking complaint history...
✅ History entry created

🧹 Cleaning up test data...
✅ Deleted test complaint and related records
✅ Deleted test escalation rule

✨ Test complete!
```

### 4. Monitor Function

```bash
# View recent logs
supabase functions logs auto-escalate-complaints

# Follow logs in real-time
supabase functions logs auto-escalate-complaints --follow
```

### 5. Set Up Monitoring Queries

Save these queries for regular monitoring:

**Check Recent Escalations:**
```sql
SELECT 
  c.id,
  c.title,
  c.escalated_at,
  c.escalation_level,
  u.full_name as assigned_to
FROM complaints c
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.escalated_at > NOW() - INTERVAL '7 days'
ORDER BY c.escalated_at DESC;
```

**Check Active Rules:**
```sql
SELECT 
  er.*,
  u.full_name as escalate_to_name
FROM escalation_rules er
JOIN users u ON er.escalate_to = u.id
WHERE er.is_active = true;
```

**Check Eligible Complaints:**
```sql
SELECT 
  c.id,
  c.title,
  c.category,
  c.priority,
  c.created_at,
  EXTRACT(EPOCH FROM (NOW() - c.created_at))/3600 as hours_old
FROM complaints c
WHERE c.status IN ('new', 'opened')
  AND c.escalated_at IS NULL
ORDER BY c.created_at;
```

## Troubleshooting

### Function Not Found

**Issue**: `curl` returns 404

**Solution**:
1. Verify deployment: `supabase functions list`
2. Check project URL is correct
3. Redeploy: `supabase functions deploy auto-escalate-complaints`

### Permission Errors

**Issue**: Function returns 403 or permission errors

**Solution**:
1. Verify service role key is correct
2. Check RLS policies on tables
3. Ensure service role key has admin access

### No Complaints Escalated

**Issue**: Function runs but doesn't escalate anything

**Solution**:
1. Check active rules exist:
   ```sql
   SELECT * FROM escalation_rules WHERE is_active = true;
   ```
2. Check eligible complaints exist:
   ```sql
   SELECT * FROM complaints
   WHERE status IN ('new', 'opened')
     AND escalated_at IS NULL
     AND created_at < NOW() - INTERVAL '24 hours';
   ```
3. Review function logs for errors

### Cron Job Not Running

**Issue**: Function doesn't run automatically

**Solution**:
1. Verify cron configuration
2. Check GitHub Actions workflow status
3. Review external cron service logs
4. Test manual invocation works

## Rollback Procedure

If you need to rollback:

1. **Disable all escalation rules**:
   ```sql
   UPDATE escalation_rules SET is_active = false;
   ```

2. **Stop cron job**:
   - Disable GitHub Actions workflow
   - Or disable external cron service

3. **Redeploy previous version** (if needed):
   ```bash
   git checkout previous-commit
   supabase functions deploy auto-escalate-complaints
   ```

## Success Criteria

- [ ] Function deploys without errors
- [ ] Manual invocation returns success response
- [ ] Test script passes all checks
- [ ] Cron job is configured and running
- [ ] At least one active escalation rule exists
- [ ] Function logs show successful executions
- [ ] Escalated complaints appear in database
- [ ] Notifications are created for escalations
- [ ] History entries are logged

## Maintenance

### Weekly Tasks
- [ ] Review escalation logs
- [ ] Check for failed escalations
- [ ] Verify cron job is running

### Monthly Tasks
- [ ] Review escalation rules effectiveness
- [ ] Adjust thresholds based on metrics
- [ ] Check function performance
- [ ] Review and archive old logs

### Quarterly Tasks
- [ ] Analyze escalation patterns
- [ ] Update documentation
- [ ] Review security settings
- [ ] Optimize database queries

## Support

For issues or questions:
1. Check function logs: `supabase functions logs auto-escalate-complaints`
2. Review documentation: `docs/AUTO_ESCALATION_SYSTEM.md`
3. Run test script: `node scripts/test-auto-escalation.js`
4. Check database state with monitoring queries

## Additional Resources

- [Edge Function README](./auto-escalate-complaints/README.md)
- [System Documentation](../docs/AUTO_ESCALATION_SYSTEM.md)
- [Task Completion Guide](../docs/TASK_10.2_AUTO_ESCALATION_EDGE_FUNCTION.md)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
