# Complaint Form Refactoring Guide

## Overview

The complaint form has been refactored from a single 895-line file into a modular, maintainable component structure.

## New Structure

```
src/components/complaints/complaint-form/
├── index.tsx                    - Main orchestration component
├── FormActions.tsx              - Submit/Draft/Cancel buttons
├── FormFields.tsx               - Core form inputs
├── TagInput.tsx                 - Tag input with autocomplete
├── TemplateSelector.tsx         - Template browser
├── types.ts                     - TypeScript types
├── constants.ts                 - Configuration constants
├── validation.ts                - Form validation logic
├── template-utils.ts            - Template utilities
└── mock-data.ts                 - Mock data for development
```

## Usage

### Basic Usage

```tsx
import { ComplaintForm } from '@/components/complaints/complaint-form';

export default function NewComplaintPage() {
  const handleSubmit = async (data, isDraft) => {
    // Handle form submission
    console.log('Form data:', data);
  };

  return (
    <ComplaintForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      showTemplateSelector={true}
    />
  );
}
```

### Editing Existing Complaint

```tsx
import { ComplaintForm } from '@/components/complaints/complaint-form';

export default function EditComplaintPage({ complaint }) {
  return (
    <ComplaintForm
      initialData={{
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        isAnonymous: complaint.is_anonymous,
        tags: complaint.tags,
      }}
      isEditing={true}
      showTemplateSelector={false}
      onSubmit={handleUpdate}
    />
  );
}
```

## Components

### FormFields
Renders all core form inputs:
- Anonymous submission toggle
- Title input with character count
- Category dropdown
- Priority button grid
- Description rich text editor

### TagInput
Provides tag management with:
- Autocomplete suggestions
- Keyboard navigation
- Tag chips with remove buttons
- Create new tags

### TemplateSelector
Allows users to:
- Browse available templates
- Preview template details
- Apply template to form
- Clear selected template

### FormActions
Provides action buttons:
- Cancel (optional)
- Save as Draft
- Submit Complaint

## Validation

Import validation utilities:

```tsx
import { validateForm, getTextContent } from '@/components/complaints/complaint-form/validation';

const errors = validateForm(formData, isDraft);
if (Object.keys(errors).length > 0) {
  // Handle validation errors
}
```

## Template Utilities

Work with templates:

```tsx
import {
  getSuggestedTagsForTemplate,
  buildDescriptionFromTemplate,
  applyTemplateToFormData,
} from '@/components/complaints/complaint-form/template-utils';

// Get suggested tags for a template
const tags = getSuggestedTagsForTemplate(template);

// Build description from template fields
const description = buildDescriptionFromTemplate(template);

// Apply template to form data
const updatedFormData = applyTemplateToFormData(template, currentFormData);
```

## Types

```tsx
import type {
  ComplaintFormData,
  ComplaintFormProps,
  ComplaintTemplate,
  FormErrors,
} from '@/components/complaints/complaint-form';

// ComplaintFormData
interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
  files: File[];
}

// ComplaintFormProps
interface ComplaintFormProps {
  onSubmit?: (data: ComplaintFormData, isDraft: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ComplaintFormData>;
  isEditing?: boolean;
  showTemplateSelector?: boolean;
}
```

## Constants

```tsx
import {
  CATEGORIES,
  PRIORITIES,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '@/components/complaints/complaint-form/constants';

// Use in your components
console.log('Max title length:', MAX_TITLE_LENGTH); // 200
console.log('Available categories:', CATEGORIES);
```

## Testing

The validation logic can be tested independently:

```tsx
import { validateForm } from '@/components/complaints/complaint-form/validation';
import { describe, it, expect } from 'vitest';

describe('Form Validation', () => {
  it('should validate required fields', () => {
    const formData = {
      title: '',
      description: '',
      category: '',
      priority: '',
      isAnonymous: false,
      tags: [],
      files: [],
    };
    
    const errors = validateForm(formData, false);
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.category).toBeDefined();
    expect(errors.priority).toBeDefined();
  });
});
```

## Benefits

### Maintainability
- Each file has a single responsibility
- Easy to locate and fix bugs
- Reduced cognitive load

### Testability
- Components can be tested in isolation
- Validation logic is separate and testable
- Mock data separated for easy testing

### Reusability
- TagInput can be used in other forms
- Validation functions can be shared
- Template utilities are reusable

### Performance
- Better code splitting
- Can optimize individual components
- Easier to add React.memo

## Migration Notes

The original `complaint-form.tsx` now re-exports from the new structure, so existing imports continue to work:

```tsx
// This still works!
import { ComplaintForm } from '@/components/complaints/complaint-form';
```

No changes needed in consuming components.

## Future Enhancements

Potential improvements:
- Add form field validation on blur
- Add autosave for drafts
- Add template search/filter
- Add tag categories
- Add file upload progress tracking
- Add form analytics

## Related Documentation

- [Refactoring Plan](../../REFACTORING_PLAN_COMPLAINT_FORM.md)
- [Refactoring Completion](../../REFACTORING_COMPLETION_COMPLAINT_FORM.md)
- [Development Approach](../../.kiro/steering/development-approach.md)
