# Quick Guide: Apply Complaint Triggers

## ⚡ Fastest Method (2 minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://tnenutksxxdhamlyogto.supabase.co/project/_/sql

### Step 2: Copy Migration SQL
Open file: `supabase/migrations/017_create_complaint_triggers.sql`
Copy all contents (Cmd+A, Cmd+C)

### Step 3: Execute
1. Paste into SQL Editor (Cmd+V)
2. Click "Run" button
3. Wait for "Success. No rows returned" message

### Step 4: Verify (Optional)
Run test script:
```bash
cd student-complaint-system
node scripts/test-complaint-triggers.js
```

## ✅ Done!

Your complaints table now has:
- ✅ Automatic history logging
- ✅ Automatic notifications
- ✅ Assignment tracking
- ✅ Status change monitoring

## 📋 What the Triggers Do

| Trigger | Purpose |
|---------|---------|
| `complaint_status_change_trigger` | Logs every status change to history |
| `notify_on_complaint_status_change` | Notifies students of status updates |
| `notify_on_new_complaint` | Notifies lecturers of new complaints |
| `log_complaint_creation_trigger` | Logs complaint creation |
| `log_complaint_assignment_trigger` | Logs assignment changes |

## 🔍 Troubleshooting

**Error: "already exists"**
- Triggers may already be applied
- Run verification: `supabase/verify-complaint-triggers.sql`

**Need more help?**
- See: `supabase/APPLY_TRIGGERS_MIGRATION.md`
- Or: `supabase/TASK_1.4.3_COMPLETION_SUMMARY.md`
