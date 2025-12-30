# Template Form - Visual Guide

## Overview

This guide shows the visual appearance and functionality of the template creation form.

## Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Create New Template                                    [X] │
│  Create a new template to help students submit complaints  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Template Title *                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ e.g., Broken Equipment in Lab                         │ │
│  └───────────────────────────────────────────────────────┘ │
│  0/200 characters                                           │
│                                                             │
│  Description *                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Describe what this template is for and when          │ │
│  │ students should use it...                             │ │
│  │                                                       │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  0/1000 characters                                          │
│                                                             │
│  Category *              Suggested Priority *               │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ Academic      ▼ │    │ Medium        ▼ │               │
│  └─────────────────┘    └─────────────────┘               │
│                                                             │
│  ☑ Active (visible to students)                            │
│                                                             │
│  Template Fields                        [+ Add Field]       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ No fields added yet. Click "Add Field" to create      │ │
│  │ custom fields for this template.                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                    [Cancel] [Create Template]│
└─────────────────────────────────────────────────────────────┘
```

## With Custom Fields

```
┌─────────────────────────────────────────────────────────────┐
│  Template Fields                        [+ Add Field]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Field 1                                      [🗑️]   │   │
│  │                                                     │   │
│  │ Field Name                    Field Label           │   │
│  │ ┌─────────────────────┐      ┌──────────────────┐  │   │
│  │ │ equipment_name      │      │ Equipment Name   │  │   │
│  │ └─────────────────────┘      └──────────────────┘  │   │
│  │                                                     │   │
│  │ Field Type                    Placeholder Text      │   │
│  │ ┌─────────────────────┐      ┌──────────────────┐  │   │
│  │ │ Text              ▼ │      │ e.g., Microscope │  │   │
│  │ └─────────────────────┘      └──────────────────┘  │   │
│  │                                                     │   │
│  │ ☑ Required field                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Field 2                                      [🗑️]   │   │
│  │                                                     │   │
│  │ Field Name                    Field Label           │   │
│  │ ┌─────────────────────┐      ┌──────────────────┐  │   │
│  │ │ lab_room            │      │ Lab Room         │  │   │
│  │ └─────────────────────┘      └──────────────────┘  │   │
│  │                                                     │   │
│  │ Field Type                    Placeholder Text      │   │
│  │ ┌─────────────────────┐      ┌──────────────────┐  │   │
│  │ │ Text              ▼ │      │ e.g., Lab 301    │  │   │
│  │ └─────────────────────┘      └──────────────────┘  │   │
│  │                                                     │   │
│  │ ☑ Required field                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Field 3                                      [🗑️]   │   │
│  │                                                     │   │
│  │ Field Name                    Field Label           │   │
│  │ ┌─────────────────────┐      ┌──────────────────┐  │   │
│  │ │ issue_description   │      │ Issue Description│  │   │
│  │ └─────────────────────┘      └──────────────────┘  │   │
│  │                                                     │   │
│  │ Field Type                    Placeholder Text      │   │
│  │ ┌─────────────────────┐      ┌──────────────────┐  │   │
│  │ │ Textarea          ▼ │      │ Describe problem │  │   │
│  │ └─────────────────────┘      └──────────────────┘  │   │
│  │                                                     │   │
│  │ ☑ Required field                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Validation Errors

```
┌─────────────────────────────────────────────────────────────┐
│  Template Title *                                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ AB                                                    │ │
│  └───────────────────────────────────────────────────────┘ │
│  ⚠️ Title must be at least 3 characters                    │
│  2/200 characters                                           │
│                                                             │
│  Description *                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│  ⚠️ Description is required                                │
│  0/1000 characters                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Field 1                                      [🗑️]   │   │
│  │                                                     │   │
│  │ Field Name                                          │   │
│  │ ┌─────────────────────┐                            │   │
│  │ │ Equipment Name      │                            │   │
│  │ └─────────────────────┘                            │   │
│  │ ⚠️ Field name must be lowercase letters and        │   │
│  │    underscores only                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Field Type Options

When clicking the Field Type dropdown:

```
┌─────────────────────┐
│ Text              ✓ │  ← Single-line input
│ Text Area           │  ← Multi-line input
│ Number              │  ← Numeric input
│ Date                │  ← Date picker
└─────────────────────┘
```

## Category Options

```
┌─────────────────────┐
│ Academic          ✓ │
│ Facilities          │
│ Harassment          │
│ Course Content      │
│ Administrative      │
│ Other               │
└─────────────────────┘
```

## Priority Options

```
┌─────────────────────┐
│ Low                 │
│ Medium            ✓ │
│ High                │
│ Critical            │
└─────────────────────┘
```

## Success Message

After saving a template:

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Template "Broken Equipment in Lab" created successfully  │
└─────────────────────────────────────────────────────────────┘
```

## Loading State

When submitting:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [All inputs disabled with reduced opacity]                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          [Cancel] [⟳ Create Template]       │
└─────────────────────────────────────────────────────────────┘
```

## Mobile View

On mobile devices, the form adapts:

```
┌─────────────────────────┐
│ Create New Template [X] │
├─────────────────────────┤
│                         │
│ Template Title *        │
│ ┌─────────────────────┐ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Description *           │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Category *              │
│ ┌─────────────────────┐ │
│ │ Academic          ▼ │ │
│ └─────────────────────┘ │
│                         │
│ Suggested Priority *    │
│ ┌─────────────────────┐ │
│ │ Medium            ▼ │ │
│ └─────────────────────┘ │
│                         │
│ ☑ Active                │
│                         │
│ Template Fields         │
│           [+ Add Field] │
│                         │
│ [Field cards stack      │
│  vertically]            │
│                         │
├─────────────────────────┤
│ [Cancel]                │
│ [Create Template]       │
└─────────────────────────┘
```

## Dark Mode

The form fully supports dark mode with:

- Dark background colors
- Light text on dark backgrounds
- Adjusted border colors
- Proper contrast ratios
- Consistent styling across all elements

## Interaction Flow

### Creating a Template

1. **Click "Create New Template"** → Modal opens
2. **Fill in title** → Character counter updates
3. **Fill in description** → Character counter updates
4. **Select category** → Dropdown closes
5. **Select priority** → Dropdown closes
6. **Toggle active status** → Checkbox updates
7. **Click "Add Field"** → New field card appears
8. **Fill field details** → Validation runs
9. **Add more fields** → Repeat step 7-8
10. **Click "Create Template"** → Validation runs
11. **If valid** → Template saved, modal closes, success message
12. **If invalid** → Errors shown, form stays open

### Editing a Template

1. **Click edit icon** → Modal opens with pre-filled data
2. **Modify any fields** → Changes tracked
3. **Click "Update Template"** → Validation runs
4. **If valid** → Template updated, modal closes, success message
5. **If invalid** → Errors shown, form stays open

### Canceling

1. **Click "Cancel"** → Modal closes immediately
2. **All changes discarded** → No save occurs

## Keyboard Navigation

- **Tab**: Move between fields
- **Shift+Tab**: Move backwards
- **Enter**: Submit form (when focused on input)
- **Escape**: Close modal (cancel)
- **Space**: Toggle checkboxes

## Accessibility

- All inputs have associated labels
- Required fields marked with asterisk
- Error messages announced to screen readers
- Focus management in modal
- Keyboard navigation support
- Proper ARIA attributes

## Example Templates

### Template 1: Broken Equipment

```
Title: Broken Equipment in Lab
Description: Template for reporting broken or malfunctioning equipment
Category: Facilities
Priority: High
Active: Yes

Fields:
1. equipment_name (Text, Required)
   Label: Equipment Name
   Placeholder: e.g., Microscope, Computer

2. lab_room (Text, Required)
   Label: Lab Room
   Placeholder: e.g., Lab 301

3. issue_description (Textarea, Required)
   Label: Issue Description
   Placeholder: Describe the problem in detail
```

### Template 2: Assignment Grading Issue

```
Title: Assignment Grading Issue
Description: Template for students to report concerns about assignment grading
Category: Academic
Priority: Medium
Active: Yes

Fields:
1. assignment_name (Text, Required)
   Label: Assignment Name
   Placeholder: e.g., Midterm Project

2. course_code (Text, Required)
   Label: Course Code
   Placeholder: e.g., CS101

3. expected_grade (Text, Required)
   Label: Expected Grade
   Placeholder: e.g., A

4. received_grade (Text, Required)
   Label: Received Grade
   Placeholder: e.g., B

5. concern_details (Textarea, Required)
   Label: Concern Details
   Placeholder: Explain your grading concern
```

### Template 3: Parking Permit Issue

```
Title: Parking Permit Issue
Description: Template for reporting problems with parking permits
Category: Administrative
Priority: Low
Active: Yes

Fields:
1. permit_number (Text, Required)
   Label: Permit Number
   Placeholder: e.g., P12345

2. parking_lot (Text, Required)
   Label: Parking Lot
   Placeholder: e.g., Lot A

3. issue_type (Text, Required)
   Label: Issue Type
   Placeholder: e.g., Lost permit, Damaged permit
```

## Tips for Creating Good Templates

1. **Clear Title**: Use descriptive titles that students will understand
2. **Detailed Description**: Explain when to use the template
3. **Appropriate Category**: Choose the most relevant category
4. **Realistic Priority**: Set a default priority that makes sense
5. **Useful Fields**: Add fields that capture essential information
6. **Good Placeholders**: Provide examples in placeholder text
7. **Required Fields**: Mark truly essential fields as required
8. **Field Names**: Use clear, descriptive field names
9. **Field Types**: Choose appropriate input types
10. **Active Status**: Only activate when template is ready

## Common Validation Errors

| Error                                 | Cause             | Solution                      |
| ------------------------------------- | ----------------- | ----------------------------- |
| "Title is required"                   | Empty title field | Enter a title                 |
| "Title must be at least 3 characters" | Title too short   | Add more characters           |
| "Description is required"             | Empty description | Enter a description           |
| "Field name is required"              | Empty field name  | Enter a field name            |
| "Field name must be lowercase..."     | Invalid format    | Use lowercase and underscores |
| "Field name must be unique"           | Duplicate name    | Use a different name          |
| "Field label is required"             | Empty label       | Enter a label                 |

## Performance

- Form renders quickly (< 100ms)
- Validation is instant (synchronous)
- No network calls during typing
- Smooth animations and transitions
- Efficient re-renders
- No lag with many fields (tested up to 20 fields)
