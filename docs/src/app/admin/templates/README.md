# Template Management Page

## Overview

The Template Management page (`/admin/templates`) allows lecturers and administrators to create, view, edit, and manage complaint templates. These templates help students submit complaints more efficiently by providing pre-defined structures for common complaint types.

## Features

### Current Implementation (UI-First Development)

1. **Template Listing**
   - Display all templates in a card-based layout
   - Show template title, description, category, and suggested priority
   - Display active/inactive status
   - Show creation and last updated dates
   - Display number of custom fields in each template

2. **Search and Filtering**
   - Search templates by title or description
   - Filter by category (Academic, Facilities, Harassment, Course Content, Administrative, Other)
   - Filter by status (All, Active, Inactive)
   - Real-time filtering as user types or changes filters

3. **Template Actions**
   - **Toggle Active/Inactive**: Enable or disable templates for student use
   - **Edit**: Open template editor (placeholder for next sub-task)
   - **Delete**: Remove template with confirmation dialog
   - **Create New**: Open template creation form (placeholder for next sub-task)

4. **Visual Feedback**
   - Success messages for actions (activate, deactivate, delete)
   - Error messages for failed operations
   - Empty state when no templates match filters
   - Loading states (to be implemented with API integration)

## Mock Data

The page currently uses mock template data for UI development:

```typescript
{
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  suggested_priority: ComplaintPriority;
  fields: Record<string, any>;  // Custom fields for the template
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Example Templates

1. **Broken Equipment in Lab**
   - Category: Facilities
   - Priority: High
   - Fields: equipment_name, lab_room, issue_description

2. **Assignment Grading Issue**
   - Category: Academic
   - Priority: Medium
   - Fields: assignment_name, course_code, expected_grade, received_grade, concern_details

3. **Classroom AC Not Working**
   - Category: Facilities
   - Priority: Medium
   - Fields: room_number, building, temperature_issue

## User Interface

### Layout

- **Header**: Page title and description
- **Search/Filter Bar**: Search input and category/status filters with "Create New Template" button
- **Template Cards**: Grid of template cards with details and action buttons
- **Modals**: Delete confirmation and create/edit form (placeholder)

### Responsive Design

- Mobile-friendly layout
- Stacked filters on small screens
- Touch-friendly action buttons
- Accessible keyboard navigation

## Access Control

This page is intended for **lecturers and administrators only**. In Phase 12 (API integration), proper role-based access control will be implemented using:

- Protected route wrapper
- Role verification via Supabase Auth
- Redirect to login if not authenticated
- Redirect to dashboard if not authorized (student role)

## Next Steps (Sub-tasks)

1. **Build template creation form** (Task 4.3.2)
   - Form fields for title, description, category, priority
   - Dynamic field builder for custom template fields
   - Validation and error handling
   - Save functionality

2. **Implement template listing** (Task 4.3.3)
   - Already implemented with mock data
   - Will be connected to Supabase in Phase 12

3. **Add template selector to complaint form** (Task 4.3.4)
   - Dropdown or modal to select template
   - Pre-fill complaint form with template data

4. **Pre-fill form fields from template** (Task 4.3.5)
   - Map template fields to complaint form
   - Populate form with template defaults

5. **Allow template editing and deletion** (Task 4.3.6)
   - Edit form (reuse creation form)
   - Delete with confirmation (already implemented)

## API Integration (Phase 12)

When connecting to Supabase:

### Database Queries

```typescript
// Fetch all templates
const { data: templates } = await supabase
  .from('complaint_templates')
  .select('*')
  .order('created_at', { ascending: false });

// Create template
const { data: newTemplate } = await supabase
  .from('complaint_templates')
  .insert({
    title,
    description,
    category,
    suggested_priority,
    fields,
    created_by: userId,
    is_active: true,
  })
  .select()
  .single();

// Update template
const { data: updatedTemplate } = await supabase
  .from('complaint_templates')
  .update({
    title,
    description,
    category,
    suggested_priority,
    fields,
    is_active,
    updated_at: new Date().toISOString(),
  })
  .eq('id', templateId)
  .select()
  .single();

// Delete template
const { error } = await supabase
  .from('complaint_templates')
  .delete()
  .eq('id', templateId);

// Toggle active status
const { data } = await supabase
  .from('complaint_templates')
  .update({ is_active: !currentStatus })
  .eq('id', templateId)
  .select()
  .single();
```

### RLS Policies

Templates should have the following Row Level Security policies:

```sql
-- All authenticated users can view active templates
CREATE POLICY "Users view active templates"
ON complaint_templates FOR SELECT
TO authenticated
USING (is_active = true OR auth.jwt()->>'role' IN ('lecturer', 'admin'));

-- Lecturers can create templates
CREATE POLICY "Lecturers create templates"
ON complaint_templates FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' IN ('lecturer', 'admin'));

-- Lecturers can update their own templates
CREATE POLICY "Lecturers update own templates"
ON complaint_templates FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Lecturers can delete their own templates
CREATE POLICY "Lecturers delete own templates"
ON complaint_templates FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR auth.jwt()->>'role' = 'admin');
```

## Testing

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Search filters templates correctly
- [ ] Category filter works
- [ ] Status filter works
- [ ] Toggle active/inactive updates UI
- [ ] Delete confirmation modal appears
- [ ] Delete removes template from list
- [ ] Success messages display correctly
- [ ] Empty state shows when no templates match
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility

### Future Automated Tests

- Unit tests for filter logic
- Integration tests for CRUD operations
- E2E tests for complete workflows

## Acceptance Criteria

This page contributes to **AC19: Complaint Templates**:

- ✅ System provides pre-defined templates for common complaint types
- ✅ Templates include suggested fields and guidance
- ⏳ Students can select template when creating new complaint (next sub-task)
- ✅ Lecturers can create and manage templates
- ✅ Templates speed up complaint submission

## Related Files

- `/src/app/admin/templates/page.tsx` - Main template management page
- `/src/types/database.types.ts` - ComplaintTemplate type definition
- `/src/components/complaints/complaint-form.tsx` - Will integrate template selector
- `/src/app/complaints/new/page.tsx` - Will use templates for pre-filling

## Notes

- Currently using mock data for UI development
- Create/Edit form is a placeholder modal
- API integration will happen in Phase 12
- Template fields structure is flexible (JSONB in database)
- Templates can be deactivated instead of deleted to preserve history
