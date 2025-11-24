# Escalation Rules - Quick Reference

## 🚀 Quick Start

```bash
# Apply migration
node scripts/apply-escalation-rules-rls-fix.js

# Verify policies
node scripts/verify-escalation-rules-policies.js

# Run tests
node scripts/test-escalation-rules-rls.js
```

## 🔐 Access Control

| Role     | View | Create | Update | Delete |
|----------|------|--------|--------|--------|
| Student  | ❌   | ❌     | ❌     | ❌     |
| Lecturer | ✅   | ❌     | ❌     | ❌     |
| Admin    | ✅   | ✅     | ✅     | ✅     |

## 📝 RLS Policies

### SELECT (Lecturers & Admins)
```sql
auth.jwt()->>'role' IN ('lecturer', 'admin')
```

### INSERT (Admins Only)
```sql
auth.jwt()->>'role' = 'admin'
```

### UPDATE (Admins Only)
```sql
auth.jwt()->>'role' = 'admin'
```

### DELETE (Admins Only)
```sql
auth.jwt()->>'role' = 'admin'
```

## 💻 Code Examples

### Create Rule (Admin)
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .insert({
    category: 'academic',
    priority: 'high',
    hours_threshold: 48,
    escalate_to: adminUserId,
    is_active: true
  });
```

### View Rules (Lecturer/Admin)
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .select('*')
  .eq('is_active', true);
```

### Update Rule (Admin)
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .update({ hours_threshold: 72 })
  .eq('id', ruleId);
```

### Delete Rule (Admin)
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .delete()
  .eq('id', ruleId);
```

## 🔍 Troubleshooting

### Policy Violation Error
```
Error: new row violates row-level security policy
```
**Fix:** Verify user has admin role in JWT token

### Empty Results for Lecturers
```
Returns: []
```
**Fix:** Check JWT role claim is set correctly

### Migration Fails
```
Error: policy already exists
```
**Fix:** Migration handles this automatically with DROP IF EXISTS

## 📁 Key Files

- **Migration:** `supabase/migrations/028_fix_escalation_rules_rls.sql`
- **Apply Script:** `scripts/apply-escalation-rules-rls-fix.js`
- **Test Script:** `scripts/test-escalation-rules-rls.js`
- **Docs:** `docs/ESCALATION_RULES_RLS_POLICIES.md`

## ✅ Verification Checklist

- [ ] Migration applied successfully
- [ ] RLS enabled on table
- [ ] 4 policies exist (SELECT, INSERT, UPDATE, DELETE)
- [ ] Policies use JWT claims
- [ ] All 6 tests pass
- [ ] No infinite recursion errors

## 🎯 Requirements

- **AC21:** Auto-Escalation System ✅
- **P7:** Role-Based Access ✅
- **P16:** Escalation Timing ✅
- **NFR2:** Security ✅

## 📞 Support

For detailed information, see:
- `docs/ESCALATION_RULES_RLS_POLICIES.md`
- `supabase/APPLY_ESCALATION_RULES_RLS_FIX.md`
- `docs/TASK_2.2_ESCALATION_RULES_RLS_COMPLETION.md`
