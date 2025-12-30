# Template Selector Implementation Demo

## Overview

The template selector has been successfully added to the complaint form, allowing students to quickly fill out complaints using pre-defined templates.

## Features Implemented

### 1. Template Selector UI

- **Location**: Top of the complaint form (before anonymous toggle)
- **Visibility**: Only shown when creating new complaints (not when editing drafts)
- **Design**: Clean dropdown interface with template browsing

### 2. Template Selection Flow

#### Initial State

```
┌─────────────────────────────────────────────┐
│ Use a Template (Optional)                   │
│ Select a pre-defined template to help you   │
│ fill out your complaint faster.             │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ 📄 Browse Templates                   │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

#### Dropdown Open

```
┌─────────────────────────────────────────────┐
│ 📄 Browse Templates                          │
├─────────────────────────────────────────────┤
│ 📄 Broken Equipment in Lab                  │
│    Template for reporting broken equipment  │
│    [Facilities] [High Priority]             │
├─────────────────────────────────────────────┤
│ 📄 Assignment Grading Issue                 │
│    Template for grading concerns            │
│    [Academic] [Medium Priority]             │
├─────────────────────────────────────────────┤
│ 📄 Classroom AC Not Working                 │
│    Template for AC issues                   │
│    [Facilities] [Medium Priority]           │
└─────────────────────────────────────────────┘
```

#### Template Selected

```
┌─────────────────────────────────────────────┐
│ 📄 Broken Equipment in Lab              [X] │
│    Template for reporting broken or         │
│    malfunctioning equipment in labs         │
└─────────────────────────────────────────────┘
```

### 3. Auto-Fill Behavior

When a template is selected:

1. **Title**: Pre-filled with template title
2. **Category**: Auto-selected based on template
3. **Priority**: Auto-selected based on template's suggested priority
4. **Description**: Pre-filled with template description and structured field placeholders
5. **Tags**: Auto-suggested based on template category and title keywords

Example description after selecting "Broken Equipment in Lab":

```html
<p>
  <strong
    >Template for reporting broken or malfunctioning equipment in laboratory facilities</strong
  >
</p>
<br />
<p><strong>Please provide the following information:</strong></p>
<br />
<p><strong>Equipment Name (Required):</strong></p>
<p><em>e.g., Microscope, Computer</em></p>
<br />
<p><strong>Lab Room (Required):</strong></p>
<p><em>e.g., Lab 301</em></p>
<br />
<p><strong>Issue Description (Required):</strong></p>
<p><em>Describe the problem</em></p>
<br />
```

Example tags after selecting "Broken Equipment in Lab":

- `facilities` (from category)
- `equipment` (from title keyword)

### 4. Template Management

#### Clear Template

- Click the "X" button to clear the selected template
- Resets all form fields to empty state
- Returns to template selection mode

#### Available Templates (Mock Data)

1. **Broken Equipment in Lab** - Facilities, High Priority
2. **Assignment Grading Issue** - Academic, Medium Priority
3. **Classroom AC Not Working** - Facilities, Medium Priority
4. **Course Material Access Problem** - Course Content, High Priority
5. **Parking Permit Issue** - Administrative, Low Priority

## User Experience

### For Students

1. Navigate to "Submit a Complaint" page
2. See template selector at the top of the form
3. Click "Browse Templates" to see available options
4. Select a template that matches their issue
5. Form is automatically filled with relevant fields
6. Student can edit any pre-filled content
7. Submit or save as draft as usual

### Benefits

- ✅ Faster complaint submission
- ✅ Consistent complaint formatting
- ✅ Guided field completion
- ✅ Reduced errors and missing information
- ✅ Better categorization

## Technical Details

### Props Added

```typescript
interface ComplaintFormProps {
  // ... existing props
  showTemplateSelector?: boolean; // Default: true
}
```

### State Management

```typescript
const [selectedTemplate, setSelectedTemplate] = React.useState<ComplaintTemplate | null>(null);
const [showTemplateDropdown, setShowTemplateDropdown] = React.useState(false);
const [loadingTemplates, setLoadingTemplates] = React.useState(false);
```

### Key Functions

- `handleTemplateSelect(template)`: Applies template to form
- `buildDescriptionFromTemplate(template)`: Generates description with field placeholders
- `handleClearTemplate()`: Resets form to empty state

## Integration Points

### Current Implementation (Phase 3-11)

- Uses mock template data
- No API calls
- Pure UI functionality

### Future Integration (Phase 12)

- Fetch templates from Supabase: `supabase.from('complaint_templates').select('*').eq('is_active', true)`
- Filter templates by user role if needed
- Real-time template updates

## Testing Scenarios

### Manual Testing Checklist

- [ ] Template selector appears on new complaint page
- [ ] Template selector hidden when editing drafts
- [ ] Dropdown opens/closes correctly
- [ ] All templates display with correct information
- [ ] Selecting a template fills form fields
- [ ] Clear button resets the form
- [ ] Can still manually fill form without template
- [ ] Form validation works with template-filled data
- [ ] Can submit complaint after using template
- [ ] Can save as draft after using template

## Accessibility

- ✅ Keyboard navigation supported
- ✅ Click outside to close dropdown
- ✅ Clear visual feedback for selected template
- ✅ Proper ARIA labels and roles
- ✅ Screen reader friendly

## Next Steps (Task 4.3 Continuation)

- [x] Pre-fill form fields from template (COMPLETED ✓)
  - ✅ Title pre-filling
  - ✅ Category pre-filling
  - ✅ Priority pre-filling
  - ✅ Description pre-filling with structured fields
  - ✅ Tag auto-suggestion based on template
- [ ] Allow template editing and deletion (Admin page - separate task)

## Related Files

- `src/components/complaints/complaint-form.tsx` - Main implementation
- `src/app/complaints/new/page.tsx` - Usage in new complaint page
- `src/app/admin/templates/page.tsx` - Template management (lecturers)
- `src/types/database.types.ts` - ComplaintTemplate interface

## Screenshots/Visual Guide

### Desktop View

```
┌────────────────────────────────────────────────────────────┐
│ Submit a Complaint                                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Use a Template (Optional)                                  │
│ Select a pre-defined template to help you fill out your    │
│ complaint faster.                                           │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 📄 Browse Templates                                  │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☐ Submit anonymously                                       │
│ Your identity will be hidden from lecturers...             │
│                                                             │
│ Title *                                                     │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Brief summary of your complaint                      │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ [Rest of form...]                                          │
└────────────────────────────────────────────────────────────┘
```

### Mobile View

```
┌──────────────────────────┐
│ Submit a Complaint        │
├──────────────────────────┤
│                           │
│ Use a Template (Optional) │
│ Select a pre-defined...  │
│                           │
│ ┌──────────────────────┐ │
│ │ 📄 Browse Templates  │ │
│ └──────────────────────┘ │
│                           │
│ ☐ Submit anonymously     │
│                           │
│ Title *                   │
│ ┌──────────────────────┐ │
│ │                      │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

## Validation

The template selector integrates seamlessly with existing form validation:

- Template-filled fields can be edited
- All validation rules still apply
- Required fields must be completed
- Character limits enforced
- Draft saving works with templates

## Performance

- Templates loaded once on component mount
- Dropdown renders only when opened
- No performance impact on form submission
- Efficient state management

## Conclusion

The template selector feature has been successfully implemented and is ready for use. It provides a streamlined way for students to submit complaints using pre-defined templates while maintaining full flexibility to customize their submissions.
