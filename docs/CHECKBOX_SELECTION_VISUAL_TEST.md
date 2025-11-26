# Checkbox Selection - Visual Test Guide

## 🎯 Purpose
This guide provides step-by-step instructions to visually test the checkbox selection functionality in the complaint list.

---

## 🚀 Getting Started

### Prerequisites:
1. Application is running (`npm run dev`)
2. Navigate to `/complaints` page
3. Ensure you have some complaints visible (mock data is available)

---

## 📋 Test Scenarios

### Test 1: Enter Selection Mode

**Steps:**
1. Navigate to `/complaints` page
2. Look for the "Select" button in the top-right corner
3. Click the "Select" button

**Expected Results:**
- ✅ Button changes from "Select" to "Cancel"
- ✅ Button style changes from outline to secondary
- ✅ Icon changes from CheckSquare to X
- ✅ Page description changes to "Select complaints to export"
- ✅ Checkboxes appear on the left side of each complaint card
- ✅ All checkboxes are initially unchecked

**Visual Reference:**
```
Before:
┌─────────────────────────────────────────────┐
│ My Complaints                    [Select]   │
│ View and manage your submitted complaints   │
└─────────────────────────────────────────────┘

After:
┌─────────────────────────────────────────────┐
│ My Complaints                    [Cancel]   │
│ Select complaints to export                 │
└─────────────────────────────────────────────┘

Complaint Cards:
┌─────────────────────────────────────────────┐
│ [ ] Broken Air Conditioning...       [New]  │
│     The air conditioning system...          │
└─────────────────────────────────────────────┘
```

---

### Test 2: Select Individual Complaints

**Steps:**
1. Ensure selection mode is active
2. Click the checkbox on the first complaint
3. Click the checkbox on the second complaint
4. Click the checkbox on the third complaint

**Expected Results:**
- ✅ Each clicked checkbox becomes checked
- ✅ Selected complaint cards show visual feedback:
  - Border color changes to primary color
  - Background has subtle primary color tint
- ✅ BulkActionBar appears at the bottom of the screen
- ✅ BulkActionBar shows correct count: "3 complaints selected"
- ✅ "Select all" link appears if not all complaints are selected

**Visual Reference:**
```
Selected Complaint Card:
┌─────────────────────────────────────────────┐
│ [✓] Broken Air Conditioning...       [New]  │ ← Blue border
│     The air conditioning system...          │ ← Light blue bg
└─────────────────────────────────────────────┘

Bulk Action Bar (bottom of screen):
┌─────────────────────────────────────────────┐
│ 3 complaints selected  │  Select all 8      │
│ ──────────────────────────────────────────  │
│ [Export CSV]  [Clear]                       │
└─────────────────────────────────────────────┘
```

---

### Test 3: Deselect Individual Complaints

**Steps:**
1. With some complaints selected, click a checked checkbox
2. Observe the changes

**Expected Results:**
- ✅ Checkbox becomes unchecked
- ✅ Visual feedback removed (border and background return to normal)
- ✅ BulkActionBar count decreases
- ✅ If all deselected, BulkActionBar disappears

**Visual Reference:**
```
Before: [✓] 3 complaints selected
After:  [✓] 2 complaints selected

If all deselected:
BulkActionBar disappears completely
```

---

### Test 4: Select All Functionality

**Steps:**
1. Select 1-2 complaints (not all)
2. Look for "Select all X" link in BulkActionBar
3. Click the "Select all" link

**Expected Results:**
- ✅ All complaint checkboxes become checked
- ✅ All complaint cards show selection visual feedback
- ✅ BulkActionBar count shows total: "8 complaints selected"
- ✅ "Select all" link disappears (since all are selected)

**Visual Reference:**
```
Before:
┌─────────────────────────────────────────────┐
│ 2 complaints selected  │  Select all 8      │ ← Link visible
└─────────────────────────────────────────────┘

After:
┌─────────────────────────────────────────────┐
│ 8 complaints selected                       │ ← Link hidden
│ ──────────────────────────────────────────  │
│ [Export CSV]  [Clear]                       │
└─────────────────────────────────────────────┘
```

---

### Test 5: Bulk Export

**Steps:**
1. Select 2-3 complaints
2. Click "Export CSV" button in BulkActionBar
3. Observe the export process

**Expected Results:**
- ✅ Progress bar appears in BulkActionBar
- ✅ Progress message shows: "Preparing export..."
- ✅ Progress updates: "Preparing X complaints for export..."
- ✅ Progress updates: "Generating CSV file..."
- ✅ Progress reaches 100%
- ✅ CSV file downloads automatically
- ✅ Filename format: `complaints_selected_YYYY-MM-DD.csv`
- ✅ After completion:
  - Selection cleared
  - Selection mode exits
  - BulkActionBar disappears
  - Checkboxes hidden

**Visual Reference:**
```
During Export:
┌─────────────────────────────────────────────┐
│ 3 complaints selected                       │
│ ──────────────────────────────────────────  │
│ [Exporting...]  [Clear]                     │
│                                             │
│ ████████████████░░░░░░░░░░  60%            │
│ Generating CSV file...                      │
└─────────────────────────────────────────────┘

After Export:
- BulkActionBar disappears
- Checkboxes hidden
- Normal view restored
```

---

### Test 6: Clear Selection

**Steps:**
1. Select several complaints
2. Click "Clear" button in BulkActionBar

**Expected Results:**
- ✅ All checkboxes become unchecked
- ✅ Visual feedback removed from all cards
- ✅ BulkActionBar disappears
- ✅ Selection mode exits
- ✅ Checkboxes hidden
- ✅ "Select" button appears in header

**Visual Reference:**
```
Before:
- Checkboxes visible
- Some checked
- BulkActionBar visible

After:
- Checkboxes hidden
- Normal view
- "Select" button in header
```

---

### Test 7: Cancel Selection Mode

**Steps:**
1. Enter selection mode
2. Select some complaints
3. Click "Cancel" button in header

**Expected Results:**
- ✅ All selections cleared
- ✅ Checkboxes hidden
- ✅ BulkActionBar disappears
- ✅ Button changes back to "Select"
- ✅ Description returns to normal
- ✅ All visual feedback removed

**Visual Reference:**
```
Same as Test 6 - complete reset to normal view
```

---

### Test 8: Selection with Filters

**Steps:**
1. Apply a status filter (e.g., "New")
2. Enter selection mode
3. Select all visible complaints
4. Change filter (e.g., to "In Progress")

**Expected Results:**
- ✅ Selection persists for previously selected items
- ✅ New filtered items are not selected
- ✅ BulkActionBar count remains accurate
- ✅ Only previously selected items show visual feedback

**Note:** This tests that selection state is maintained across filter changes.

---

### Test 9: Selection with Pagination

**Steps:**
1. Ensure you have multiple pages of complaints
2. Enter selection mode
3. Select complaints on page 1
4. Navigate to page 2
5. Select complaints on page 2
6. Navigate back to page 1

**Expected Results:**
- ✅ Selections on page 1 are preserved
- ✅ BulkActionBar shows total count across all pages
- ✅ "Select all" selects all complaints (not just current page)

---

### Test 10: Responsive Design

**Steps:**
1. Test on desktop (wide screen)
2. Test on tablet (medium screen)
3. Test on mobile (narrow screen)

**Expected Results:**

**Desktop:**
- ✅ BulkActionBar centered at bottom
- ✅ All buttons visible in one row
- ✅ Progress bar full width

**Tablet:**
- ✅ BulkActionBar adapts to width
- ✅ Buttons may wrap if needed
- ✅ Still easily accessible

**Mobile:**
- ✅ BulkActionBar full width
- ✅ Buttons stack vertically if needed
- ✅ Touch-friendly checkbox size
- ✅ Easy to tap checkboxes

---

### Test 11: Accessibility

**Steps:**
1. Use keyboard navigation (Tab key)
2. Use screen reader (if available)
3. Check focus indicators

**Expected Results:**
- ✅ Can tab to "Select" button
- ✅ Can tab to each checkbox
- ✅ Can tab to BulkActionBar buttons
- ✅ Space bar toggles checkboxes
- ✅ Enter key activates buttons
- ✅ Focus indicators visible
- ✅ Checkboxes have aria-labels
- ✅ Screen reader announces selection state

---

## 🐛 Common Issues to Check

### Issue 1: Checkboxes Not Appearing
**Check:**
- Selection mode is active
- `selectionMode` prop is true
- ComplaintList component receives prop

### Issue 2: Selection Not Working
**Check:**
- `onSelectionChange` callback is provided
- State updates are triggering re-renders
- Set is being updated immutably

### Issue 3: BulkActionBar Not Showing
**Check:**
- At least one item is selected
- `selectedIds.size > 0`
- Component is rendered in page

### Issue 4: Visual Feedback Not Showing
**Check:**
- CSS classes are applied correctly
- `isSelected` prop is true for selected items
- Tailwind classes are not being purged

### Issue 5: Export Not Working
**Check:**
- Export function is called
- Selected complaints are filtered correctly
- CSV generation is working
- Browser allows downloads

---

## ✅ Test Completion Checklist

- [ ] Test 1: Enter Selection Mode
- [ ] Test 2: Select Individual Complaints
- [ ] Test 3: Deselect Individual Complaints
- [ ] Test 4: Select All Functionality
- [ ] Test 5: Bulk Export
- [ ] Test 6: Clear Selection
- [ ] Test 7: Cancel Selection Mode
- [ ] Test 8: Selection with Filters
- [ ] Test 9: Selection with Pagination
- [ ] Test 10: Responsive Design
- [ ] Test 11: Accessibility

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________
Browser: _______________
Device: _______________

Test Results:
✅ Test 1: PASS / FAIL - Notes: _______________
✅ Test 2: PASS / FAIL - Notes: _______________
✅ Test 3: PASS / FAIL - Notes: _______________
✅ Test 4: PASS / FAIL - Notes: _______________
✅ Test 5: PASS / FAIL - Notes: _______________
✅ Test 6: PASS / FAIL - Notes: _______________
✅ Test 7: PASS / FAIL - Notes: _______________
✅ Test 8: PASS / FAIL - Notes: _______________
✅ Test 9: PASS / FAIL - Notes: _______________
✅ Test 10: PASS / FAIL - Notes: _______________
✅ Test 11: PASS / FAIL - Notes: _______________

Overall Status: PASS / FAIL
Issues Found: _______________
```

---

## 🎉 Success Criteria

All tests should pass with:
- ✅ Smooth transitions and animations
- ✅ Clear visual feedback
- ✅ Intuitive user experience
- ✅ No console errors
- ✅ Responsive on all devices
- ✅ Accessible via keyboard and screen readers

---

**Happy Testing! 🚀**
