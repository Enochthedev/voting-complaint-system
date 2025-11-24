# Complaint Form Validation Implementation

## Overview
The complaint submission form includes comprehensive client-side validation to ensure data quality and user experience. This document describes the validation rules implemented.

## Validation Rules

### 1. Title Validation
- **Required**: Yes (for submission, optional for drafts)
- **Max Length**: 200 characters
- **Rules**:
  - Cannot be empty or whitespace-only for submission
  - Must not exceed 200 characters
  - Real-time character counter displayed
  - Whitespace is trimmed before validation

**Error Messages**:
- "Title is required" - when empty on submission
- "Title must be 200 characters or less" - when exceeding limit

### 2. Description Validation
- **Required**: Yes (for submission, optional for drafts)
- **Max Length**: 5000 characters (text content, not HTML)
- **Rules**:
  - Cannot be empty or contain only HTML tags for submission
  - HTML tags are stripped before length validation
  - Must not exceed 5000 characters of actual text content
  - Rich text editor provides formatting options

**Error Messages**:
- "Description is required" - when empty on submission
- "Description must be 5000 characters or less" - when exceeding limit

**Special Handling**:
- HTML markup is not counted toward character limit
- Only visible text content is validated
- Empty HTML elements (e.g., `<p></p>`) are treated as empty

### 3. Category Validation
- **Required**: Yes (for submission, optional for drafts)
- **Valid Options**:
  - Academic
  - Facilities
  - Harassment
  - Course Content
  - Administrative
  - Other

**Error Messages**:
- "Please select a category" - when not selected on submission

### 4. Priority Validation
- **Required**: Yes (for submission, optional for drafts)
- **Valid Options**:
  - Low
  - Medium
  - High
  - Critical

**Error Messages**:
- "Please select a priority level" - when not selected on submission

### 5. Tags Validation
- **Required**: No (optional field)
- **Rules**:
  - Tags are normalized to lowercase
  - Whitespace is trimmed
  - Duplicate tags are prevented
  - No character limit per tag
  - No limit on number of tags

**Features**:
- Autocomplete suggestions from popular tags
- Ability to create custom tags
- Visual tag chips with remove functionality

### 6. Anonymous Submission
- **Required**: No (optional checkbox)
- **Rules**:
  - Boolean flag, no validation needed
  - Privacy notice displayed when enabled
  - Does not affect other validation rules

## Draft Mode Validation

When saving as a draft (`isDraft: true`):
- **Title**: Optional, but if provided must not exceed 200 characters
- **Description**: Optional, but if provided must not exceed 5000 characters
- **Category**: Optional
- **Priority**: Optional
- **Tags**: Optional (same rules as submission)

This allows users to save incomplete complaints and return to them later.

## Validation Behavior

### Real-time Validation
- Errors are cleared immediately when user corrects the field
- Character counters update in real-time
- Visual feedback with red borders on invalid fields

### Submission Validation
- All validation runs when user clicks "Submit Complaint"
- Form submission is prevented if validation fails
- Error messages are displayed for all invalid fields
- Focus remains on the form to allow corrections

### Draft Validation
- Minimal validation when saving as draft
- Only length limits are enforced if content exists
- Allows partial completion

## Error Display

### Visual Indicators
- **Invalid Fields**: Red border on input/select elements
- **Error Messages**: Red text below each invalid field
- **General Errors**: Alert banner at top of form
- **Character Counters**: Show current/max length

### Error Message Format
```typescript
interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  general?: string;
}
```

## Accessibility

- Error messages are associated with form fields
- Required fields marked with asterisk (*)
- Clear visual indicators for validation state
- Keyboard navigation supported
- Screen reader friendly error announcements

## Testing

Comprehensive unit tests are provided in:
- `src/components/complaints/__tests__/complaint-form-validation.test.ts`

Tests cover:
- All validation rules
- Boundary conditions (max lengths)
- Edge cases (empty, whitespace-only, HTML-only)
- Draft mode validation
- Tag normalization and deduplication

## Implementation Details

### Validation Function
```typescript
const validateForm = (isDraft: boolean = false): boolean => {
  const newErrors: FormErrors = {};

  if (!isDraft) {
    // Full validation for submission
    // Check all required fields
  } else {
    // Minimal validation for drafts
    // Only check length limits if content exists
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### HTML Content Validation
```typescript
const getTextContent = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};
```

This ensures that HTML markup doesn't count toward character limits.

## Future Enhancements

Potential improvements for future iterations:
- Server-side validation (currently client-side only)
- Custom validation messages per category
- Profanity filtering for titles/descriptions
- Minimum length requirements
- Tag suggestions based on category
- Validation for file attachments (when implemented)
- Rate limiting for submissions

## Related Requirements

This implementation satisfies:
- **AC2**: Complaint Submission - validates required fields
- **AC9**: Categories, Tags, and Priority - validates all options
- **AC10**: Draft Complaints - supports partial validation

## Related Files

- `src/components/complaints/complaint-form.tsx` - Main form component
- `src/components/complaints/__tests__/complaint-form-validation.test.ts` - Validation tests
- `src/components/ui/rich-text-editor.tsx` - Rich text editor component
- `src/types/database.types.ts` - Type definitions
