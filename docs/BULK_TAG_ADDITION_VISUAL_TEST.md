# Bulk Tag Addition - Visual Test Guide

## Overview
This guide helps you visually test the bulk tag addition feature for complaints.

## Prerequisites
- Logged in as a lecturer or admin user
- Multiple complaints exist in the system
- Some complaints already have tags

## Test Scenarios

### Scenario 1: Basic Bulk Tag Addition

**Steps:**
1. Navigate to `/complaints` page
2. Click "Select" button in the header to enter selection mode
3. Select 2-3 complaints by clicking their checkboxes
4. Observe the bulk action bar appears at the bottom of the screen
5. Click "Add Tags" button in the bulk action bar
6. Modal opens with title "Add Tags to Complaints"

**Expected UI:**
```
┌─────────────────────────────────────────────────┐
│  🏷️  Add Tags to Complaints                     │
│                                                  │
│  Add tags to 3 complaints. Tags help organize   │
│  and categorize complaints.                      │
│                                                  │
│  Tags                                            │
│  ┌──────────────────────────────────────────┐  │
│  │ Type a tag and press Enter               │  │
│  └──────────────────────────────────────────┘  │
│  Press Enter to add a tag. Click on             │
│  suggestions to add them quickly.               │
│                                                  │
│  [Cancel]  [Add Tags to 3 Complaints]          │
└─────────────────────────────────────────────────┘
```

### Scenario 2: Adding Tags with Autocomplete

**Steps:**
1. In the tag input field, type "ur" (partial tag name)
2. Observe autocomplete suggestions appear below the input
3. Suggestions might include: "urgent", "urgent-fix", etc.
4. Click on "urgent" from the suggestions
5. Tag is added to the selected tags list

**Expected UI:**
```
Tags
┌──────────────────────────────────────────┐
│ ur                                       │
└──────────────────────────────────────────┘
  ┌────────────────────────────────────┐
  │ urgent                             │  ← Click to add
  │ urgent-fix                         │
  └────────────────────────────────────┘

Selected Tags (1)
┌─────────────────────────────────────┐
│ [urgent] ×                          │
└─────────────────────────────────────┘
```

### Scenario 3: Adding Multiple Tags

**Steps:**
1. Type "facilities" and press Enter
2. Type "high-priority" and press Enter
3. Type "maintenance" and press Enter
4. Observe all tags appear as badges in the "Selected Tags" section
5. Each badge has an × button to remove it

**Expected UI:**
```
Selected Tags (4)
┌─────────────────────────────────────────────────┐
│ [urgent] ×  [facilities] ×  [high-priority] ×  │
│ [maintenance] ×                                 │
└─────────────────────────────────────────────────┘

ℹ️ These tags will be added to all selected 
   complaints. Existing tags on each complaint 
   will be preserved.
```

### Scenario 4: Removing Tags Before Submission

**Steps:**
1. Click the × button on the "high-priority" tag
2. Tag is removed from the selected tags list
3. Count updates to show 3 tags

**Expected UI:**
```
Selected Tags (3)
┌─────────────────────────────────────────────────┐
│ [urgent] ×  [facilities] ×  [maintenance] ×     │
└─────────────────────────────────────────────────┘
```

### Scenario 5: Submitting Bulk Tag Addition

**Steps:**
1. Click "Add Tags to 3 Complaints" button
2. Button shows loading state: "Adding Tags..."
3. Modal closes after successful operation
4. Bulk action bar shows success message (console.log for now)
5. Selection is cleared
6. Selection mode exits

**Expected Console Output:**
```
Successfully added tags to 3 complaint(s)
```

### Scenario 6: Viewing Added Tags

**Steps:**
1. Click on one of the complaints that had tags added
2. Navigate to complaint detail page
3. Scroll to the tags section
4. Verify the new tags appear alongside existing tags

**Expected UI:**
```
Tags
┌─────────────────────────────────────────────────┐
│ [air-conditioning]  [lecture-hall]  [urgent]   │
│ [facilities]  [maintenance]                     │
└─────────────────────────────────────────────────┘
```

### Scenario 7: Duplicate Tag Prevention

**Steps:**
1. Select a complaint that already has "urgent" tag
2. Enter selection mode and select that complaint
3. Click "Add Tags"
4. Add "urgent" tag again
5. Submit the form
6. Check complaint detail - "urgent" should only appear once

**Expected Behavior:**
- API detects existing tag
- Does not insert duplicate
- Returns success (since tag already exists)
- No duplicate tags in UI

### Scenario 8: History Logging

**Steps:**
1. After adding tags, view complaint detail page
2. Scroll to the timeline/history section
3. Look for "tags_added" action

**Expected History Entry:**
```
🏷️ Tags Added
   By: Dr. Smith
   Old: air-conditioning, lecture-hall
   New: air-conditioning, lecture-hall, urgent, facilities, maintenance
   Details: Added tags: urgent, facilities, maintenance (bulk action)
   2 minutes ago
```

## Bulk Action Bar States

### No Selection
```
(Bulk action bar is hidden)
```

### With Selection
```
┌─────────────────────────────────────────────────────────────┐
│  3 complaints selected  Select all 8 • Select none  │       │
│  [Export ▼]  [Change Status ▼]  [Assign]  [Add Tags]  [×]  │
└─────────────────────────────────────────────────────────────┘
```

### During Export/Loading
```
┌─────────────────────────────────────────────────────────────┐
│  3 complaints selected  Select all 8 • Select none  │       │
│  [Export ▼]  [Change Status ▼]  [Assign]  [Add Tags]  [×]  │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50% - Adding tags...                 │
└─────────────────────────────────────────────────────────────┘
```

## Error Scenarios

### Scenario 9: No Tags Entered

**Steps:**
1. Open bulk tag addition modal
2. Don't add any tags
3. Try to click submit button

**Expected Behavior:**
- Submit button is disabled
- Button text: "Add Tags to 3 Complaints" (grayed out)

### Scenario 10: Invalid Complaint

**Steps:**
1. Select complaints including one with invalid ID (simulated)
2. Add tags and submit
3. Check console for error messages

**Expected Console Output:**
```
Successfully added tags to 2 complaint(s)
Failed to add tags to 1 complaint(s): ["Complaint invalid-id: Not found"]
```

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all form elements
- [ ] Press Enter to add tags
- [ ] Press Escape to close modal
- [ ] Use arrow keys in autocomplete suggestions

### Screen Reader
- [ ] Modal announces title and description
- [ ] Input field has proper label
- [ ] Selected tags are announced
- [ ] Button states are announced (disabled/loading)

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Testing

### Large Selection
1. Select 50+ complaints
2. Add multiple tags
3. Verify operation completes without timeout
4. Check for any UI lag or freezing

### Many Tags
1. Add 10+ tags to selected complaints
2. Verify all tags are processed
3. Check complaint detail page loads properly with many tags

## Visual Regression Checklist

- [ ] Modal appears centered on screen
- [ ] Modal is responsive on mobile devices
- [ ] Tags wrap properly when many are selected
- [ ] Autocomplete dropdown doesn't overflow screen
- [ ] Bulk action bar stays at bottom of viewport
- [ ] Loading states show proper animations
- [ ] Success/error messages are visible

## Integration Points to Verify

1. **Filter Panel**: Tags added should appear in tag filter options
2. **Search**: Complaints should be searchable by new tags
3. **Export**: Exported CSV should include new tags
4. **Analytics**: Tag statistics should update

## Known Limitations (Mock Data)

⚠️ **Note**: Currently using mock data, so:
- Changes don't persist on page refresh
- Real-time updates don't work
- Notifications are not sent
- History is logged but not visible in UI yet

These will be addressed in Phase 12 (API Integration).

## Success Criteria

✅ All scenarios pass without errors
✅ UI is responsive and intuitive
✅ No duplicate tags are created
✅ History is properly logged
✅ Selection is cleared after operation
✅ Error messages are clear and helpful
✅ Keyboard navigation works smoothly
✅ Mobile experience is good

## Next Steps After Testing

1. Implement toast notifications for better feedback
2. Add real-time complaint list refresh
3. Connect to live database in Phase 12
4. Add bulk tag removal feature
5. Improve tag autocomplete with usage frequency
