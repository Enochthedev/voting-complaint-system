# Template Form Component

## Overview

The `TemplateForm` component provides a comprehensive form for creating and editing complaint templates. It allows lecturers to define reusable templates with custom fields that students can use when submitting complaints.

## Features

### 1. Basic Template Information
- **Title**: Required field with character limit (3-200 characters)
- **Description**: Required field with character limit (10-1000 characters)
- **Category**: Dropdown selection from predefined categories
- **Suggested Priority**: Dropdown selection for default priority level
- **Active Status**: Toggle to control template visibility to students

### 2. Custom Fields Management
- **Add Fields**: Dynamically add custom fields to the template
- **Remove Fields**: Delete fields that are no longer needed
- **Field Configuration**:
  - **Field Name**: Internal identifier (lowercase with underscores)
  - **Field Label**: Display name shown to users
  - **Field Type**: Text, Textarea, Number, or Date
  - **Placeholder**: Helper text for the field
  - **Required**: Mark field as mandatory

### 3. Validation
- **Title Validation**:
  - Required
  - Minimum 3 characters
  - Maximum 200 characters
  
- **Description Validation**:
  - Required
  - Minimum 10 characters
  - Maximum 1000 characters

- **Field Validation**:
  - Field name required and must be lowercase with underscores
  - Field label required
  - No duplicate field names allowed

### 4. User Experience
- Real-time character counters
- Inline error messages
- Loading states during submission
- Responsive design for mobile and desktop

## Usage

```tsx
import { TemplateForm } from '@/components/complaints/template-form';

// Create new template
<TemplateForm
  onSave={(templateData) => {
    // Handle template creation
    console.log('New template:', templateData);
  }}
  onCancel={() => {
    // Handle cancel action
    console.log('Form cancelled');
  }}
  isLoading={false}
/>

// Edit existing template
<TemplateForm
  template={existingTemplate}
  onSave={(templateData) => {
    // Handle template update
    console.log('Updated template:', templateData);
  }}
  onCancel={() => {
    // Handle cancel action
    console.log('Form cancelled');
  }}
  isLoading={false}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `template` | `ComplaintTemplate \| null` | No | Existing template to edit (omit for new template) |
| `onSave` | `(template: Partial<ComplaintTemplate>) => void` | Yes | Callback when form is submitted |
| `onCancel` | `() => void` | Yes | Callback when form is cancelled |
| `isLoading` | `boolean` | No | Shows loading state (default: false) |

## Template Data Structure

The form outputs a template object with the following structure:

```typescript
{
  id?: string,                    // Only present when editing
  title: string,                  // Template title
  description: string,            // Template description
  category: ComplaintCategory,    // Selected category
  suggested_priority: ComplaintPriority, // Suggested priority
  is_active: boolean,             // Active status
  fields: {                       // Custom fields object
    [fieldName: string]: {
      label: string,              // Display label
      type: 'text' | 'textarea' | 'number' | 'date',
      required: boolean,          // Is field required
      placeholder: string         // Placeholder text
    }
  }
}
```

## Example Template

```typescript
{
  title: "Broken Equipment in Lab",
  description: "Template for reporting broken or malfunctioning equipment",
  category: "facilities",
  suggested_priority: "high",
  is_active: true,
  fields: {
    equipment_name: {
      label: "Equipment Name",
      type: "text",
      required: true,
      placeholder: "e.g., Microscope, Computer"
    },
    lab_room: {
      label: "Lab Room",
      type: "text",
      required: true,
      placeholder: "e.g., Lab 301"
    },
    issue_description: {
      label: "Issue Description",
      type: "textarea",
      required: true,
      placeholder: "Describe the problem in detail"
    }
  }
}
```

## Field Types

### Text
Single-line text input for short responses.

### Textarea
Multi-line text input for longer descriptions.

### Number
Numeric input with validation.

### Date
Date picker for date-related fields.

## Validation Rules

### Field Name Format
- Must be lowercase
- Can only contain letters and underscores
- No spaces or special characters
- Must be unique within the template

Example valid names:
- `room_number`
- `equipment_name`
- `issue_date`

Example invalid names:
- `Room Number` (uppercase)
- `room-number` (hyphen)
- `room number` (space)

## Integration with Template Management

The form is integrated into the template management page at `/admin/templates`:

1. Click "Create New Template" to open the form in a modal
2. Fill in template details and add custom fields
3. Click "Create Template" to save
4. Edit existing templates by clicking the edit icon
5. Changes are saved with mock data (API integration in Phase 12)

## Styling

The component uses:
- Tailwind CSS for styling
- Dark mode support
- Responsive grid layouts
- Consistent spacing and typography
- Accessible form controls

## Accessibility

- Proper label associations
- Keyboard navigation support
- Focus management
- Error announcements
- Required field indicators

## Future Enhancements

- Field reordering (drag and drop)
- Field duplication
- Template preview
- Import/export templates
- Field validation rules (min/max length, patterns)
- Conditional field visibility
- Field groups/sections
