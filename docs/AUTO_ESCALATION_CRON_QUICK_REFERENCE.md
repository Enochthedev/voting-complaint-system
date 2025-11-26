# Auto-Escalation Cron Job - Quick Reference

## Quick Setup

### Local Development
```bash
# 1. Start Supabase
supabase start

# 2. Apply migration
supabase db reset

# 3. Verify setup
node scripts/verify-auto-escalation-cron.js
```

### Production
```bash
# 1. Apply migration
supabase db push

# 2. Update secrets (in SQL Editor)
select vault.update_secret(
  (select id from vault.secrets where name = 'project_url'),
  'https://your-project-ref.supabase.co'
);

select vault.update_secret(
  (select id from vault.secrets where name = 'anon_key'),
  'your-actual-anon-key'
);

# 3. Verify setup
node scripts/verify-auto-escalation-cron.js
```

## Common Commands

### Check Job Status
```sql
select jobid, jobname, schedule, active
from cron.job
where jobname = 'auto-escalate-complaints-hourly';
```

### View Recent Runs
```sql
select runid, status, start_time, end_time
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly')
order by start_time desc
limit 5;
```

### Pause Job
```sql
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  active := false
);
```

### Resume Job
```sql
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  active := true
);
```

### Change Schedule
```sql
-- Every 30 minutes
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  schedule := '*/30 * * * *'
);

-- Every 2 hours
select cron.alter_job(
  job_id := (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly'),
  schedule := '0 */2 * * *'
);
```

## Manual Testing

### Trigger Edge Function Manually
```bash
# Local
supabase functions invoke auto-escalate-complaints

# Production
curl -X POST https://your-project-ref.supabase.co/functions/v1/auto-escalate-complaints \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"time": "2024-11-26T10:00:00Z"}'
```

### Create Test Data
```sql
-- Create test rule (1 hour threshold)
insert into escalation_rules (category, priority, hours_threshold, escalate_to, is_active)
values ('facilities', 'high', 1, 
  (select id from auth.users where email = 'lecturer@test.com'), true);

-- Create old complaint (should be escalated)
insert into complaints (title, description, category, priority, status, student_id, created_at)
values ('Test Complaint', 'Should escalate', 'facilities', 'high', 'new',
  (select id from auth.users where email = 'student@test.com'),
  now() - interval '2 hours');
```

## Monitoring

### Check HTTP Responses
```sql
select id, status_code, error_msg, created
from net._http_response
order by created desc
limit 5;
```

### View Escalations
```sql
select ch.complaint_id, c.title, ch.new_value, ch.created_at
from complaint_history ch
join complaints c on c.id = ch.complaint_id
where ch.action = 'escalated'
  and (ch.details->>'auto_escalated')::boolean = true
order by ch.created_at desc
limit 10;
```

### Check Active Rules
```sql
select id, category, priority, hours_threshold, is_active
from escalation_rules
where is_active = true;
```

## Troubleshooting

### Job Not Running?
```sql
-- Check if active
select active from cron.job where jobname = 'auto-escalate-complaints-hourly';

-- Check for errors
select status, return_message
from cron.job_run_details
where jobid = (select jobid from cron.job where jobname = 'auto-escalate-complaints-hourly')
order by start_time desc
limit 3;
```

### No Escalations?
```sql
-- Check for eligible complaints
select id, title, category, priority, status, created_at
from complaints
where status in ('new', 'opened')
  and escalated_at is null
  and created_at < now() - interval '24 hours';

-- Check active rules
select * from escalation_rules where is_active = true;
```

## Cron Schedule Examples

| Schedule | Description |
|----------|-------------|
| `0 * * * *` | Every hour at minute 0 |
| `*/30 * * * *` | Every 30 minutes |
| `0 */2 * * *` | Every 2 hours |
| `0 9 * * *` | Daily at 9:00 AM |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `0 0 1 * *` | First day of month at midnight |

## Files

- **Migration**: `supabase/migrations/20241126000000_setup_auto_escalation_cron.sql`
- **Documentation**: `docs/AUTO_ESCALATION_CRON_SETUP.md`
- **Verification**: `scripts/verify-auto-escalation-cron.js`
- **Edge Function**: `supabase/functions/auto-escalate-complaints/index.ts`

## Related Docs

- [Full Setup Guide](./AUTO_ESCALATION_CRON_SETUP.md)
- [Auto-Escalation System](./AUTO_ESCALATION_SYSTEM.md)
- [Task Completion Summary](./TASK_10.2_AUTO_ESCALATION_CRON_COMPLETE.md)
