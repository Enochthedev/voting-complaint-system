# Rating Prompt Visual Test Guide

## Quick Start

To test the rating prompt feature, follow these steps:

### 1. Configure Mock Data

Open `src/components/complaints/complaint-detail/mock-data.ts` and ensure:
```typescript
const isResolved = true; // Set to true to show resolved complaint
```

### 2. Configure User Role

Open `src/components/complaints/complaint-detail/index.tsx` and ensure:
```typescript
const userRole: 'student' | 'lecturer' | 'admin' = 'student'; // Must be 'student'
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Navigate to Complaint Detail

Go to: `http://localhost:3000/complaints/any-id`

## What You Should See

### Rating Prompt Appearance

The rating prompt should appear prominently between the action buttons and the main content:

```
┌─────────────────────────────────────────────────────┐
│  [Back to Complaints]                               │
├─────────────────────────────────────────────────────┤
│  Broken Air Conditioning in Lecture Hall B          │
│  [Resolved] [High Priority] [Facilities]            │
├─────────────────────────────────────────────────────┤
│  [Action Buttons]                                   │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐ │
│  │ Rate Your Experience                      [X] │ │
│  │                                               │ │
│  │ Your complaint "..." has been resolved.       │ │
│  │ Please rate your satisfaction...              │ │
│  │                                               │ │
│  │ ⭐ ⭐ ⭐ ⭐ ⭐                                  │ │
│  │ Select a rating                               │ │
│  │                                               │ │
│  │ Additional Feedback (Optional)                │ │
│  │ ┌───────────────────────────────────────┐    │ │
│  │ │ Tell us more...                       │    │ │
│  │ └───────────────────────────────────────┘    │ │
│  │ 0/500 characters                              │ │
│  │                                               │ │
│  │ [Submit Rating]  [Skip]                       │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  [Main Content: Description, Attachments, etc.]     │
└─────────────────────────────────────────────────────┘
```

### Visual Characteristics

**Background:**
- Gradient background with primary color tint
- Stands out from other content
- Subtle border

**Stars:**
- 5 large star icons
- Empty (outline) by default
- Fill with yellow color on hover/selection
- Smooth animation on hover

**Text:**
- Clear heading: "Rate Your Experience"
- Complaint title in quotes
- Anonymous notice in italic, smaller text

**Buttons:**
- Primary "Submit Rating" button (full width)
- Secondary "Skip" button
- Dismiss X button in top-right corner

## Interactive Testing

### Test 1: Star Hover Effect

**Steps:**
1. Hover over the first star
2. Move to second star
3. Move to third star
4. Continue to fifth star

**Expected:**
- Stars should highlight (fill yellow) up to hovered star
- Label below should update:
  - 1 star: "Very Dissatisfied"
  - 2 stars: "Dissatisfied"
  - 3 stars: "Neutral"
  - 4 stars: "Satisfied"
  - 5 stars: "Very Satisfied"
- Smooth transition animation

### Test 2: Star Selection

**Steps:**
1. Click on the third star
2. Move mouse away

**Expected:**
- First three stars remain filled (yellow)
- Label shows "Neutral"
- Stars stay selected even when not hovering

### Test 3: Change Rating

**Steps:**
1. Click on third star
2. Click on fifth star

**Expected:**
- All five stars become filled
- Label updates to "Very Satisfied"
- Previous selection is replaced

### Test 4: Feedback Text

**Steps:**
1. Click in the textarea
2. Type: "The issue was resolved quickly and professionally."
3. Continue typing to reach 500 characters

**Expected:**
- Text appears in textarea
- Character counter updates: "X/500 characters"
- At 500 characters, cannot type more
- Counter shows "500/500 characters"

### Test 5: Validation

**Steps:**
1. Without selecting any stars, click "Submit Rating"

**Expected:**
- Error message appears: "Please select a rating before submitting"
- Red/destructive color for error
- Form does not submit

### Test 6: Successful Submission

**Steps:**
1. Select 4 stars
2. Type feedback: "Great service!"
3. Click "Submit Rating"

**Expected:**
- Button shows "Submitting..." briefly
- Prompt disappears after submission
- Console log shows: `Submitting rating: { complaintId, rating: 4, feedbackText: "Great service!" }`
- Timeline section should show new "rated" entry

### Test 7: Dismissal

**Steps:**
1. Refresh the page (to reset)
2. Click the X button in top-right corner

**Expected:**
- Prompt disappears immediately
- Refresh the page
- Prompt does NOT reappear (localStorage remembers dismissal)

### Test 8: Skip Button

**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Click "Skip" button

**Expected:**
- Same behavior as dismissal
- Prompt disappears
- Won't reappear on refresh

## Negative Testing

### Test 9: Non-Student User

**Steps:**
1. Change `userRole` to `'lecturer'` in index.tsx
2. Refresh page

**Expected:**
- Rating prompt does NOT appear
- Only lecturer actions are visible

### Test 10: Non-Resolved Complaint

**Steps:**
1. Change `isResolved` to `false` in mock-data.ts
2. Ensure `userRole` is `'student'`
3. Refresh page

**Expected:**
- Rating prompt does NOT appear
- Complaint shows as "In Progress"

### Test 11: Already Rated

**Steps:**
1. Submit a rating successfully
2. Refresh the page

**Expected:**
- Rating prompt does NOT appear
- Timeline shows the rating entry

## Accessibility Testing

### Test 12: Keyboard Navigation

**Steps:**
1. Use Tab key to navigate through the form
2. Use Enter/Space to select stars
3. Use Tab to reach textarea
4. Use Tab to reach buttons

**Expected:**
- Clear focus indicators on all interactive elements
- Can select stars with keyboard
- Can navigate entire form without mouse

### Test 13: Screen Reader

**Steps:**
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate through the rating prompt

**Expected:**
- Heading is announced: "Rate Your Experience"
- Each star button announces: "Rate X stars"
- Textarea label is announced
- Button labels are clear

## Responsive Testing

### Test 14: Mobile View

**Steps:**
1. Open browser DevTools
2. Switch to mobile view (iPhone 12, 375px width)
3. Test all interactions

**Expected:**
- Prompt fits within viewport
- Stars are touch-friendly (large enough)
- Text is readable
- Buttons are easily tappable
- No horizontal scrolling

### Test 15: Tablet View

**Steps:**
1. Switch to tablet view (iPad, 768px width)
2. Test all interactions

**Expected:**
- Layout adjusts appropriately
- All elements remain accessible
- Good use of space

## Browser Testing

Test in the following browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

## Common Issues & Solutions

### Issue: Prompt doesn't appear

**Solutions:**
1. Check `isResolved = true` in mock-data.ts
2. Check `userRole = 'student'` in index.tsx
3. Check localStorage - clear it if needed
4. Verify complaint status is 'resolved'

### Issue: Stars don't highlight

**Solutions:**
1. Check browser console for errors
2. Verify Lucide icons are installed
3. Check CSS is loading correctly

### Issue: Submission doesn't work

**Solutions:**
1. Check browser console for errors
2. Verify rating is selected (not 0)
3. Check async function is working

### Issue: Prompt reappears after dismissal

**Solutions:**
1. Check localStorage in DevTools
2. Verify key format: `rating-dismissed-${complaintId}`
3. Clear localStorage and try again

## Screenshots Checklist

When documenting, capture:
- [ ] Initial prompt appearance
- [ ] Star hover state
- [ ] Star selected state
- [ ] Filled textarea with character count
- [ ] Error message display
- [ ] Submitting state
- [ ] Mobile view
- [ ] After dismissal (no prompt)

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Smooth animations
✅ Accessible via keyboard
✅ Works on mobile
✅ Persists dismissal
✅ Validates input
✅ Submits successfully

## Next Steps

After visual testing is complete:
1. Test with real API in Phase 12
2. Implement analytics dashboard integration (Task 8.1)
3. Add rating display in complaint list
4. Consider notification system for low ratings
