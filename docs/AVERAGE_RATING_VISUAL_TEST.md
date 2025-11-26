# Average Rating Dashboard - Visual Testing Guide

## Purpose
This guide helps verify that the average satisfaction rating is correctly displayed on the student dashboard.

## Prerequisites
- Student account with at least one resolved complaint
- At least one rating submitted for a resolved complaint

## Test Scenarios

### Scenario 1: User with No Ratings
**Setup:**
- Log in as a student who has no resolved complaints OR
- Log in as a student whose resolved complaints have not been rated

**Expected Result:**
- Dashboard loads successfully
- Four stat cards are visible (Total, New & Open, In Progress, Resolved)
- Average Satisfaction card is NOT visible
- No errors in console

**Visual Check:**
```
✓ Stats grid shows 4 cards only
✓ No empty/placeholder rating card
✓ Dashboard layout is clean
```

---

### Scenario 2: User with Single Rating
**Setup:**
1. Log in as a student
2. Create a complaint and submit it
3. Have a lecturer mark it as resolved
4. Submit a rating (e.g., 4 stars)
5. Return to dashboard

**Expected Result:**
- Dashboard loads successfully
- Five sections visible: 4 stat cards + Average Satisfaction card
- Average Satisfaction card shows:
  - Title: "Average Satisfaction"
  - Yellow filled star icon (top right)
  - Large bold number: "4" (or your rating)
  - Small text: "/ 5.0"
  - Description: "Based on resolved complaints"

**Visual Check:**
```
✓ Rating card appears below stats grid
✓ Star icon is yellow and filled
✓ Rating number matches submitted rating
✓ Card styling matches other stat cards
```

---

### Scenario 3: User with Multiple Ratings
**Setup:**
1. Log in as a student
2. Have multiple resolved complaints with ratings:
   - Complaint 1: 5 stars
   - Complaint 2: 4 stars
   - Complaint 3: 3 stars
3. View dashboard

**Expected Result:**
- Average Satisfaction card shows: "4.0 / 5.0"
- Calculation: (5 + 4 + 3) / 3 = 4.0

**Visual Check:**
```
✓ Average is calculated correctly
✓ Number is rounded to 1 decimal place
✓ Card displays properly
```

---

### Scenario 4: User with Perfect Rating
**Setup:**
1. Log in as a student
2. Have resolved complaints all rated 5 stars
3. View dashboard

**Expected Result:**
- Average Satisfaction card shows: "5.0 / 5.0"
- Star icon is prominently displayed

**Visual Check:**
```
✓ Perfect score displayed correctly
✓ Visual emphasis on high rating
```

---

### Scenario 5: User with Low Rating
**Setup:**
1. Log in as a student
2. Have resolved complaints with low ratings (1-2 stars)
3. View dashboard

**Expected Result:**
- Average Satisfaction card shows the low average (e.g., "1.5 / 5.0")
- No special error styling (neutral display)

**Visual Check:**
```
✓ Low rating displayed without judgment
✓ Card maintains consistent styling
```

---

## Responsive Design Tests

### Desktop (1920x1080)
- Stats grid shows 4 cards in a row
- Average Satisfaction card appears as full-width card below
- All text is readable
- Icons are properly sized

### Tablet (768x1024)
- Stats grid shows 2 cards per row
- Average Satisfaction card maintains proper width
- Touch targets are adequate

### Mobile (375x667)
- Stats cards stack vertically
- Average Satisfaction card is full width
- Text remains readable
- No horizontal scrolling

## Data Validation Tests

### Test 1: Rating Calculation Accuracy
**Input:** Ratings of 5, 4, 3, 2, 1
**Expected:** 3.0 (average of 15/5)

### Test 2: Decimal Rounding
**Input:** Ratings of 5, 4
**Expected:** 4.5 (not 4.50 or 4)

### Test 3: Single Rating
**Input:** One rating of 3
**Expected:** 3 (or 3.0)

### Test 4: All Same Rating
**Input:** Five ratings of 4
**Expected:** 4.0

## Error Handling Tests

### Test 1: Database Connection Error
**Simulate:** Disconnect from Supabase
**Expected:** 
- Dashboard loads without rating card
- No crash or error modal
- Other dashboard sections work normally

### Test 2: Slow Network
**Simulate:** Throttle network to 3G
**Expected:**
- Dashboard shows loading skeletons
- Rating card appears when data loads
- No timeout errors

## Accessibility Tests

### Keyboard Navigation
- Tab through dashboard elements
- Rating card should be in logical tab order
- All interactive elements are reachable

### Screen Reader
- Card title is announced: "Average Satisfaction"
- Rating value is announced: "4.0 out of 5.0"
- Description is read: "Based on resolved complaints"

### Color Contrast
- Yellow star icon has sufficient contrast
- Text is readable in both light and dark modes
- Rating number is clearly visible

## Browser Compatibility

Test in:
- ✓ Chrome (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Edge (latest)

## Performance Tests

### Load Time
- Dashboard should load in < 2 seconds
- Rating calculation should not delay page render
- Parallel data fetching should work efficiently

### Console Checks
- No errors in browser console
- No warning messages
- API calls complete successfully

## Sign-off Checklist

- [ ] Card appears only when ratings exist
- [ ] Card is hidden when no ratings exist
- [ ] Average calculation is correct
- [ ] Decimal rounding works (1 decimal place)
- [ ] Visual design matches other stat cards
- [ ] Star icon displays correctly (yellow, filled)
- [ ] Responsive design works on all screen sizes
- [ ] No console errors
- [ ] Accessibility requirements met
- [ ] Works in all major browsers
- [ ] Loading states work properly
- [ ] Error handling is graceful

## Known Limitations

1. **Real-time Updates:** Rating card does not update in real-time when a new rating is submitted. User must refresh the dashboard.

2. **Historical Data:** Shows current average only, no historical trend.

3. **Rating Count:** Does not show how many ratings contribute to the average.

## Related Documentation

- Implementation: `docs/AVERAGE_RATING_DASHBOARD_IMPLEMENTATION.md`
- Requirements: `.kiro/specs/requirements.md` (AC16)
- Design: `.kiro/specs/design.md`
- API: `src/lib/api/complaints.ts`
- UI: `src/app/dashboard/page.tsx`
