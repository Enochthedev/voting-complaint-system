# Export Progress Indicator - Visual Testing Guide

## Overview

This guide provides step-by-step instructions for visually testing the export progress indicator feature.

## Test Environment Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/complaints`

3. Ensure you're logged in (use mock authentication)

## Test Cases

### Test 1: Single Complaint PDF Export

**Steps**:
1. Navigate to any complaint detail page
2. Click the "Export" dropdown button
3. Select "Export as PDF"

**Expected Results**:
- ✅ Progress dialog appears immediately
- ✅ Dialog shows "Exporting" title with spinning loader icon
- ✅ Progress bar displays at 0%
- ✅ Message shows "Preparing PDF export..."
- ✅ Progress updates to ~30% with "Generating PDF document..."
- ✅ Progress reaches 100% with "PDF exported successfully!"
- ✅ Green checkmark icon appears
- ✅ Dialog auto-closes after 2 seconds
- ✅ PDF file downloads to browser

**Visual Checks**:
- Progress bar is smooth and animated
- Colors match theme (primary blue)
- Icons are properly sized and colored
- Text is readable and properly aligned
- Dialog is centered on screen
- Backdrop is semi-transparent

### Test 2: Attachment Export with Progress

**Prerequisites**: Use a complaint with multiple attachments

**Steps**:
1. Navigate to complaint detail page with attachments
2. Click "Export" dropdown
3. Select "Export Attachments (X)"

**Expected Results**:
- ✅ Progress dialog appears
- ✅ Shows "Downloading attachments..." message
- ✅ Progress updates incrementally (e.g., "Downloading 1/3 attachments...")
- ✅ Progress bar fills proportionally (33%, 66%, 100%)
- ✅ Final message: "Attachments exported successfully!"
- ✅ Success state with green checkmark
- ✅ Auto-closes after 2 seconds
- ✅ ZIP file downloads

**Visual Checks**:
- Progress updates are smooth
- File count updates correctly
- Progress bar matches percentage
- Success state is clearly visible

### Test 3: Complete Package Export

**Prerequisites**: Complaint with attachments

**Steps**:
1. Navigate to complaint detail page
2. Click "Export" dropdown
3. Select "Export Complete Package"

**Expected Results**:
- ✅ Progress dialog appears
- ✅ Shows detailed progress messages:
  - "Preparing complete export package..."
  - "Generating PDF..."
  - "Downloading attachments..."
  - "Creating ZIP file..."
- ✅ Progress bar updates through stages
- ✅ Final: "Complete package exported successfully!"
- ✅ Success state displayed
- ✅ Auto-closes after 2 seconds
- ✅ ZIP file with PDF and attachments downloads

**Visual Checks**:
- Multiple progress stages visible
- Messages are descriptive
- Progress is continuous (no jumps)
- Success state is clear

### Test 4: Bulk Export with Inline Progress

**Steps**:
1. Navigate to complaints list page
2. Click "Select" button to enter selection mode
3. Select 3-5 complaints using checkboxes
4. Click "Export CSV" in bulk action bar

**Expected Results**:
- ✅ Bulk action bar expands vertically
- ✅ Progress bar appears below action buttons
- ✅ Progress shows: "Preparing export..." (0%)
- ✅ Updates to: "Preparing X complaints..." (20%)
- ✅ Updates to: "Generating CSV file..." (60%)
- ✅ Reaches: "Export complete!" (100%)
- ✅ Progress bar disappears after completion
- ✅ Selection clears automatically
- ✅ Selection mode exits
- ✅ CSV file downloads

**Visual Checks**:
- Bulk action bar expands smoothly
- Progress bar is visible and properly sized
- Label and percentage are readable
- Bar color is primary theme color
- Completion is smooth (no flicker)

### Test 5: Export with Attachments (Bulk)

**Prerequisites**: Select complaints with attachments

**Steps**:
1. Enter selection mode
2. Select complaints that have attachments
3. Click "Export with Attachments" button

**Expected Results**:
- ✅ Bulk action bar shows progress
- ✅ Detailed progress messages for each stage
- ✅ Progress updates smoothly
- ✅ Completion message displayed
- ✅ ZIP file downloads with all data

**Visual Checks**:
- Progress is detailed and informative
- Bar fills smoothly
- Messages update appropriately

### Test 6: Error Handling

**Steps**:
1. Simulate an export error (disconnect network or use browser dev tools)
2. Attempt any export operation

**Expected Results**:
- ✅ Progress dialog shows error state
- ✅ Red X icon appears
- ✅ Error message displayed: "Export failed" or similar
- ✅ Dialog does NOT auto-close
- ✅ User must click "Close" button
- ✅ Close button is visible and functional

**Visual Checks**:
- Error state is clearly distinguishable
- Red color indicates error
- Error message is readable
- Close button is prominent

### Test 7: Progress Dialog Interactions

**Steps**:
1. Start any export operation
2. Try to close dialog during export (click backdrop, press ESC, click X)
3. Wait for export to complete

**Expected Results**:
- ✅ Dialog CANNOT be closed during export
- ✅ Clicking backdrop does nothing
- ✅ Pressing ESC does nothing
- ✅ X button is not visible during export
- ✅ After completion, dialog can be closed
- ✅ Success state auto-closes after 2 seconds

**Visual Checks**:
- No visual feedback when trying to close during export
- User understands they must wait
- Auto-close timing feels natural

### Test 8: Mobile Responsiveness

**Steps**:
1. Open browser dev tools
2. Switch to mobile view (iPhone, Android)
3. Test all export operations

**Expected Results**:
- ✅ Progress dialog fits on mobile screen
- ✅ Progress bar is visible and readable
- ✅ Text doesn't overflow
- ✅ Buttons are touch-friendly
- ✅ Bulk action bar is responsive
- ✅ Progress bar scales appropriately

**Visual Checks**:
- Dialog is properly sized for mobile
- Text is readable at mobile sizes
- Touch targets are adequate (44x44px minimum)
- No horizontal scrolling

### Test 9: Dark Mode

**Steps**:
1. Switch to dark mode (if available)
2. Test all export operations

**Expected Results**:
- ✅ Progress bar uses theme colors
- ✅ Dialog background is dark
- ✅ Text is readable (light on dark)
- ✅ Icons are visible
- ✅ Progress bar stands out
- ✅ Success/error states are clear

**Visual Checks**:
- Colors have sufficient contrast
- Progress bar is visible
- No color clashing
- Theme consistency maintained

### Test 10: Accessibility

**Steps**:
1. Use keyboard only (Tab, Enter, ESC)
2. Use screen reader (if available)
3. Check focus indicators

**Expected Results**:
- ✅ Dialog can be navigated with keyboard
- ✅ Focus is trapped in dialog during export
- ✅ ESC closes dialog (when allowed)
- ✅ Screen reader announces progress updates
- ✅ Focus indicators are visible
- ✅ ARIA labels are present

**Visual Checks**:
- Focus outline is visible
- Tab order is logical
- Focus doesn't escape dialog

## Visual Checklist

### Progress Bar
- [ ] Smooth animation (300ms transition)
- [ ] Correct height (sm: 4px, default: 8px, lg: 12px)
- [ ] Proper color (primary theme color)
- [ ] Rounded corners
- [ ] Background is visible (secondary color)
- [ ] Fills from left to right
- [ ] Percentage text is aligned

### Progress Dialog
- [ ] Centered on screen
- [ ] Max width 448px
- [ ] Backdrop is semi-transparent (80% opacity)
- [ ] Border matches theme
- [ ] Shadow provides depth
- [ ] Fade and zoom animation
- [ ] Close button positioned correctly
- [ ] Icons are properly sized (20x20px)
- [ ] Text is readable

### Bulk Action Bar
- [ ] Fixed at bottom of screen
- [ ] Centered horizontally
- [ ] Expands smoothly when showing progress
- [ ] Progress bar is full width
- [ ] Minimum width 400px for progress
- [ ] Shadow is visible
- [ ] Border matches theme
- [ ] Buttons are properly spaced

### Status Icons
- [ ] Loader spins smoothly
- [ ] Checkmark is green (#22c55e)
- [ ] X is red (#ef4444)
- [ ] Icons are 20x20px
- [ ] Icons are vertically aligned with text

## Browser Testing

Test in the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance Checks

- [ ] Progress updates don't cause lag
- [ ] Animations are smooth (60fps)
- [ ] Dialog opens/closes quickly
- [ ] No memory leaks (check dev tools)
- [ ] Multiple exports don't cause issues

## Common Issues and Solutions

### Issue: Progress bar not visible
**Solution**: Check parent container width, ensure value prop is set

### Issue: Dialog doesn't close
**Solution**: Verify status is not 'exporting', check onOpenChange callback

### Issue: Progress jumps instead of smooth
**Solution**: Ensure CSS transitions are applied, check for rapid state updates

### Issue: Auto-close doesn't work
**Solution**: Verify setTimeout is called, check for cleanup issues

### Issue: Colors don't match theme
**Solution**: Check CSS variable usage, verify theme is loaded

## Sign-off

After completing all tests:

- [ ] All visual tests passed
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Accessibility requirements met
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Browser compatibility confirmed

**Tester**: _______________  
**Date**: _______________  
**Status**: ⬜ Pass / ⬜ Fail  
**Notes**: _______________

---

**Document Version**: 1.0  
**Last Updated**: 2024-11-25
