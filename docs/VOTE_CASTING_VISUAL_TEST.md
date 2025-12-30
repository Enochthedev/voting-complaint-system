# Vote Casting - Visual Test Guide

## Purpose

This guide helps you visually verify that the vote casting functionality is working correctly.

## Test Environment

- **URL**: `http://localhost:3000/votes`
- **User Role**: Student (mock)
- **Test Data**: 2 mock votes are pre-loaded

## Visual Test Checklist

### ✅ Test 1: Vote Listing Page

**Navigate to**: `/votes`

**Expected UI Elements:**

- [ ] Page title: "Active Votes"
- [ ] Subtitle: "Participate in voting polls and share your opinion"
- [ ] At least 2 vote cards displayed
- [ ] Each card shows:
  - [ ] Vote title (clickable, turns primary color on hover)
  - [ ] Vote description
  - [ ] Posted date with calendar icon
  - [ ] Closing date with clock icon (if applicable)
  - [ ] Radio buttons for each option
  - [ ] "Submit Vote" button
  - [ ] "View Details" button

**Visual States:**

- [ ] Radio buttons have hover effect
- [ ] Selected radio button is highlighted with primary color
- [ ] Submit button is disabled when no option selected
- [ ] Submit button shows "Submitting..." when clicked

### ✅ Test 2: Casting a Vote (Listing Page)

**Steps:**

1. Select an option by clicking a radio button
2. Click "Submit Vote"

**Expected Behavior:**

- [ ] Button shows "Submitting..." with disabled state
- [ ] Green success alert appears: "Your vote has been submitted successfully!"
- [ ] "Voted" badge appears (green with checkmark)
- [ ] Radio buttons are replaced with message: "You have already voted on this poll. Thank you for participating!"
- [ ] "Submit Vote" button is replaced with "View Results" button
- [ ] Success message disappears after 3 seconds

**Visual Verification:**

```
Before Voting:
┌─────────────────────────────────────┐
│ Preferred Study Hours               │
│ Help us understand when students... │
│                                     │
│ ○ Morning (6am-12pm)               │
│ ● Afternoon (12pm-6pm)  [Selected] │
│ ○ Evening (6pm-12am)               │
│                                     │
│ [Submit Vote] [View Details →]     │
└─────────────────────────────────────┘

After Voting:
┌─────────────────────────────────────┐
│ Preferred Study Hours    [✓ Voted]  │
│ Help us understand when students... │
│                                     │
│ ✓ Your vote has been submitted!    │
│                                     │
│ You have already voted on this poll.│
│ Thank you for participating!        │
│                                     │
│ [View Results →]                    │
└─────────────────────────────────────┘
```

### ✅ Test 3: Vote Detail Page

**Navigate to**: `/votes/vote-1` (or click "View Details")

**Expected UI Elements:**

- [ ] "← Back to Votes" button
- [ ] Vote title (large, bold)
- [ ] Vote description
- [ ] Metadata section with:
  - [ ] Posted date
  - [ ] Closing date (if applicable)
  - [ ] Vote count (after voting)
- [ ] "Cast Your Vote" section (before voting)
- [ ] Radio buttons for each option
- [ ] "Submit Vote" button

**Visual States:**

- [ ] Radio buttons have border and hover effect
- [ ] Selected option has primary border and light background
- [ ] Submit button is full width
- [ ] Submit button is disabled when no option selected

### ✅ Test 4: Casting a Vote (Detail Page)

**Steps:**

1. Select an option
2. Click "Submit Vote"

**Expected Behavior:**

- [ ] Button shows "Submitting..." with loading spinner
- [ ] Green success alert appears at top
- [ ] "Voted" badge appears next to title
- [ ] Radio buttons are replaced with results section
- [ ] Results show:
  - [ ] "📊 Vote Results" heading
  - [ ] Each option with vote count and percentage
  - [ ] Animated progress bars
  - [ ] Total votes summary at bottom
- [ ] Blue info alert: "Thank you for participating! You can view the results above."

**Visual Verification:**

```
Before Voting:
┌─────────────────────────────────────┐
│ ← Back to Votes                     │
│                                     │
│ Preferred Study Hours               │
│ Help us understand when students... │
│                                     │
│ Posted Nov 18, 2024, 10:00 AM      │
│ Closes Nov 25, 2024, 10:00 AM      │
│                                     │
│ Cast Your Vote                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ○ Morning (6am-12pm)           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ● Afternoon (12pm-6pm)         │ │ [Selected]
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ○ Evening (6pm-12am)           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Submit Vote]                       │
└─────────────────────────────────────┘

After Voting:
┌─────────────────────────────────────┐
│ ← Back to Votes                     │
│                                     │
│ ✓ Your vote has been submitted!    │
│                                     │
│ Preferred Study Hours    [✓ Voted]  │
│ Help us understand when students... │
│                                     │
│ Posted Nov 18, 2024, 10:00 AM      │
│ Closes Nov 25, 2024, 10:00 AM      │
│ 👥 1 vote                           │
│                                     │
│ 📊 Vote Results                     │
│                                     │
│ Morning (6am-12pm)                  │
│ 0 votes (0%)                        │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│ Afternoon (12pm-6pm)                │
│ 1 vote (100%)                       │
│ ████████████████████████████████   │
│                                     │
│ Evening (6pm-12am)                  │
│ 0 votes (0%)                        │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     │
│ Total Votes: 1                      │
│                                     │
│ ℹ Thank you for participating!      │
└─────────────────────────────────────┘
```

### ✅ Test 5: Error Handling

**Test 5a: No Option Selected**

1. Click "Submit Vote" without selecting an option
2. **Expected**: Red error alert: "Please select an option before submitting"

**Test 5b: Already Voted**

1. Try to vote on a poll you already voted on
2. **Expected**: Message shows "You have already voted on this poll"
3. **Expected**: "View Results" button instead of voting form

**Test 5c: Closed Vote**

1. Navigate to a closed vote (if available)
2. **Expected**: "Closed" badge appears
3. **Expected**: Cannot vote, shows "This poll has closed" message

### ✅ Test 6: Responsive Design

**Desktop (>1024px):**

- [ ] Vote cards are full width with proper padding
- [ ] Radio buttons are well-spaced
- [ ] Results bars are smooth and animated

**Tablet (768px - 1024px):**

- [ ] Layout adjusts properly
- [ ] All elements remain readable
- [ ] Buttons are appropriately sized

**Mobile (<768px):**

- [ ] Vote cards stack vertically
- [ ] Radio buttons are touch-friendly
- [ ] Buttons are full width
- [ ] Text is readable without zooming

### ✅ Test 7: Color Scheme

**Light Mode:**

- [ ] Primary color (blue) for selected options
- [ ] Green for success messages and "Voted" badge
- [ ] Red for error messages
- [ ] Gray for muted text and borders
- [ ] White/light background for cards

**Dark Mode:**

- [ ] Primary color adjusts for dark background
- [ ] Success/error colors remain visible
- [ ] Text contrast is sufficient
- [ ] Cards have appropriate dark background

### ✅ Test 8: Accessibility

**Keyboard Navigation:**

- [ ] Can tab through radio buttons
- [ ] Can select options with arrow keys
- [ ] Can activate submit button with Enter/Space
- [ ] Focus indicators are visible

**Screen Reader:**

- [ ] Radio buttons have proper labels
- [ ] Success/error messages are announced
- [ ] Vote status is communicated

### ✅ Test 9: Multiple Votes

**Steps:**

1. Vote on first poll
2. Scroll to second poll
3. Vote on second poll

**Expected:**

- [ ] Each vote is independent
- [ ] Both show "Voted" badges
- [ ] Both show success messages
- [ ] Can view results for both

### ✅ Test 10: Navigation Flow

**Test Flow:**

1. Start at `/votes`
2. Click "View Details" on a vote
3. Cast vote on detail page
4. Click "← Back to Votes"
5. Verify "Voted" badge shows on listing page

**Expected:**

- [ ] Navigation is smooth
- [ ] State persists across pages
- [ ] "Voted" status is consistent

## Common Issues to Check

### Issue: Vote doesn't submit

- **Check**: Is an option selected?
- **Check**: Is the vote still active?
- **Check**: Has the student already voted?

### Issue: Results don't show

- **Check**: Did the vote submit successfully?
- **Check**: Is the user a student (not lecturer)?
- **Check**: Are there any console errors?

### Issue: UI looks broken

- **Check**: Are all CSS classes loading?
- **Check**: Is Tailwind CSS configured correctly?
- **Check**: Are there any browser console errors?

## Success Criteria

All tests pass if:

- ✅ Students can vote from both listing and detail pages
- ✅ One vote per student is enforced
- ✅ Success/error messages display correctly
- ✅ Results show after voting
- ✅ UI is responsive and accessible
- ✅ Navigation works smoothly
- ✅ Visual feedback is clear and immediate

## Test Results

**Date Tested**: **\*\***\_**\*\***

**Tested By**: **\*\***\_**\*\***

**Browser**: **\*\***\_**\*\***

**Result**: ☐ PASS ☐ FAIL

**Notes**:

---

---

---

## Next Steps

After all tests pass:

1. Mark task as complete in tasks.md
2. Document any issues found
3. Proceed to next task in Phase 7
