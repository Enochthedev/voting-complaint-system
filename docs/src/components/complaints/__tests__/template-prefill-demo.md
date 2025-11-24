# Template Pre-fill Functionality - Implementation Guide

## Overview
This document describes the template pre-fill functionality implemented for Task 4.3. When a student selects a complaint template, the form automatically pre-fills with relevant information to speed up complaint submission.

## Implementation Status
✅ **COMPLETED** - All form fields are now pre-filled when a template is selected.

## Features

### 1. Title Pre-filling
When a template is selected, the complaint title field is automatically filled with the template's title.

**Example:**
- Template: "Broken Equipment in Lab"
- Result: Title field = "Broken Equipment in Lab"

**User Experience:**
- User can edit the pre-filled title
- Title validation still applies
- Character limit enforced (200 characters)

### 2. Category Pre-filling
The category dropdown is automatically set to match the template's category.

**Example:**
- Template category: "facilities"
- Result: Category dropdown = "Facilities"

**Available Categories:**
- Academic
- Facilities
- Harassment
- Course Content
- Administrative
- Other

### 3. Priority Pre-filling
The priority level is automatically selected based on the template's suggested priority.

**Example:**
- Template suggested_priority: "high"
- Result: Priority buttons = "High" selected

**Priority Levels:**
- Low
- Medium
- High
- Critical

### 4. Description Pre-filling (Enhanced)
The description field is pre-filled with a structured format that includes:
- Template description as a header
- All template fields with labels
- Required/Optional indicators
- Placeholder text for guidance

**Example Structure:**
```html
<p><strong>Template for reporting broken or malfunctioning equipment in laboratory facilities</strong></p><br/>
<p><strong>Please provide the following information:</strong></p><br/>
<p><strong>Equipment Name (Required):</strong></p>
<p><em>e.g., Microscope, Computer</em></p><br/>
<p><strong>Lab Room (Required):</strong></p>
<p><em>e.g., Lab 301</em></p><br/>
<p><strong>Issue Description (Required):</strong></p>
<p><em>Describe the problem</em></p><br/>
```

**Benefits:**
- Clear structure for users to follow
- Shows which fields are required vs optional
- Provides examples through placeholders
- Maintains rich text formatting

### 5. Tag Auto-suggestion (NEW)
Tags are automatically suggested based on:
- Template category
- Keywords in template title

**Tag Suggestion Logic:**

| Template Title Contains | Suggested Tags |
|------------------------|----------------|
| "equipment" or "lab" | `equipment` |
| "grading" or "assignment" | `grading` |
| "classroom" or "room" | `classroom` |
| "ac" or "air conditioning" | `facilities` |
| "access" or "material" | `course-material` |
| "parking" | `parking` |

**Example:**
- Template: "Broken Equipment in Lab"
- Category: "facilities"
- Suggested tags: `["facilities", "equipment"]`

**User Experience:**
- Tags appear immediately when template is selected
- User can remove suggested tags
- User can add additional tags
- No duplicate tags

## Code Implementation

### Key Functions

#### 1. handleTemplateSelect
```typescript
const handleTemplateSelect = (template: ComplaintTemplate) => {
  setSelectedTemplate(template);
  setShowTemplateDropdown(false);

  setFormData((prev) => ({
    ...prev,
    title: template.title,
    category: template.category,
    priority: template.suggested_priority,
    description: buildDescriptionFromTemplate(template),
    tags: getSuggestedTagsForTemplate(template),
  }));
};
```

#### 2. buildDescriptionFromTemplate
```typescript
const buildDescriptionFromTemplate = (template: ComplaintTemplate): string => {
  let description = `<p><strong>${template.description}</strong></p><br/>`;
  
  if (template.fields && typeof template.fields === 'object') {
    description += '<p><strong>Please provide the following information:</strong></p><br/>';
    
    Object.entries(template.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      const label = fieldConfig.label || fieldName;
      const placeholder = fieldConfig.placeholder || '';
      const required = fieldConfig.required ? ' (Required)' : ' (Optional)';
      
      description += `<p><strong>${label}${required}:</strong></p>`;
      description += `<p><em>${placeholder || 'Enter information here...'}</em></p><br/>`;
    });
  }
  
  return description;
};
```

#### 3. getSuggestedTagsForTemplate
```typescript
const getSuggestedTagsForTemplate = (template: ComplaintTemplate): string[] => {
  const tags: string[] = [];
  
  // Add category-based tag
  const categoryTag = template.category.replace('_', '-');
  tags.push(categoryTag);
  
  // Add tags based on template title keywords
  const titleLower = template.title.toLowerCase();
  if (titleLower.includes('equipment') || titleLower.includes('lab')) {
    tags.push('equipment');
  }
  if (titleLower.includes('grading') || titleLower.includes('assignment')) {
    tags.push('grading');
  }
  if (titleLower.includes('classroom') || titleLower.includes('room')) {
    tags.push('classroom');
  }
  if (titleLower.includes('ac') || titleLower.includes('air conditioning')) {
    tags.push('facilities');
  }
  if (titleLower.includes('access') || titleLower.includes('material')) {
    tags.push('course-material');
  }
  if (titleLower.includes('parking')) {
    tags.push('parking');
  }
  
  return [...new Set(tags)];
};
```

## User Flow

### Complete Flow with Pre-filling

1. **User navigates to "Submit a Complaint"**
   - Form is empty
   - Template selector is visible

2. **User clicks "Browse Templates"**
   - Dropdown opens
   - Shows all available templates
   - Each template shows: title, description, category, priority

3. **User selects a template**
   - Dropdown closes
   - Selected template badge appears
   - **All form fields are instantly pre-filled:**
     - ✅ Title
     - ✅ Category
     - ✅ Priority
     - ✅ Description (structured)
     - ✅ Tags (suggested)

4. **User edits pre-filled content**
   - Can modify any field
   - Can add/remove tags
   - Can change category/priority
   - Can edit description in rich text editor

5. **User submits or saves as draft**
   - All validation rules apply
   - Pre-filled data is treated like manually entered data

### Clear Template Flow

1. **User clicks "X" on selected template badge**
   - Template is cleared
   - **All form fields reset to empty:**
     - Title = ""
     - Category = ""
     - Priority = ""
     - Description = ""
     - Tags = []
     - Files = []

2. **User can select a different template or fill manually**

## Testing

### Manual Testing Checklist

#### Basic Pre-filling
- [x] Title pre-fills when template selected
- [x] Category pre-fills when template selected
- [x] Priority pre-fills when template selected
- [x] Description pre-fills with structured format
- [x] Tags pre-fill with suggestions

#### Description Structure
- [x] Template description appears as header
- [x] "Please provide the following information" section appears
- [x] All template fields are listed
- [x] Required fields marked as "(Required)"
- [x] Optional fields marked as "(Optional)"
- [x] Placeholders appear in italics
- [x] Fields without placeholders show "Enter information here..."

#### Tag Suggestions
- [x] Category-based tag is added
- [x] Title keyword-based tags are added
- [x] No duplicate tags
- [x] Tags can be removed by user
- [x] User can add additional tags

#### User Interactions
- [x] Pre-filled fields can be edited
- [x] Clear template button resets all fields
- [x] Can select different template after clearing
- [x] Form validation works with pre-filled data
- [x] Can submit complaint with pre-filled data
- [x] Can save as draft with pre-filled data

#### Edge Cases
- [x] Template with no fields (only description)
- [x] Template with undefined fields
- [x] Field without placeholder
- [x] Field without label
- [x] Template with many fields (10+)
- [x] Template with long description

### Automated Tests

See `template-prefill.test.ts` for comprehensive test coverage:
- ✅ Basic field pre-filling tests
- ✅ Description building tests
- ✅ Tag suggestion tests
- ✅ Edge case handling tests
- ✅ Integration tests

## Benefits

### For Students
1. **Faster Submission**: Pre-filled fields save time
2. **Guided Process**: Structured description shows what to include
3. **Fewer Errors**: Templates ensure all required information is provided
4. **Consistency**: Similar complaints follow same format
5. **Better Categorization**: Auto-suggested tags improve searchability

### For Lecturers
1. **Consistent Format**: Easier to review complaints
2. **Complete Information**: Templates ensure students provide all needed details
3. **Better Organization**: Auto-tagged complaints are easier to filter
4. **Reduced Back-and-forth**: Less need to ask for missing information

### For System
1. **Better Data Quality**: Structured complaints are easier to analyze
2. **Improved Search**: Consistent formatting improves search results
3. **Analytics**: Standardized data enables better reporting
4. **Scalability**: Templates can be updated to improve data collection

## Future Enhancements

### Potential Improvements (Not in Current Scope)
- [ ] Template preview before selection
- [ ] Recently used templates
- [ ] Template favorites
- [ ] Template search/filter
- [ ] Dynamic field types (dropdowns, checkboxes)
- [ ] Conditional fields based on selections
- [ ] Template versioning
- [ ] Template usage analytics

## Related Files

### Implementation
- `src/components/complaints/complaint-form.tsx` - Main form component
- `src/app/complaints/new/page.tsx` - New complaint page
- `src/types/database.types.ts` - Type definitions

### Tests
- `src/components/complaints/__tests__/template-prefill.test.ts` - Unit tests
- `src/components/complaints/__tests__/complaint-form-validation.test.ts` - Validation tests

### Documentation
- `src/components/complaints/__tests__/template-selector-demo.md` - Template selector overview
- `src/components/complaints/__tests__/template-prefill-demo.md` - This file

## Acceptance Criteria Validation

### AC19: Complaint Templates
- ✅ System provides pre-defined templates for common complaint types
- ✅ Templates include suggested fields and guidance
- ✅ Students can select template when creating new complaint
- ✅ Lecturers can create and manage templates
- ✅ Templates speed up complaint submission

### Task 4.3: Implement Complaint Templates
- ✅ Create template management page (lecturer)
- ✅ Build template creation form
- ✅ Implement template listing
- ✅ Add template selector to complaint form
- ✅ **Pre-fill form fields from template** ← THIS TASK
- [ ] Allow template editing and deletion (Next task)

## Conclusion

The template pre-fill functionality has been successfully implemented and tested. When a student selects a complaint template, all relevant form fields (title, category, priority, description, and tags) are automatically pre-filled with appropriate values. This feature significantly improves the user experience by:

1. Reducing time to submit complaints
2. Providing clear guidance on what information to include
3. Ensuring consistent formatting across similar complaints
4. Improving data quality through structured input

The implementation is complete, tested, and ready for use in the student complaint system.
