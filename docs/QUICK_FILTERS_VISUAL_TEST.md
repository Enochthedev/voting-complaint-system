# Quick Filters Visual Test Guide

## Test Environment
- **Page**: Lecturer Dashboard (`/dashboard`)
- **User Role**: Lecturer
- **Component**: Quick Filters section

## Visual Test Steps

### Test 1: Quick Filters Visibility
**Expected Result**: Quick Filters section appears between the search bar and tabs

1. Log in as a lecturer
2. Navigate to `/dashboard`
3. Verify Quick Filters card is visible
4. Verify "Quick Filters" heading is displayed
5. Verify "Clear All" button is visible in top-right

**✅ Pass Criteria**: All elements are visible and properly positioned

---

### Test 2: Filter Button States
**Expected Result**: Buttons show correct visual states

1. Verify all 7 filter buttons are visible:
   - Assigned to Me (Users icon)
   - High Priority (AlertCircle icon)
   - New (FileText icon)
   - In Progress (Timer icon)
   - Opened (Clock icon)
   - Resolved (CheckCircle2 icon)
   - Urgent Categories (Target icon)

2. Verify all buttons have outline style (inactive state)
3. Verify icons are visible on each button

**✅ Pass Criteria**: All buttons render with correct icons and outline style

---

### Test 3: Single Filter Activation
**Expected Result**: Clicking a filter activates it and shows results

1. Click "New" filter button
2. Verify:
   - Button changes to filled style (default variant)
   - Count badge appears showing number of new complaints
   - Dashboard switches to "Complaints" tab
   - Only complaints with "new" status are shown

**✅ Pass Criteria**: Filter activates, badge shows, tab switches, results filter

---

### Test 4: Filter Toggle
**Expected Result**: Clicking an active filter deactivates it

1. With "New" filter active, click "New" again
2. Verify:
   - Button returns to outline style
   - Count badge disappears
   - All complaints are shown again

**✅ Pass Criteria**: Filter deactivates and results reset

---

### Test 5: Multiple Filters
**Expected Result**: Multiple filters can be active simultaneously

1. Click "Assigned to Me" filter
2. Click "High Priority" filter
3. Verify:
   - Both buttons show filled style
   - Both show count badges
   - Results show only complaints that match BOTH criteria
   - Complaints tab is active

**✅ Pass Criteria**: Multiple filters work together correctly

---

### Test 6: Count Badge Accuracy
**Expected Result**: Count badges show accurate numbers

1. Activate "High Priority" filter
2. Note the count badge number
3. Switch to Complaints tab manually
4. Count the visible complaints
5. Verify numbers match

**✅ Pass Criteria**: Badge count matches actual filtered results

---

### Test 7: Clear All Functionality
**Expected Result**: Clear All resets all filters

1. Activate multiple filters (e.g., "New" + "High Priority")
2. Click "Clear All" button
3. Verify:
   - All filter buttons return to outline style
   - All count badges disappear
   - Full complaint list is shown
   - Switches to Complaints tab

**✅ Pass Criteria**: All filters reset and full list displays

---

### Test 8: Assigned to Me Filter
**Expected Result**: Shows only complaints assigned to current lecturer

1. Click "Assigned to Me" filter
2. Verify:
   - Button activates (filled style)
   - Count badge shows number
   - Complaints tab shows only assigned complaints
   - Each complaint shows current lecturer as assigned

**✅ Pass Criteria**: Only assigned complaints are shown

---

### Test 9: High Priority Filter
**Expected Result**: Shows high and critical priority complaints

1. Click "High Priority" filter
2. Verify:
   - Button activates
   - Count badge shows number
   - Results include both "high" and "critical" priority complaints
   - No "low" or "medium" priority complaints are shown

**✅ Pass Criteria**: Only high/critical priority complaints display

---

### Test 10: Status Filters
**Expected Result**: Each status filter works independently

Test each status filter:
- New
- In Progress
- Opened
- Resolved

For each:
1. Click the filter button
2. Verify only complaints with that status are shown
3. Verify count badge is accurate
4. Click again to deactivate

**✅ Pass Criteria**: Each status filter works correctly

---

### Test 11: Urgent Categories Filter
**Expected Result**: Shows facilities, academic, and harassment complaints

1. Click "Urgent Categories" filter
2. Verify:
   - Button activates
   - Count badge shows number
   - Results include only:
     - Facilities complaints
     - Academic complaints
     - Harassment complaints
   - No "other", "administrative", or "course_content" complaints

**✅ Pass Criteria**: Only urgent category complaints display

---

### Test 12: Filter + Search Interaction
**Expected Result**: Activating a filter clears active search

1. Perform a search in the search bar
2. Click any quick filter
3. Verify:
   - Search is cleared
   - Filter is applied
   - Results show filtered complaints (not search results)

**✅ Pass Criteria**: Filter clears search and applies correctly

---

### Test 13: Responsive Design
**Expected Result**: Filters wrap properly on smaller screens

1. Resize browser window to mobile width (375px)
2. Verify:
   - Filter buttons wrap to multiple rows
   - All buttons remain clickable
   - Text and icons are readable
   - Clear All button stays visible

**✅ Pass Criteria**: Layout adapts to small screens

---

### Test 14: Help Text
**Expected Result**: Help text is visible and informative

1. Scroll to Quick Filters section
2. Verify help text below buttons reads:
   "Click a filter to quickly view specific complaints. Active filters will show a count badge."

**✅ Pass Criteria**: Help text is visible and accurate

---

### Test 15: Filter Persistence
**Expected Result**: Filters persist when switching tabs

1. Activate "Assigned to Me" filter
2. Switch to "Overview" tab
3. Switch back to "Complaints" tab
4. Verify filter is still active

**✅ Pass Criteria**: Filter state persists across tab switches

---

## Summary Checklist

- [ ] All 7 filter buttons render correctly
- [ ] Icons display on each button
- [ ] Inactive buttons have outline style
- [ ] Active buttons have filled style
- [ ] Count badges appear when filters are active
- [ ] Count badges show accurate numbers
- [ ] Clicking a filter activates it
- [ ] Clicking an active filter deactivates it
- [ ] Multiple filters can be active
- [ ] Clear All resets all filters
- [ ] Filters switch to Complaints tab
- [ ] Filters clear active search
- [ ] Assigned to Me filter works
- [ ] High Priority filter works
- [ ] Status filters work (New, In Progress, Opened, Resolved)
- [ ] Urgent Categories filter works
- [ ] Responsive design works on mobile
- [ ] Help text is visible

## Known Issues
None identified during implementation.

## Browser Compatibility
Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Notes
- All buttons have proper labels
- Icons have semantic meaning
- Keyboard navigation works
- Screen readers can identify filter states
- Color is not the only indicator of state (filled vs outline)

## Performance Notes
- Filter calculations use memoized `filteredComplaints`
- No unnecessary re-renders
- Count badges calculate efficiently
- Smooth transitions between states
