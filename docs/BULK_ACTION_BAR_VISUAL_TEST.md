# Bulk Action Bar - Visual Test Guide

## Test Environment Setup

1. Navigate to the complaints page: `/complaints`
2. Ensure you're logged in as a lecturer or admin (for full functionality)
3. Ensure there are multiple complaints visible in the list

## Visual Test Cases

### Test 1: Selection Mode Activation

**Steps:**
1. Click the "Select" button in the page header
2. Observe checkboxes appear on all complaint cards

**Expected Result:**
- ✅ Checkboxes appear on the left side of each complaint card
- ✅ "Select" button changes state to indicate selection mode is active
- ✅ No bulk action bar visible yet (no items selected)

**Screenshot Location:** `Selection mode activated`

---

### Test 2: Individual Selection

**Steps:**
1. Click checkbox on first complaint
2. Click checkbox on second complaint
3. Observe the bulk action bar appears

**Expected Result:**
- ✅ Selected complaints have highlighted border (primary color with opacity)
- ✅ Bulk action bar appears at bottom center of screen
- ✅ Bar shows "2 complaints selected"
- ✅ Bar displays action buttons

**Screenshot Location:** `Two complaints selected`

---

### Test 3: Select All Functionality

**Steps:**
1. With some items selected, click "Select all X" link in bulk action bar
2. Observe all complaints become selected

**Expected Result:**
- ✅ All visible complaints have checkboxes checked
- ✅ All visible complaints have highlighted borders
- ✅ Bulk action bar updates to show total count
- ✅ "Select all" link changes to only show "Select none"

**Screenshot Location:** `All complaints selected`

---

### Test 4: Bulk Action Bar Layout

**Steps:**
1. Select 3-5 complaints
2. Examine the bulk action bar layout

**Expected Result:**
- ✅ Bar is fixed at bottom center of screen
- ✅ Bar has rounded corners and shadow
- ✅ Selection count is clearly visible on the left
- ✅ "Select all" and "Select none" links are present
- ✅ Vertical divider separates selection info from actions
- ✅ Action buttons are aligned horizontally
- ✅ "Export" dropdown button is visible
- ✅ "Change Status" dropdown button is visible (lecturer/admin)
- ✅ "Assign" button is visible (lecturer/admin)
- ✅ "Add Tags" button is visible (lecturer/admin)
- ✅ "Clear" button is visible on the right

**Screenshot Location:** `Bulk action bar layout`

---

### Test 5: Export Dropdown

**Steps:**
1. Select multiple complaints
2. Click "Export" button in bulk action bar
3. Observe dropdown menu

**Expected Result:**
- ✅ Dropdown menu appears above the button
- ✅ "Export as CSV" option is visible
- ✅ "Export with Attachments" option is visible (if applicable)
- ✅ Clicking outside closes the dropdown

**Screenshot Location:** `Export dropdown menu`

---

### Test 6: Change Status Dropdown

**Steps:**
1. Select multiple complaints (as lecturer/admin)
2. Click "Change Status" button
3. Observe dropdown menu

**Expected Result:**
- ✅ Dropdown menu appears with status options
- ✅ Options include: New, Opened, In Progress, Resolved, Closed
- ✅ Each option is clickable
- ✅ Clicking outside closes the dropdown

**Screenshot Location:** `Change status dropdown`

---

### Test 7: Status Change Confirmation Modal

**Steps:**
1. Select 3 complaints
2. Click "Change Status" → "In Progress"
3. Observe confirmation modal

**Expected Result:**
- ✅ Modal appears centered on screen
- ✅ Modal has warning icon (orange)
- ✅ Title reads "Change Status"
- ✅ Description explains the action
- ✅ Highlighted box shows "3 complaints" will be affected
- ✅ "Cancel" button is present
- ✅ "Confirm" button is present
- ✅ Modal has backdrop overlay

**Screenshot Location:** `Status change confirmation modal`

---

### Test 8: Assignment Modal

**Steps:**
1. Select multiple complaints (as lecturer/admin)
2. Click "Assign" button
3. Observe assignment modal

**Expected Result:**
- ✅ Modal appears centered on screen
- ✅ Modal has user icon (primary color)
- ✅ Title reads "Assign Complaints"
- ✅ Description shows number of complaints
- ✅ Dropdown selector for lecturers is present
- ✅ Information box explains notifications and history
- ✅ "Cancel" button is present
- ✅ "Assign Complaints" button is present (disabled until selection)

**Screenshot Location:** `Assignment modal`

---

### Test 9: Assignment Modal - Lecturer Selection

**Steps:**
1. Open assignment modal
2. Click the lecturer dropdown
3. Select a lecturer

**Expected Result:**
- ✅ Dropdown opens showing available lecturers
- ✅ Lecturer names are clearly visible
- ✅ Selected lecturer appears in the dropdown trigger
- ✅ "Assign Complaints" button becomes enabled

**Screenshot Location:** `Lecturer selection in assignment modal`

---

### Test 10: Tag Addition Modal

**Steps:**
1. Select multiple complaints (as lecturer/admin)
2. Click "Add Tags" button
3. Observe tag addition modal

**Expected Result:**
- ✅ Modal appears centered on screen
- ✅ Modal has tag icon (primary color)
- ✅ Title reads "Add Tags to Complaints"
- ✅ Description shows number of complaints
- ✅ Input field for tags is present
- ✅ Placeholder text: "Type a tag and press Enter"
- ✅ Information box explains tag behavior
- ✅ "Cancel" button is present
- ✅ "Add Tags" button is present (disabled until tags added)

**Screenshot Location:** `Tag addition modal`

---

### Test 11: Tag Addition - Input and Suggestions

**Steps:**
1. Open tag addition modal
2. Type "ur" in the input field
3. Observe suggestions appear

**Expected Result:**
- ✅ Suggestions dropdown appears below input
- ✅ Matching tags are shown (e.g., "urgent")
- ✅ Clicking a suggestion adds it
- ✅ Input clears after adding tag

**Screenshot Location:** `Tag suggestions`

---

### Test 12: Tag Addition - Selected Tags Display

**Steps:**
1. Open tag addition modal
2. Add 3-4 tags
3. Observe selected tags display

**Expected Result:**
- ✅ "Selected Tags (X)" label appears
- ✅ Tags are displayed as badges
- ✅ Each badge has an X button to remove
- ✅ Clicking X removes the tag
- ✅ "Add Tags" button shows count: "Add Tags to X Complaints"

**Screenshot Location:** `Selected tags display`

---

### Test 13: Export Progress Indicator

**Steps:**
1. Select multiple complaints
2. Click "Export" → "Export as CSV"
3. Observe progress indicator

**Expected Result:**
- ✅ Progress bar appears below the action buttons
- ✅ Progress bar shows percentage
- ✅ Status message updates during export
- ✅ Messages like "Preparing export...", "Generating CSV file...", "Export complete!"
- ✅ Progress bar fills from 0% to 100%
- ✅ Action buttons are disabled during export

**Screenshot Location:** `Export progress indicator`

---

### Test 14: Loading States

**Steps:**
1. Select complaints and initiate any bulk action
2. Observe loading states during execution

**Expected Result:**
- ✅ Buttons show "Processing..." or similar text
- ✅ Buttons are disabled during operation
- ✅ Modal buttons show "Assigning..." or "Adding Tags..."
- ✅ Cursor shows loading state
- ✅ No interaction possible during loading

**Screenshot Location:** `Loading states`

---

### Test 15: Clear Selection

**Steps:**
1. Select multiple complaints
2. Click "Clear" button in bulk action bar
3. Observe selection cleared

**Expected Result:**
- ✅ All checkboxes become unchecked
- ✅ Highlighted borders disappear from complaints
- ✅ Bulk action bar disappears
- ✅ Selection mode remains active (checkboxes still visible)

**Screenshot Location:** `Selection cleared`

---

### Test 16: Select None Link

**Steps:**
1. Select all complaints
2. Click "Select none" link in bulk action bar
3. Observe selection cleared

**Expected Result:**
- ✅ All checkboxes become unchecked
- ✅ Bulk action bar disappears
- ✅ Selection mode exits (checkboxes disappear)

**Screenshot Location:** `Select none functionality`

---

### Test 17: Role-Based Visibility (Student)

**Steps:**
1. Log in as a student
2. Enable selection mode
3. Select complaints
4. Observe bulk action bar

**Expected Result:**
- ✅ Only "Export" button is visible
- ✅ "Change Status" button is NOT visible
- ✅ "Assign" button is NOT visible
- ✅ "Add Tags" button is NOT visible
- ✅ Selection controls work normally

**Screenshot Location:** `Student view - limited actions`

---

### Test 18: Role-Based Visibility (Lecturer/Admin)

**Steps:**
1. Log in as lecturer or admin
2. Enable selection mode
3. Select complaints
4. Observe bulk action bar

**Expected Result:**
- ✅ "Export" button is visible
- ✅ "Change Status" button is visible
- ✅ "Assign" button is visible
- ✅ "Add Tags" button is visible
- ✅ All actions are functional

**Screenshot Location:** `Lecturer/Admin view - all actions`

---

### Test 19: Responsive Design - Mobile

**Steps:**
1. Resize browser to mobile width (375px)
2. Enable selection mode
3. Select complaints
4. Observe bulk action bar

**Expected Result:**
- ✅ Bulk action bar adapts to narrow width
- ✅ Buttons may stack or use smaller text
- ✅ All functionality remains accessible
- ✅ Touch targets are appropriately sized

**Screenshot Location:** `Mobile responsive view`

---

### Test 20: Dark Mode

**Steps:**
1. Enable dark mode
2. Select complaints
3. Observe bulk action bar and modals

**Expected Result:**
- ✅ Bulk action bar uses dark theme colors
- ✅ Text is readable with proper contrast
- ✅ Modals use dark theme
- ✅ Dropdowns use dark theme
- ✅ All interactive elements are visible

**Screenshot Location:** `Dark mode appearance`

---

## Accessibility Tests

### Test A1: Keyboard Navigation

**Steps:**
1. Use Tab key to navigate through bulk action bar
2. Use Enter/Space to activate buttons
3. Use Arrow keys in dropdowns

**Expected Result:**
- ✅ All interactive elements are keyboard accessible
- ✅ Focus indicators are visible
- ✅ Tab order is logical
- ✅ Dropdowns can be navigated with keyboard

---

### Test A2: Screen Reader

**Steps:**
1. Enable screen reader
2. Navigate to bulk action bar
3. Listen to announcements

**Expected Result:**
- ✅ Selection count is announced
- ✅ Button labels are clear
- ✅ Modal titles and descriptions are announced
- ✅ Form fields have proper labels

---

### Test A3: ARIA Attributes

**Steps:**
1. Inspect bulk action bar elements
2. Check for ARIA attributes

**Expected Result:**
- ✅ Checkboxes have aria-label
- ✅ Buttons have aria-label where needed
- ✅ Modals have aria-labelledby and aria-describedby
- ✅ Dropdowns have proper ARIA roles

---

## Performance Tests

### Test P1: Large Selection

**Steps:**
1. Select 50+ complaints
2. Perform bulk action
3. Observe performance

**Expected Result:**
- ✅ Selection is responsive
- ✅ Bulk action bar updates quickly
- ✅ No lag or freezing
- ✅ Action completes in reasonable time

---

### Test P2: Rapid Selection Changes

**Steps:**
1. Rapidly click multiple checkboxes
2. Quickly select all then clear
3. Observe responsiveness

**Expected Result:**
- ✅ UI remains responsive
- ✅ No visual glitches
- ✅ State updates correctly

---

## Edge Cases

### Test E1: No Complaints Available

**Steps:**
1. Filter complaints to show none
2. Enable selection mode

**Expected Result:**
- ✅ No checkboxes appear (no complaints to select)
- ✅ No bulk action bar appears
- ✅ No errors occur

---

### Test E2: Single Complaint Selection

**Steps:**
1. Select only one complaint
2. Observe bulk action bar

**Expected Result:**
- ✅ Bar shows "1 complaint selected" (singular)
- ✅ All actions work with single selection
- ✅ Confirmation modals show "1 complaint"

---

### Test E3: Modal Cancellation

**Steps:**
1. Open any bulk action modal
2. Click "Cancel" or click outside modal
3. Observe modal closes

**Expected Result:**
- ✅ Modal closes without executing action
- ✅ Selection remains intact
- ✅ No changes are made

---

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Selection Mode | ⏳ Pending | |
| Individual Selection | ⏳ Pending | |
| Select All | ⏳ Pending | |
| Bar Layout | ⏳ Pending | |
| Export Dropdown | ⏳ Pending | |
| Status Dropdown | ⏳ Pending | |
| Status Confirmation | ⏳ Pending | |
| Assignment Modal | ⏳ Pending | |
| Tag Addition Modal | ⏳ Pending | |
| Progress Indicator | ⏳ Pending | |
| Loading States | ⏳ Pending | |
| Clear Selection | ⏳ Pending | |
| Role-Based (Student) | ⏳ Pending | |
| Role-Based (Lecturer) | ⏳ Pending | |
| Responsive Mobile | ⏳ Pending | |
| Dark Mode | ⏳ Pending | |
| Keyboard Navigation | ⏳ Pending | |
| Screen Reader | ⏳ Pending | |
| Large Selection | ⏳ Pending | |
| Edge Cases | ⏳ Pending | |

## Notes

- All tests should be performed in both light and dark mode
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on different screen sizes (mobile, tablet, desktop)
- Document any issues found with screenshots
- Verify fixes after addressing issues

## Sign-off

- [ ] All visual tests passed
- [ ] All accessibility tests passed
- [ ] All performance tests passed
- [ ] All edge cases handled
- [ ] Documentation updated
- [ ] Ready for production

**Tester:** _______________
**Date:** _______________
**Signature:** _______________
