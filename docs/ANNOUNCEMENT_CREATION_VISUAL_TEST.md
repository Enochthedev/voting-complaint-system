# Announcement Creation Form - Visual Testing Guide

## How to Test

### 1. Access the Admin Announcements Page
Navigate to: `/admin/announcements`

### 2. Initial View (List View)
**Expected**:
- Page title: "Manage Announcements"
- Subtitle: "Create and manage system-wide announcements for students"
- "Create Announcement" button in top-right
- List of 3 mock announcements displayed
- Each announcement shows:
  - Megaphone icon
  - Title
  - Timestamp with calendar icon
  - Time-ago badge (e.g., "5 days ago")
  - Content text
  - "Edit" and "Delete" buttons

### 3. Create New Announcement
**Steps**:
1. Click "Create Announcement" button
2. Verify form displays with:
   - Title: "Create New Announcement"
   - Subtitle explaining visibility
   - Title input field (required)
   - Content textarea (required)
   - Character counters (0/200 and 0/5000)
   - Info alert about visibility
   - "Cancel" and "Create Announcement" buttons

**Test Cases**:

#### Valid Submission
1. Enter title: "Test Announcement"
2. Enter content: "This is a test announcement with sufficient content."
3. Click "Create Announcement"
4. **Expected**: 
   - Loading spinner appears briefly
   - Success message: "Announcement created successfully!"
   - Redirected to list view
   - New announcement appears at top of list

#### Validation Errors
1. Leave title empty, click submit
   - **Expected**: "Title is required" error
2. Enter title "Test" (too short), click submit
   - **Expected**: "Title must be at least 5 characters" error
3. Enter title with 201 characters, click submit
   - **Expected**: "Title must be less than 200 characters" error
4. Leave content empty, click submit
   - **Expected**: "Content is required" error
5. Enter content "Short" (too short), click submit
   - **Expected**: "Content must be at least 10 characters" error

#### Character Counters
1. Type in title field
   - **Expected**: Counter updates in real-time (e.g., "15/200 characters")
2. Type in content field
   - **Expected**: Counter updates in real-time (e.g., "45/5000 characters")

#### Cancel Action
1. Fill in form partially
2. Click "Cancel"
   - **Expected**: Return to list view without saving

### 4. Edit Announcement
**Steps**:
1. Click "Edit" button on any announcement
2. Verify form displays with:
   - Title: "Edit Announcement"
   - Pre-filled title and content
   - Character counters showing current length
   - "Cancel" and "Update Announcement" buttons

**Test Cases**:
1. Modify title and content
2. Click "Update Announcement"
3. **Expected**:
   - Loading spinner appears briefly
   - Success message: "Announcement updated successfully!"
   - Redirected to list view
   - Announcement shows updated content
   - "Last updated" timestamp appears

### 5. Delete Announcement
**Steps**:
1. Click "Delete" button on any announcement
2. **Expected**: Browser confirmation dialog appears
3. Click "OK" to confirm
4. **Expected**:
   - Button shows "Deleting..." briefly
   - Success message: "Announcement deleted successfully!"
   - Announcement removed from list

**Cancel Deletion**:
1. Click "Delete" button
2. Click "Cancel" in confirmation dialog
3. **Expected**: Announcement remains in list

### 6. Empty State
**Steps**:
1. Delete all announcements
2. **Expected**:
   - Large megaphone icon in center
   - "No announcements yet" heading
   - Descriptive text
   - "Create Your First Announcement" button

### 7. Error Handling
**Simulated Error** (for Phase 12):
- If API call fails, error alert should display:
  - Red alert box
  - Error icon
  - Message: "Failed to create/update/delete announcement. Please try again."

### 8. Responsive Design
**Test on Different Screen Sizes**:
- Desktop (1920x1080): Full layout with proper spacing
- Tablet (768x1024): Responsive cards, buttons stack appropriately
- Mobile (375x667): Single column layout, touch-friendly buttons

### 9. Accessibility Testing
**Keyboard Navigation**:
1. Tab through form fields
   - **Expected**: Proper focus indicators
2. Press Enter in form
   - **Expected**: Form submits
3. Press Escape in form
   - **Expected**: (Future enhancement)

**Screen Reader**:
1. Navigate with screen reader
   - **Expected**: Labels read correctly
   - **Expected**: Error messages announced
   - **Expected**: Required fields indicated

### 10. Dark Mode
**Toggle Dark Mode**:
1. Switch to dark mode
2. **Expected**:
   - All text remains readable
   - Proper contrast maintained
   - Cards have appropriate dark background
   - Buttons styled correctly

## Visual Checklist

### Typography
- [ ] Page title is large and bold
- [ ] Subtitles are muted color
- [ ] Announcement titles are prominent
- [ ] Content text is readable
- [ ] Timestamps are smaller and muted

### Colors
- [ ] Primary button uses theme primary color
- [ ] Destructive actions (delete) use red/destructive color
- [ ] Success messages use green
- [ ] Error messages use red
- [ ] Badges use appropriate colors

### Spacing
- [ ] Consistent padding in cards
- [ ] Proper gaps between elements
- [ ] Form fields have adequate spacing
- [ ] Buttons have proper margins

### Icons
- [ ] Megaphone icon displays correctly
- [ ] Calendar icon displays correctly
- [ ] Edit icon displays correctly
- [ ] Delete icon displays correctly
- [ ] Alert icons display correctly

### Interactions
- [ ] Buttons have hover states
- [ ] Buttons have active states
- [ ] Disabled states are visually distinct
- [ ] Loading spinners animate smoothly
- [ ] Success messages auto-dismiss after 3 seconds

## Known Limitations (Phase 11)
- Uses mock data (not connected to Supabase)
- No real-time updates
- No notification creation
- No authentication checks
- No RLS policy enforcement

These will be addressed in Phase 12 during API integration.

## Browser Compatibility
Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance
- [ ] Page loads quickly
- [ ] Form submission feels responsive (500ms delay)
- [ ] No layout shifts during loading
- [ ] Smooth transitions and animations
