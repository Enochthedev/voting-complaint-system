# Complaint Templates RLS Policies Reference

## Overview
This document provides a comprehensive reference for the Row Level Security (RLS) policies implemented on the `complaint_templates` table.

## Table Purpose
The `complaint_templates` table stores pre-defined templates for common complaint types to speed up complaint submission. Templates include suggested fields, categories, and priorities.

## Security Model

### Design Principles
1. **Student Access**: Students can only view active templates to avoid confusion
2. **Lecturer Ownership**: Lecturers own and manage templates they create
3. **Admin Override**: Admins have full control over all templates
4. **Template Lifecycle**: Templates can be deactivated rather than deleted to preserve history

## RLS Policies

### 1. SELECT Policies

#### Policy: "All users view active templates"
```sql
CREATE POLICY "All users view active templates"
  ON public.complaint_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);
```

**Purpose**: Allow all authenticated users to view active templates

**Who**: All authenticated users (students, lecturers, admins)

**What**: Can view templates where `is_active = true`

**Use Case**: Students browsing available templates when creating complaints

---

#### Policy: "Lecturers view all templates"
```sql
CREATE POLICY "Lecturers view all templates"
  ON public.complaint_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

**Purpose**: Allow lecturers and admins to view all templates (including inactive)

**Who**: Lecturers and admins only

**What**: Can view all templates regardless of `is_active` status

**Use Case**: Template management, reviewing inactive templates, template editing

---

### 2. INSERT Policy

#### Policy: "Lecturers create templates"
```sql
CREATE POLICY "Lecturers create templates"
  ON public.complaint_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

**Purpose**: Only lecturers and admins can create templates

**Who**: Lecturers and admins only

**What**: Can insert new templates with `created_by` set to their user ID

**Validation**: 
- User must be lecturer or admin
- `created_by` must match authenticated user ID

**Use Case**: Creating new complaint templates for students to use

---

### 3. UPDATE Policies

#### Policy: "Lecturers update own templates"
```sql
CREATE POLICY "Lecturers update own templates"
  ON public.complaint_templates
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

**Purpose**: Lecturers can update templates they created

**Who**: Lecturers and admins (for their own templates)

**What**: Can update templates where `created_by` matches their user ID

**Validation**:
- User must be lecturer or admin
- Template must be owned by the user (`created_by = auth.uid()`)
- Cannot change ownership

**Use Case**: Editing template content, activating/deactivating templates

---

#### Policy: "Admins update all templates"
```sql
CREATE POLICY "Admins update all templates"
  ON public.complaint_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

**Purpose**: Admins can update any template regardless of creator

**Who**: Admins only

**What**: Can update any template in the system

**Use Case**: Administrative corrections, template standardization, fixing issues

---

### 4. DELETE Policies

#### Policy: "Lecturers delete own templates"
```sql
CREATE POLICY "Lecturers delete own templates"
  ON public.complaint_templates
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('lecturer', 'admin')
    )
  );
```

**Purpose**: Lecturers can delete templates they created

**Who**: Lecturers and admins (for their own templates)

**What**: Can delete templates where `created_by` matches their user ID

**Use Case**: Removing obsolete or incorrect templates

**Note**: Consider deactivating instead of deleting to preserve history

---

#### Policy: "Admins delete all templates"
```sql
CREATE POLICY "Admins delete all templates"
  ON public.complaint_templates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```

**Purpose**: Admins can delete any template

**Who**: Admins only

**What**: Can delete any template in the system

**Use Case**: System cleanup, removing inappropriate templates

---

## Access Control Matrix

| Operation | Student | Lecturer (Own) | Lecturer (Others) | Admin |
|-----------|---------|----------------|-------------------|-------|
| View Active Templates | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| View Inactive Templates | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Create Templates | ❌ No | ✅ Yes | N/A | ✅ Yes |
| Update Own Templates | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| Update Others Templates | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Delete Own Templates | ❌ No | ✅ Yes | ❌ No | ✅ Yes |
| Delete Others Templates | ❌ No | ❌ No | ❌ No | ✅ Yes |

## Common Queries

### Student: Browse Active Templates
```javascript
const { data, error } = await supabase
  .from('complaint_templates')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

### Lecturer: View All Templates
```javascript
const { data, error } = await supabase
  .from('complaint_templates')
  .select('*')
  .order('created_at', { ascending: false });
```

### Lecturer: Create Template
```javascript
const { data, error } = await supabase
  .from('complaint_templates')
  .insert({
    title: 'Course Content Issue',
    description: 'Template for reporting course content problems',
    category: 'course_content',
    suggested_priority: 'medium',
    fields: {
      course_code: { type: 'text', required: true },
      module: { type: 'text', required: true },
      issue_type: { type: 'select', options: ['outdated', 'incorrect', 'missing'] }
    },
    created_by: userId,
    is_active: true
  });
```

### Lecturer: Update Own Template
```javascript
const { data, error } = await supabase
  .from('complaint_templates')
  .update({ 
    title: 'Updated Title',
    is_active: false 
  })
  .eq('id', templateId)
  .eq('created_by', userId); // Ensures ownership
```

### Admin: Update Any Template
```javascript
const { data, error } = await supabase
  .from('complaint_templates')
  .update({ is_active: false })
  .eq('id', templateId);
```

## Testing

### Run Verification
```bash
node scripts/verify-complaint-templates-policies.js
```

### Run Comprehensive Tests
```bash
node scripts/test-complaint-templates-rls.js
```

### Manual Testing in Supabase SQL Editor
```sql
-- Run the verification queries
\i supabase/verify-complaint-templates-table.sql
```

## Best Practices

### For Lecturers
1. **Deactivate Instead of Delete**: Set `is_active = false` rather than deleting templates to preserve history
2. **Clear Descriptions**: Provide detailed descriptions to help students understand when to use each template
3. **Structured Fields**: Use the `fields` JSONB column to define template structure
4. **Appropriate Categories**: Choose the correct category to help with filtering

### For Admins
1. **Review Templates**: Periodically review templates for quality and relevance
2. **Standardization**: Ensure consistent naming and structure across templates
3. **Cleanup**: Remove truly obsolete templates that are no longer needed
4. **Ownership**: Be cautious when modifying templates created by others

### For Developers
1. **Always Check Ownership**: When implementing update/delete features, verify ownership in the UI
2. **Filter by Active**: For student-facing features, always filter `is_active = true`
3. **Handle Errors**: Properly handle RLS policy violations with user-friendly messages
4. **Audit Trail**: Consider logging template changes for accountability

## Related Documentation
- [Database Setup](./DATABASE_SETUP.md)
- [RLS Quick Reference](./RLS_QUICK_REFERENCE.md)
- [Task Completion Summary](./TASK_2.2_COMPLAINT_TEMPLATES_RLS_COMPLETION.md)

## Migration File
The RLS policies are defined in:
```
supabase/migrations/008_create_complaint_templates_table.sql
```

## Troubleshooting

### Issue: Student Cannot See Any Templates
**Cause**: No active templates exist
**Solution**: Create templates and ensure `is_active = true`

### Issue: Lecturer Cannot Update Template
**Cause**: Template was created by another user
**Solution**: Only admins can update templates created by others

### Issue: Policy Violation Error
**Cause**: User role doesn't have permission for the operation
**Solution**: Check user role and ensure they have appropriate permissions

### Issue: Template Not Visible After Creation
**Cause**: Template created with `is_active = false`
**Solution**: Update template to set `is_active = true`

## Security Considerations

1. **Role Verification**: All policies verify user role through the `users` table
2. **Ownership Enforcement**: Lecturers can only modify their own templates
3. **Admin Override**: Admins have full control for system management
4. **No Anonymous Access**: All operations require authentication
5. **Cascade Deletion**: Templates are deleted when creator is deleted (`ON DELETE CASCADE`)

## Future Enhancements
- Template versioning to track changes over time
- Template usage statistics to identify popular templates
- Template sharing between lecturers
- Template approval workflow for quality control
- Template categories and tags for better organization
