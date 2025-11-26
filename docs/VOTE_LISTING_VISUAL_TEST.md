# Vote Listing Page - Visual Test Guide

## Test Location

**URL**: `/admin/votes`

## Purpose

This page allows lecturers/admins to manage voting polls, view results, and control vote status.

## Test Scenarios

### Scenario 1: Empty State
**Steps**:
1. Navigate to `/admin/votes`
2. If no votes exist, you should see:
   - Empty state card with vote icon
   - Message: "No votes created yet"
   - "Create Your First Vote" button

**Expected Result**: Clean, centered empty state with call-to-action

---

### Scenario 2: Create New Vote
**Steps**:
1. Click "Create Vote" button
2. Fill in the form:
   - Title: "Preferred Study Hours"
   - Description: "Help us understand when students prefer to study"
   - Add 4 options: Morning, Afternoon, Evening, Night
   - Set closing date (optional)
3. Click "Create Vote"

**Expected Result**: 
- Form validates inputs
- Vote is created successfully
- Redirected to vote list
- New vote appears in "Active Polls" section

---

### Scenario 3: View Active Votes
**Steps**:
1. Navigate to `/admin/votes`
2. Observe the active votes section

**Expected Result**:
- Each vote card shows:
  - Title and description
  - "Active" badge (green)
  - Creation date
  - Closing date (if set)
  - Total vote count
  - "Current Results" section (collapsed by default)
  - Action buttons: Edit, Close Vote, Delete

---

### Scenario 4: Expand Vote Results
**Steps**:
1. Click "Show Details" button on any vote
2. Observe the expanded results

**Expected Result**:
- Results expand to show:
  - Each option with vote count
  - Percentage for each option
  - Visual progress bar for each option
  - Color-coded bars (primary color)
- Button changes to "Hide Details"

---

### Scenario 5: Edit Vote
**Steps**:
1. Click "Edit" button on any vote
2. Modify the title or description
3. Click "Update Vote"

**Expected Result**:
- Form opens with pre-filled data
- Changes are saved
- Redirected back to vote list
- Updated information is displayed

---

### Scenario 6: Close Vote
**Steps**:
1. Click "Close Vote" button on an active vote
2. Observe the changes

**Expected Result**:
- Vote moves from "Active Polls" to "Closed Polls" section
- Badge changes from "Active" to "Closed"
- Card becomes slightly transparent (opacity-75)
- "Close Vote" button changes to "Reopen Vote"
- Results section title changes to "Final Results"

---

### Scenario 7: Reopen Vote
**Steps**:
1. Click "Reopen Vote" button on a closed vote
2. Observe the changes

**Expected Result**:
- Vote moves from "Closed Polls" back to "Active Polls"
- Badge changes from "Closed" to "Active"
- Card returns to full opacity
- "Reopen Vote" button changes to "Close Vote"

---

### Scenario 8: Delete Vote
**Steps**:
1. Click "Delete" button on any vote
2. Confirm deletion in the dialog

**Expected Result**:
- Confirmation dialog appears
- After confirmation, vote is removed from list
- If it was the last vote, empty state appears

---

### Scenario 9: Loading State
**Steps**:
1. Refresh the page
2. Observe the loading state (may be brief)

**Expected Result**:
- 3 skeleton cards with pulsing animation
- Skeleton shows placeholder for title, description, and buttons

---

### Scenario 10: Error Handling
**Steps**:
1. Simulate an error (disconnect network, etc.)
2. Try to perform an action

**Expected Result**:
- Red alert banner appears at top
- Error message is displayed
- Page remains functional
- User can retry the action

---

## Visual Checks

### Layout
- [ ] Page is centered with max-width container
- [ ] Proper spacing between elements
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Cards have consistent padding and borders

### Typography
- [ ] Page title is large and bold
- [ ] Descriptions are readable
- [ ] Vote titles stand out
- [ ] Dates and counts are subtle but readable

### Colors
- [ ] Active badge is green
- [ ] Closed badge is gray/secondary
- [ ] Progress bars use primary color
- [ ] Delete button has destructive styling
- [ ] Error alerts are red

### Interactions
- [ ] Buttons have hover states
- [ ] Cards don't have hover effects (static)
- [ ] Expand/collapse is smooth
- [ ] Loading states are clear
- [ ] Disabled states are visible

### Accessibility
- [ ] All buttons have clear labels
- [ ] Icons have proper sizing
- [ ] Color contrast is sufficient
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

---

## Mock Data

The page uses mock data from `src/lib/api/votes.ts`:

**Default Mock Votes**:
1. "Preferred Study Hours" - Active, 4 options
2. "Campus WiFi Improvement Priority" - Active, 5 options

**Mock Lecturer ID**: `lecturer-1`

---

## Integration Points

### Components Used:
- `VoteForm` - For creating/editing votes
- `Card` - For vote containers
- `Button` - For all actions
- `Badge` - For status indicators
- `Alert` - For error messages

### API Functions Used:
- `getVotes()` - Fetch votes by lecturer
- `deleteVote()` - Remove a vote
- `closeVote()` - Mark as inactive
- `reopenVote()` - Reactivate vote
- `getVoteResults()` - Get aggregated results

---

## Phase 12 Notes

When connecting to real APIs:
- Replace `mockLecturerId` with actual auth user ID
- Update API calls to use Supabase
- Add real-time updates for vote counts
- Implement proper error handling
- Add pagination for large lists
- Add filtering/sorting options

---

## Known Limitations (Mock Data)

1. **No Real-time Updates**: Vote counts don't update automatically
2. **No Pagination**: All votes load at once
3. **No Filtering**: Can't filter by date, status, etc.
4. **No Sorting**: Fixed sort order (newest first)
5. **No Search**: Can't search votes by title
6. **No Export**: Can't export results to CSV/PDF

These will be addressed in Phase 12 during API integration.

---

## Success Criteria

✅ Page loads without errors  
✅ All CRUD operations work (Create, Read, Update, Delete)  
✅ Vote status toggle works (Close/Reopen)  
✅ Results display correctly with percentages  
✅ Loading and empty states display  
✅ Error handling works  
✅ Responsive on all screen sizes  
✅ Follows design system tokens  
✅ Accessible and keyboard-friendly  

---

## Screenshots Needed

1. Empty state
2. Active votes list
3. Expanded results view
4. Create vote form
5. Edit vote form
6. Closed votes section
7. Loading state
8. Error state
9. Mobile view
10. Tablet view
