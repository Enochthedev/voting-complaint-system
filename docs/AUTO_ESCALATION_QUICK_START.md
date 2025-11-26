# Auto-Escalation Quick Start Guide

## 🚀 5-Minute Setup

### 1. Deploy the Edge Function

```bash
# Deploy
supabase functions deploy auto-escalate-complaints

# Verify
supabase functions list
```

### 2. Create an Escalation Rule

```sql
INSERT INTO escalation_rules (
  category, priority, hours_threshold, escalate_to, is_active
) VALUES (
  'academic',
  'high',
  24,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  true
);
```

### 3. Set Up Cron Job

**GitHub Actions** (`.github/workflows/auto-escalate.yml`):
```yaml
name: Auto-Escalate
on:
  schedule:
    - cron: '0 * * * *'
jobs:
  escalate:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            https://YOUR_PROJECT.supabase.co/functions/v1/auto-escalate-complaints
```

### 4. Test It

```bash
node scripts/test-auto-escalation.js
```

## 📊 Quick Monitoring

### Check Recent Escalations
```sql
SELECT id, title, escalated_at, escalation_level
FROM complaints
WHERE escalated_at > NOW() - INTERVAL '24 hours';
```

### View Function Logs
```bash
supabase functions logs auto-escalate-complaints --follow
```

### Check Active Rules
```sql
SELECT * FROM escalation_rules WHERE is_active = true;
```

## 🔧 Common Commands

### Deploy
```bash
supabase functions deploy auto-escalate-complaints
```

### Test Locally
```bash
supabase functions serve auto-escalate-complaints
curl -X POST http://localhost:54321/functions/v1/auto-escalate-complaints
```

### View Logs
```bash
supabase functions logs auto-escalate-complaints
```

### Manual Invoke
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  https://YOUR_PROJECT.supabase.co/functions/v1/auto-escalate-complaints
```

## 📝 Recommended Rules

| Category | Priority | Threshold | Escalate To |
|----------|----------|-----------|-------------|
| Harassment | Critical | 2 hours | Admin |
| Academic | Critical | 2 hours | Admin |
| Harassment | High | 4 hours | Senior Lecturer |
| Academic | High | 24 hours | Department Head |
| Facilities | High | 48 hours | Facilities Manager |

## 🐛 Troubleshooting

### No Escalations Happening?

1. **Check active rules**:
   ```sql
   SELECT * FROM escalation_rules WHERE is_active = true;
   ```

2. **Check eligible complaints**:
   ```sql
   SELECT * FROM complaints
   WHERE status IN ('new', 'opened')
     AND escalated_at IS NULL
     AND created_at < NOW() - INTERVAL '24 hours';
   ```

3. **Check function logs**:
   ```bash
   supabase functions logs auto-escalate-complaints
   ```

### Function Not Found?

```bash
# Redeploy
supabase functions deploy auto-escalate-complaints

# Verify
supabase functions list
```

### Permission Errors?

Ensure your service role key is correct in the cron job configuration.

## 📚 Full Documentation

- [Complete System Guide](./AUTO_ESCALATION_SYSTEM.md)
- [Deployment Checklist](../supabase/functions/DEPLOYMENT_CHECKLIST.md)
- [Function README](../supabase/functions/auto-escalate-complaints/README.md)

## ✅ Success Checklist

- [ ] Function deployed
- [ ] At least one active rule created
- [ ] Cron job configured
- [ ] Test script passes
- [ ] Monitoring queries work
- [ ] Logs show successful runs

## 🎯 Quick Test

```bash
# 1. Create test complaint (backdated)
psql -c "INSERT INTO complaints (student_id, title, description, category, priority, status, created_at) 
VALUES ((SELECT id FROM users WHERE role='student' LIMIT 1), 'Test', 'Test', 'academic', 'high', 'new', NOW() - INTERVAL '25 hours');"

# 2. Run function
curl -X POST -H "Authorization: Bearer SERVICE_KEY" \
  https://PROJECT.supabase.co/functions/v1/auto-escalate-complaints

# 3. Check result
psql -c "SELECT id, title, escalated_at FROM complaints WHERE title='Test';"
```

That's it! Your auto-escalation system is ready to go. 🎉
