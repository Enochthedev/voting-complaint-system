# Bulk Export Visual Test Guide

## Purpose

This guide helps verify that the bulk export feature is working correctly through visual and functional testing.

## Test Environment

- **Page**: `/complaints`
- **User Roles**: All roles (student, lecturer, admin)
- **Prerequisites**: Multiple complaints should exist in the system

## Test Scenarios

### Scenario 1: Entering Selection Mode

**Steps:**

1. Navigate to `/complaints` page
2. Locate the "Select" button in the header (next to "Export CSV" or "New Complaint")
3. Click the "Select" button

**Expected Results:**

- ✅ Button text changes from "Select" to "Cancel"
- ✅ Button style changes to secondary variant
- ✅ Header description changes to "Select complaints to export"
- ✅ Checkboxes appear next to each complaint title
- ✅ "Export CSV" button in header is hidden (for lecturers/admins)
- ✅ Clicking on a complaint now selects it instead of navigating

**Visual Reference:**

```
Before Selection Mode:
┌─────────────────────────────────────────────────┐
│ All Complaints                    [Export CSV]  │
│ View and manage all student complaints [Select] │
└─────────────────────────────────────────────────┘

After Selection Mode:
┌─────────────────────────────────────────────────┐
│ All Complaints                         [Cancel] │
│ Select complaints to export                     │
└─────────────────────────────────────────────────┘
```

### Scenario 2: Selecting Individual Complaints

**Steps:**

1. Enter selection mode (see Scenario 1)
2. Click on a complaint item or its checkbox
3. Click on another complaint item
4. Click on the first complaint again

**Expected Results:**

- ✅ First click: Complaint gets selected (checkbox checked, blue border/background)
- ✅ Second click: Another complaint gets selected
- ✅ Third click: First complaint gets deselected (checkbox unchecked, normal appearance)
- ✅ Bulk action bar appears at bottom when at least one item is selected
- ✅ Bulk action bar shows correct count (e.g., "2 complaints selected")

**Visual Reference:**

```
Selected Complaint:
┌─────────────────────────────────────────────────┐
│ [✓] Broken Air Conditioning in Lecture Hall A  │ ← Blue border
│     The air conditioning system...              │ ← Light blue bg
│     🔴 High • 📄 Facilities • 2 hours ago      │
└─────────────────────────────────────────────────┘

Unselected Complaint:
┌─────────────────────────────────────────────────┐
│ [ ] Library WiFi Connection Issues              │ ← Normal border
│     The WiFi in the library keeps...            │ ← Normal bg
│     🟡 Medium • 📄 Facilities • 3 days ago     │
└─────────────────────────────────────────────────┘
```

### Scenario 3: Bulk Action Bar Appearance

**Steps:**

1. Enter selection mode
2. Select 1 complaint
3. Select 2 more complaints (3 total)
4. Deselect all complaints

**Expected Results:**

- ✅ Bar appears at bottom center when first complaint is selected
- ✅ Bar shows "1 complaint selected" initially
- ✅ Count updates to "3 complaints selected" after selecting more
- ✅ "Select all X" button is visible (if not all are selected)
- ✅ Bar disappears when all complaints are deselected
- ✅ Bar has shadow and rounded corners
- ✅ Bar is positioned above the page footer

**Visual Reference:**

```
Bulk Action Bar:
┌─────────────────────────────────────────────────────────────┐
│  3 complaints selected  [Select all 8]  │  [Export CSV]  [Clear]  │
└─────────────────────────────────────────────────────────────┘
     ↑ Count              ↑ Select all    ↑ Actions
```

### Scenario 4: Select All Functionality

**Steps:**

1. Enter selection mode
2. Select 2 complaints manually
3. Click "Select all X" button in bulk action bar
4. Verify all complaints are selected

**Expected Results:**

- ✅ All visible complaints get selected (checkboxes checked)
- ✅ All complaints show selected styling (blue border/background)
- ✅ Count shows total number (e.g., "8 complaints selected")
- ✅ "Select all" button disappears (since all are selected)

### Scenario 5: Exporting Selected Complaints

**Steps:**

1. Enter selection mode
2. Select 3 specific complaints
3. Click "Export CSV" button in bulk action bar
4. Check downloads folder

**Expected Results:**

- ✅ CSV file is downloaded
- ✅ Filename format: `complaints_selected_YYYY-MM-DD.csv`
- ✅ CSV contains exactly 3 complaints (the ones selected)
- ✅ CSV has all expected columns (ID, Title, Status, Priority, etc.)
- ✅ Selection is cleared after export
- ✅ Selection mode is exited automatically
- ✅ Page returns to normal view

**CSV Content Verification:**

```csv
ID,Title,Status,Priority,Category,...
1,Broken Air Conditioning in Lecture Hall A,New,High,Facilities,...
3,Library WiFi Connection Issues,In Progress,Medium,Facilities,...
5,Parking Lot Lighting Safety Concern,Opened,Critical,Facilities,...
```

### Scenario 6: Clearing Selection

**Steps:**

1. Enter selection mode
2. Select 4 complaints
3. Click "Clear" button in bulk action bar

**Expected Results:**

- ✅ All complaints are deselected
- ✅ Checkboxes are unchecked
- ✅ Selected styling is removed
- ✅ Bulk action bar disappears
- ✅ Selection mode is exited
- ✅ Page returns to normal view

### Scenario 7: Canceling Selection Mode

**Steps:**

1. Enter selection mode
2. Select 2 complaints
3. Click "Cancel" button in header

**Expected Results:**

- ✅ Selection mode is exited
- ✅ All selections are cleared
- ✅ Checkboxes disappear
- ✅ Bulk action bar disappears
- ✅ Header returns to normal state
- ✅ "Cancel" button changes back to "Select"
- ✅ "Export CSV" button reappears (for lecturers/admins)

### Scenario 8: Selection Across Pages

**Steps:**

1. Enter selection mode
2. Select 2 complaints on page 1
3. Navigate to page 2
4. Select 1 complaint on page 2
5. Navigate back to page 1

**Expected Results:**

- ✅ Selections on page 1 are maintained when returning
- ✅ Total count includes selections from all pages
- ✅ Bulk action bar shows correct total count
- ✅ Export includes complaints from all pages

### Scenario 9: Selection with Filters

**Steps:**

1. Apply a status filter (e.g., "New" only)
2. Enter selection mode
3. Click "Select all"
4. Change filter to show different complaints
5. Check bulk action bar

**Expected Results:**

- ✅ "Select all" only selects filtered complaints
- ✅ Changing filters doesn't clear existing selections
- ✅ Count reflects total selections (may include hidden items)
- ✅ Export includes all selected items, even if filtered out

### Scenario 10: Mobile Responsiveness

**Steps:**

1. Resize browser to mobile width (< 640px)
2. Enter selection mode
3. Select complaints
4. Check bulk action bar

**Expected Results:**

- ✅ Checkboxes are appropriately sized for touch
- ✅ Bulk action bar adapts to mobile width
- ✅ Buttons in bulk action bar are touch-friendly
- ✅ No horizontal scrolling required
- ✅ All functionality works on mobile

## Visual Checklist

### Colors and Styling

- [ ] Selected items have blue border (`border-primary`)
- [ ] Selected items have light blue background (`bg-primary/5`)
- [ ] Checkboxes are properly aligned with titles
- [ ] Bulk action bar has shadow and rounded corners
- [ ] Buttons have proper hover states
- [ ] Focus states are visible for accessibility

### Layout

- [ ] Checkboxes don't break complaint card layout
- [ ] Bulk action bar doesn't overlap content
- [ ] Bulk action bar is centered horizontally
- [ ] Bulk action bar is positioned above footer
- [ ] Header buttons are properly aligned

### Interactions

- [ ] Clicking complaint in selection mode selects it
- [ ] Clicking checkbox toggles selection
- [ ] Clicking outside checkbox doesn't navigate
- [ ] All buttons respond to clicks
- [ ] Loading states show during export

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Testing

- [ ] Checkboxes have proper `aria-label` attributes
- [ ] Keyboard navigation works (Tab, Space, Enter)
- [ ] Focus indicators are visible
- [ ] Screen reader announces selection state
- [ ] Color contrast meets WCAG standards

## Performance Testing

- [ ] Selection of 50+ complaints is smooth
- [ ] Export of 100+ complaints completes successfully
- [ ] No memory leaks when toggling selection mode
- [ ] Page remains responsive during export

## Edge Cases

### Empty State

- [ ] Selection mode works when no complaints exist
- [ ] Bulk action bar handles 0 selections gracefully

### Single Complaint

- [ ] "Select all" works with only 1 complaint
- [ ] Export works with single selection

### All Complaints Selected

- [ ] "Select all" button disappears when all are selected
- [ ] Deselecting one shows "Select all" button again

### Export During Loading

- [ ] Export button is disabled during export
- [ ] Multiple clicks don't trigger multiple exports
- [ ] Loading state is shown

## Known Issues

None at this time.

## Success Criteria

All test scenarios pass with expected results. The feature should:

1. ✅ Allow users to enter/exit selection mode
2. ✅ Support selecting individual complaints
3. ✅ Support selecting all complaints
4. ✅ Show visual feedback for selections
5. ✅ Display bulk action bar with correct count
6. ✅ Export only selected complaints to CSV
7. ✅ Clear selections after export
8. ✅ Work across pagination
9. ✅ Be responsive on mobile devices
10. ✅ Be accessible via keyboard and screen readers

## Notes

- This feature complements the existing "Export CSV" button which exports all filtered complaints
- Selection state is maintained in component state (not persisted to URL or storage)
- Export uses the existing `exportComplaintsToCSV` utility function
- The feature is available to all user roles (student, lecturer, admin)
