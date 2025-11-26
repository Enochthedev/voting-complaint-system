# Vote Creation Form - Visual Guide

## Overview

The vote creation form allows lecturers to create voting polls for students. This guide demonstrates the form's features and validation.

## Location

- **Create Page**: `/admin/votes/new`
- **List Page**: `/admin/votes`

## Form Features

### 1. Basic Information

**Title Field**
- Required field
- 5-200 characters
- Character counter displayed
- Example: "Should we extend library hours?"

**Description Field**
- Required field
- 10-1000 characters
- Multi-line textarea
- Character counter displayed
- Example: "We're considering extending library hours during exam periods. Please vote on your preferred option."

### 2. Vote Options

**Dynamic Options List**
- Minimum 2 options required
- Can add unlimited options
- Each option max 200 characters
- Options must be unique
- Numbered display (1, 2, 3, etc.)
- Remove button for options (when more than 2)

**Example Options:**
1. "Yes, extend to 10 PM"
2. "Yes, extend to midnight"
3. "No, keep current hours"
4. "Only during exam periods"

### 3. Optional Settings

**Related Complaint ID**
- Optional text field
- Links vote to a specific complaint
- Provides context for the vote
- Example: "abc123-def456-ghi789"

**Closing Date & Time**
- Optional datetime picker
- Must be in the future if provided
- Leave empty for indefinite voting
- Format: YYYY-MM-DD HH:mm

**Active Status**
- Checkbox toggle
- Controls visibility to students
- Default: checked (active)
- Uncheck to create draft vote

### 4. Form Actions

**Cancel Button**
- Returns to votes list page
- No data is saved
- Outline style button

**Create/Update Button**
- Primary action button
- Validates all fields before submission
- Shows loading spinner during save
- Disabled during loading

## Validation Rules

### Title Validation
- ❌ Empty: "Title is required"
- ❌ Too short (< 5 chars): "Title must be at least 5 characters"
- ❌ Too long (> 200 chars): "Title must be less than 200 characters"
- ✅ Valid: 5-200 characters

### Description Validation
- ❌ Empty: "Description is required"
- ❌ Too short (< 10 chars): "Description must be at least 10 characters"
- ❌ Too long (> 1000 chars): "Description must be less than 1000 characters"
- ✅ Valid: 10-1000 characters

### Options Validation
- ❌ Less than 2 options: "A vote must have at least 2 options"
- ❌ Less than 2 filled options: "At least 2 options must have text"
- ❌ Duplicate options: "Options must be unique"
- ❌ Option too long (> 200 chars): "Option text must be less than 200 characters"
- ✅ Valid: At least 2 unique options, each ≤ 200 characters

### Closing Date Validation
- ❌ Past date: "Closing date must be in the future"
- ✅ Valid: Future date or empty

## User Flow

### Creating a New Vote

1. **Navigate to Create Page**
   - Click "Create Vote" button from `/admin/votes`
   - Or navigate directly to `/admin/votes/new`

2. **Fill in Basic Information**
   - Enter vote title
   - Enter detailed description
   - Watch character counters

3. **Add Vote Options**
   - Fill in at least 2 options
   - Click "Add Option" to add more
   - Click trash icon to remove options (if more than 2)

4. **Configure Optional Settings** (if needed)
   - Link to a complaint ID
   - Set closing date/time
   - Toggle active status

5. **Submit Form**
   - Click "Create Vote" button
   - Form validates all fields
   - Success message appears
   - Auto-redirect to votes list

### Error Handling

**Validation Errors**
- Displayed below each field in red
- Form submission blocked until fixed
- Clear error messages guide user

**Submission Errors**
- Alert banner at top of page
- Error message explains the issue
- Form remains filled for retry

**Success State**
- Green success alert appears
- "Vote created successfully! Redirecting..."
- Automatic redirect after 1.5 seconds

## Empty State

When no votes exist:
- Large vote icon displayed
- "No votes yet" heading
- Descriptive text
- "Create Your First Vote" button
- Centered card layout

## Design Features

### Responsive Design
- Mobile-friendly layout
- Stacked fields on small screens
- Grid layout on larger screens
- Touch-friendly buttons and inputs

### Accessibility
- Proper label associations
- Required field indicators (*)
- Error messages linked to fields
- Keyboard navigation support
- Focus states on all interactive elements

### Visual Feedback
- Character counters update in real-time
- Loading spinner during submission
- Disabled state during loading
- Color-coded alerts (red for errors, green for success)
- Hover states on buttons

### Dark Mode Support
- All colors use CSS variables
- Proper contrast in both modes
- Consistent appearance across themes

## Technical Details

### Component Structure
```
VoteForm (src/components/votes/vote-form.tsx)
├── Title field
├── Description field
├── Options section
│   ├── Option 1
│   ├── Option 2
│   ├── ... (dynamic)
│   └── Add Option button
├── Optional settings section
│   ├── Related complaint ID
│   ├── Closing date/time
│   └── Active status checkbox
└── Form actions
    ├── Cancel button
    └── Submit button
```

### Data Flow
1. User fills form
2. Form validates on submit
3. Data formatted as Vote object
4. onSave callback triggered
5. Parent component handles API call
6. Success/error state displayed

### Mock Implementation
- Currently uses mock data (UI-first approach)
- Console logs vote data
- Simulates 1-second API delay
- Always succeeds for testing
- Will be replaced with real API in Phase 12

## Testing Checklist

- [ ] Form loads without errors
- [ ] All fields are editable
- [ ] Character counters update correctly
- [ ] Can add/remove options
- [ ] Validation errors display properly
- [ ] Cannot submit with invalid data
- [ ] Can submit with valid data
- [ ] Success message appears
- [ ] Redirects after success
- [ ] Cancel button works
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] Responsive on mobile
- [ ] Keyboard navigation works

## Future Enhancements

The following features will be added in subsequent tasks:
- Real API integration with Supabase
- Vote editing functionality
- Vote preview before submission
- Complaint selector dropdown
- Rich text editor for description
- Image attachments for options
- Vote templates
- Duplicate vote functionality
