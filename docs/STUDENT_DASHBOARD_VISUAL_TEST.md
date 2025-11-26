# Student Dashboard - Visual Test Guide

## Purpose
This guide helps verify that the Student Dashboard (Task 11.1) is working correctly with all required sections.

## Test Date
November 25, 2025

## Prerequisites
- Application running locally
- Logged in as a student user
- Mock data enabled (default for Phase 3-11)

## Visual Test Checklist

### 1. Dashboard Layout ✓
**Expected:**
- Clean, organized layout with proper spacing
- Responsive grid system
- All sections visible without scrolling excessively

**Test Steps:**
1. Navigate to `/dashboard`
2. Verify the page loads without errors
3. Check that all sections are visible

**Pass Criteria:**
- [ ] Page loads successfully
- [ ] No console errors
- [ ] Layout is clean and organized

---

### 2. Welcome Header ✓
**Expected:**
- Personalized greeting: "Welcome back, [FirstName]!"
- Subtitle: "Here's what's happening with your complaints today."

**Test Steps:**
1. Check the top of the dashboard
2. Verify your first name appears in the greeting

**Pass Criteria:**
- [ ] Greeting displays correctly
- [ ] First name is extracted properly
- [ ] Subtitle is present

---

### 3. Statistics Widget ✓
**Expected:**
- 4 cards in a row (responsive to 2 columns on mobile)
- Cards show: Total Complaints, Pending, In Progress, Resolved
- Each card has an icon and description
- Numbers are displayed prominently

**Test Steps:**
1. Locate the statistics cards section
2. Verify all 4 cards are present
3. Check that numbers are displayed

**Pass Criteria:**
- [ ] All 4 stat cards visible
- [ ] Icons display correctly
- [ ] Numbers are readable
- [ ] Descriptions are clear

---

### 4. Announcements Section ✓
**Expected:**
- Card with "Announcements" title and megaphone icon
- Shows up to 3 recent announcements
- Each announcement has title, content preview, and timestamp
- "View All" button in header

**Test Steps:**
1. Scroll to announcements section
2. Verify announcements are displayed
3. Check timestamp formatting
4. Click "View All" button

**Pass Criteria:**
- [ ] Section title and icon visible
- [ ] Announcements display with proper formatting
- [ ] Timestamps show relative time (e.g., "2h ago")
- [ ] "View All" button navigates to `/announcements`

---

### 5. Notifications Panel ✓ (NEW)
**Expected:**
- Card with "Notifications" title and bell icon
- Shows 5 most recent notifications
- Unread notifications have blue background and dot indicator
- Each notification shows title, message, and timestamp
- Clicking notification navigates to related content
- "View All" button in header

**Test Steps:**
1. Locate the notifications panel (left column)
2. Verify notifications are displayed
3. Check for unread indicators (blue background + dot)
4. Click on a notification
5. Click "View All" button

**Pass Criteria:**
- [ ] Section title and icon visible
- [ ] Notifications display correctly
- [ ] Unread notifications have visual distinction
- [ ] Timestamps show relative time
- [ ] Clicking notification navigates correctly
- [ ] "View All" button navigates to `/notifications`
- [ ] Empty state shows when no notifications

---

### 6. Active Votes Section ✓ (NEW)
**Expected:**
- Card with "Active Votes" title and vote icon
- Shows up to 3 active polls
- Each vote shows title, description, and status
- Badge indicates if user has voted (green "Voted" with checkmark) or not (blue "Pending")
- Shows days remaining if vote has closing date
- Action button changes based on status ("Vote" or "View")
- "View All" button in header

**Test Steps:**
1. Locate the active votes section (right column)
2. Verify votes are displayed
3. Check vote status badges
4. Check days remaining display
5. Click action button
6. Click "View All" button

**Pass Criteria:**
- [ ] Section title and icon visible
- [ ] Votes display correctly
- [ ] Status badges show correct state
- [ ] Days remaining calculated correctly
- [ ] Action button text changes based on vote status
- [ ] Clicking action button navigates to vote detail
- [ ] "View All" button navigates to `/votes`
- [ ] Empty state shows when no active votes

---

### 7. Recent Complaints Section ✓
**Expected:**
- Card with "Recent Complaints" title
- Shows 3 most recent complaints
- Each complaint has status badge, priority badge, and timestamp
- Arrow button to view details
- "View All Complaints" button at bottom

**Test Steps:**
1. Locate recent complaints section (left column, below notifications)
2. Verify complaints are displayed
3. Check badges and formatting
4. Click arrow button on a complaint
5. Click "View All Complaints" button

**Pass Criteria:**
- [ ] Section displays correctly
- [ ] Complaints show with proper badges
- [ ] Status colors are correct
- [ ] Arrow button navigates to complaint detail
- [ ] "View All Complaints" navigates to `/complaints`
- [ ] Empty state shows when no complaints

---

### 8. Draft Complaints Section ✓
**Expected:**
- Card with "Draft Complaints" title
- Shows all draft complaints
- Each draft has category badge, priority badge, and timestamp
- "Continue" button to resume editing
- "New Complaint" button at bottom

**Test Steps:**
1. Locate draft complaints section (right column, below votes)
2. Verify drafts are displayed
3. Check badges and formatting
4. Click "Continue" button
5. Click "New Complaint" button

**Pass Criteria:**
- [ ] Section displays correctly
- [ ] Drafts show with proper badges
- [ ] "Continue" button navigates to edit page
- [ ] "New Complaint" navigates to `/complaints/new`
- [ ] Empty state shows when no drafts

---

### 9. Quick Actions Section ✓
**Expected:**
- Card with "Quick Actions" title
- 6 action buttons in a grid (3 columns on desktop)
- Each button has icon, title, and description
- Buttons: Submit Complaint, Use Template, Active Votes, Drafts, Announcements, Notifications

**Test Steps:**
1. Scroll to quick actions section at bottom
2. Verify all 6 buttons are present
3. Click each button to test navigation

**Pass Criteria:**
- [ ] All 6 action buttons visible
- [ ] Icons display correctly
- [ ] Titles and descriptions are clear
- [ ] Each button navigates to correct page
- [ ] Grid layout is responsive

---

## Responsive Design Tests

### Desktop (1920x1080)
- [ ] All sections visible without horizontal scroll
- [ ] Grid layouts use full width appropriately
- [ ] Cards have proper spacing

### Tablet (768x1024)
- [ ] Stats cards show 2 per row
- [ ] Two-column layout for main sections
- [ ] Quick actions show 2 per row

### Mobile (375x667)
- [ ] Stats cards stack vertically
- [ ] All sections stack vertically
- [ ] Quick actions stack vertically
- [ ] Text remains readable
- [ ] Buttons are touch-friendly

---

## Performance Tests

### Load Time
- [ ] Dashboard loads in under 2 seconds
- [ ] No visible lag when rendering sections
- [ ] Smooth scrolling

### Data Loading
- [ ] Loading states display briefly
- [ ] Error states handle failures gracefully
- [ ] Retry functionality works

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Enter key activates buttons

### Screen Reader
- [ ] Section headings are announced
- [ ] Button purposes are clear
- [ ] Status information is conveyed

### Color Contrast
- [ ] Text is readable on all backgrounds
- [ ] Badges have sufficient contrast
- [ ] Icons are distinguishable

---

## Browser Compatibility

Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Known Issues
None at this time.

---

## Test Results Summary

**Date Tested:** _________________

**Tested By:** _________________

**Overall Result:** [ ] PASS [ ] FAIL

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Next Steps

If all tests pass:
1. Mark Task 11.1 as complete ✓
2. Document any observations
3. Proceed to Task 11.2 (Lecturer Dashboard)

If any tests fail:
1. Document the failure
2. Create a bug report
3. Fix the issue
4. Re-run tests
