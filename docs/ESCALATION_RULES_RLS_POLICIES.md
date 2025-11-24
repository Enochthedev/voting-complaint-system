# Escalation Rules RLS Policies

## Overview
This document describes the Row Level Security (RLS) policies implemented for the `escalation_rules` table in the Student Complaint Resolution System.

## Table Purpose
The `escalation_rules` table stores auto-escalation rules for unaddressed complaints. These rules define when and to whom complaints should be automatically escalated based on category, priority, and time thresholds.

## RLS Policies

### 1. SELECT Policy: "Lecturers view escalation rules"
**Who can access:** Lecturers and Admins

**Purpose:** Allows lecturers and admins to view all escalation rules to understand the escalation workflow.

**Implementation:**
```sql
CREATE POLICY "Lecturers view escalation rules"
  ON public.escalation_rules
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' IN ('lecturer', 'admin')
  );
```

**Rationale:** Lecturers need to see escalation rules to understand when complaints will be escalated, but they don't need to modify them.

### 2. INSERT Policy: "Admins create escalation rules"
**Who can access:** Admins only

**Purpose:** Only admins can create new escalation rules.

**Implementation:**
```sql
CREATE POLICY "Admins create escalation rules"
  ON public.escalation_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt()->>'role' = 'admin'
  );
```

**Rationale:** Creating escalation rules is a system configuration task that should be restricted to administrators.

### 3. UPDATE Policy: "Admins update escalation rules"
**Who can access:** Admins only

**Purpose:** Only admins can modify existing escalation rules.

**Implementation:**
```sql
CREATE POLICY "Admins update escalation rules"
  ON public.escalation_rules
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'admin'
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'admin'
  );
```

**Rationale:** Modifying escalation rules affects system behavior and should be restricted to administrators.

### 4. DELETE Policy: "Admins delete escalation rules"
**Who can access:** Admins only

**Purpose:** Only admins can delete escalation rules.

**Implementation:**
```sql
CREATE POLICY "Admins delete escalation rules"
  ON public.escalation_rules
  FOR DELETE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'admin'
  );
```

**Rationale:** Deleting escalation rules is a system configuration task that should be restricted to administrators.

## Access Matrix

| Role     | SELECT | INSERT | UPDATE | DELETE |
|----------|--------|--------|--------|--------|
| Student  | ❌     | ❌     | ❌     | ❌     |
| Lecturer | ✅     | ❌     | ❌     | ❌     |
| Admin    | ✅     | ✅     | ✅     | ✅     |

## Security Considerations

### JWT Claims vs Database Queries
The RLS policies use `auth.jwt()->>'role'` to check user roles instead of querying the `users` table. This approach:
- **Prevents infinite recursion:** Avoids circular dependencies when RLS policies on the users table need to check roles
- **Improves performance:** JWT claims are already available without additional database queries
- **Maintains consistency:** Follows the same pattern used in other tables (announcements, feedback, etc.)

### Role Assignment
User roles are assigned during registration and stored in:
1. The `users` table (`role` column)
2. The JWT token (`role` claim in `raw_user_meta_data`)

The JWT claim is automatically populated by the database trigger when a user is created.

## Testing

### Manual Testing
Use the provided test script to verify RLS policies:
```bash
node scripts/test-escalation-rules-rls.js
```

### Test Coverage
The test script verifies:
1. ✅ Admins can create escalation rules
2. ✅ Lecturers can read escalation rules
3. ✅ Lecturers cannot create escalation rules
4. ✅ Students cannot access escalation rules
5. ✅ Admins can update escalation rules
6. ✅ Admins can delete escalation rules

### SQL Verification
Use the verification script to check table structure and policies:
```bash
psql -f supabase/verify-escalation-rules-table.sql
```

## Migration Files

### Initial Creation
- **File:** `009_create_escalation_rules_table.sql`
- **Purpose:** Creates the table with initial RLS policies

### RLS Policy Fix
- **File:** `028_fix_escalation_rules_rls.sql`
- **Purpose:** Updates RLS policies to use JWT claims instead of database queries
- **Changes:**
  - Replaces `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = ...)` 
  - With `auth.jwt()->>'role' IN (...)`

## Related Requirements

### Design Document Properties
- **P7: Role-Based Access** - Students can only view their own complaints; lecturers can view all complaints
- **P16: Escalation Timing** - Complaints are auto-escalated only after threshold time has passed

### Acceptance Criteria
- **AC21: Auto-Escalation System**
  - Configurable rules for automatic escalation
  - Escalation triggers notifications to higher authority
  - Lecturers can configure escalation rules per category

## Usage Examples

### Admin: Create Escalation Rule
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

### Lecturer: View Escalation Rules
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .select('*')
  .eq('is_active', true);
```

### Admin: Update Escalation Rule
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .update({ hours_threshold: 72 })
  .eq('id', ruleId);
```

### Admin: Delete Escalation Rule
```javascript
const { data, error } = await supabase
  .from('escalation_rules')
  .delete()
  .eq('id', ruleId);
```

## Troubleshooting

### Common Issues

#### 1. "new row violates row-level security policy"
**Cause:** User doesn't have the required role (admin) to perform the operation.
**Solution:** Verify the user's role in the JWT token and users table.

#### 2. Empty result set for lecturers
**Cause:** JWT role claim not properly set during user creation.
**Solution:** Check that the `add_role_to_jwt_claims` function is working correctly.

#### 3. Infinite recursion errors
**Cause:** RLS policies querying the users table instead of using JWT claims.
**Solution:** Apply migration `028_fix_escalation_rules_rls.sql` to use JWT claims.

## Maintenance

### Adding New Roles
If new roles are added to the system:
1. Update the RLS policies to include the new role where appropriate
2. Update the access matrix in this document
3. Update test scripts to cover the new role

### Modifying Access Rules
To modify who can access escalation rules:
1. Create a new migration file
2. Drop existing policies with `DROP POLICY IF EXISTS`
3. Create new policies with updated logic
4. Update this documentation
5. Update test scripts

## References
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Design Document: `.kiro/specs/student-complaint-system/design.md`
- Requirements Document: `.kiro/specs/student-complaint-system/requirements.md`
