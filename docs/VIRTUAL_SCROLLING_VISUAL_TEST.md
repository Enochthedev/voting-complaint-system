# Virtual Scrolling - Visual Test Guide

## Overview

This guide helps you visually verify that virtual scrolling is working correctly and providing the expected performance benefits.

## Test 1: Demo Page Functionality

### Steps

1. Log in to the application
2. Navigate to `/demo/virtual-scrolling`
3. Verify the page loads successfully

### Expected Results

✅ Page displays with header "Virtual Scrolling Demo"
✅ Info card explains what virtual scrolling is
✅ Control buttons are visible (50, 100, 500, 1000, 5000, 10000 items)
✅ Performance stats cards show initial values
✅ Virtualized list is visible with mock data

## Test 2: Generate Different Data Sizes

### Steps

1. Click "50 items" button
2. Observe the list updates
3. Click "100 items" button
4. Click "1,000 items" button
5. Click "10,000 items" button

### Expected Results

✅ List updates immediately for each button click
✅ Info banner shows correct item count
✅ Performance stats update (Total Items, Rendered Items, Performance Gain)
✅ Scrolling remains smooth regardless of item count
✅ No lag or stuttering when switching between sizes

## Test 3: Scroll Performance

### Steps

1. Generate 10,000 items
2. Scroll rapidly up and down the list
3. Use mouse wheel, trackpad, and scroll bar
4. Scroll to top, middle, and bottom

### Expected Results

✅ Scrolling is smooth at 60fps
✅ No visible lag or stuttering
✅ Items render instantly as you scroll
✅ No blank spaces or loading delays
✅ Scroll position is maintained accurately

## Test 4: DOM Node Verification

### Steps

1. Generate 10,000 items
2. Open Chrome DevTools (F12)
3. Go to Elements tab
4. Expand the virtualized list container
5. Count the number of complaint item divs
6. Scroll the list and observe DOM changes

### Expected Results

✅ Only ~15-20 complaint items in DOM (not 10,000)
✅ DOM nodes update as you scroll
✅ Items outside viewport are not in DOM
✅ Performance stats show "~15" rendered items

## Test 5: Selection Mode

### Steps

1. Generate 1,000 items
2. Click "Enable Selection Mode" button
3. Click checkboxes on various items
4. Scroll and select more items
5. Verify selected count badge updates

### Expected Results

✅ Checkboxes appear on all items
✅ Selection works smoothly
✅ Selected count updates correctly
✅ Scrolling with selections is still smooth
✅ Selected items remain selected after scrolling

## Test 6: Search Highlighting (if applicable)

### Steps

1. Generate 500 items
2. If search is available, search for a term
3. Scroll through results

### Expected Results

✅ Search terms are highlighted
✅ Highlighting works in virtualized list
✅ Scrolling with highlights is smooth

## Test 7: Automatic Switching

### Steps

1. Navigate to `/complaints` page
2. If you have < 50 complaints, verify regular list is used
3. If you have 50+ complaints, verify virtual scrolling is used
4. Check for info banner indicating virtual scrolling

### Expected Results

✅ Regular list for < 50 items (with pagination)
✅ Virtual list for 50+ items (with info banner)
✅ Automatic switching is seamless
✅ All features work in both modes

## Test 8: Responsive Design

### Steps

1. Generate 1,000 items on demo page
2. Resize browser window to mobile size (375px)
3. Resize to tablet size (768px)
4. Resize to desktop size (1920px)
5. Test scrolling at each size

### Expected Results

✅ List adapts to different screen sizes
✅ Container height adjusts appropriately
✅ Scrolling works on all screen sizes
✅ Touch scrolling works on mobile
✅ No horizontal overflow

## Test 9: Memory Usage

### Steps

1. Open Chrome DevTools
2. Go to Performance tab
3. Start recording
4. Generate 10,000 items
5. Scroll rapidly for 10 seconds
6. Stop recording
7. Analyze memory usage

### Expected Results

✅ Memory usage remains stable
✅ No memory leaks during scrolling
✅ Garbage collection is minimal
✅ Frame rate stays at 60fps

## Test 10: Comparison Test

### Steps

1. Generate 1,000 items with virtual scrolling
2. Note the smoothness and performance
3. Imagine rendering 1,000 items without virtualization
4. Compare the experience

### Expected Results

✅ Virtual scrolling is noticeably smoother
✅ No lag when scrolling
✅ Instant rendering of items
✅ Low memory usage
✅ Consistent performance

## Performance Benchmarks

### Expected Performance Metrics

| Item Count | DOM Nodes | Scroll FPS | Memory Usage |
| ---------- | --------- | ---------- | ------------ |
| 50         | ~15       | 60fps      | Low          |
| 100        | ~15       | 60fps      | Low          |
| 500        | ~15       | 60fps      | Low          |
| 1,000      | ~15       | 60fps      | Low          |
| 5,000      | ~15       | 60fps      | Low          |
| 10,000     | ~15       | 60fps      | Low          |

## Common Issues and Solutions

### Issue: Items appear blank

**Solution**: Check that `estimateSize` prop is set correctly (default: 200px)

### Issue: Jumpy scrolling

**Solution**: Ensure item heights are consistent or provide better size estimates

### Issue: Slow performance

**Solution**:

- Check for expensive operations in item render
- Verify only ~15 items in DOM
- Reduce overscan value if needed

### Issue: Selection not working

**Solution**: Verify `selectionMode`, `selectedIds`, and `onSelectionChange` props are set

## Visual Checklist

Use this checklist during testing:

- [ ] Demo page loads successfully
- [ ] All button sizes work (50, 100, 500, 1000, 5000, 10000)
- [ ] Scrolling is smooth at all sizes
- [ ] Only ~15 items in DOM (verified in DevTools)
- [ ] Performance stats are accurate
- [ ] Selection mode works correctly
- [ ] Info banner displays correct count
- [ ] No console errors
- [ ] No visual glitches
- [ ] Responsive on mobile/tablet/desktop
- [ ] Memory usage is stable
- [ ] Frame rate stays at 60fps

## Screenshots to Capture

1. **Demo page overview** - Full page with 10,000 items
2. **Performance stats** - Stats cards showing metrics
3. **DevTools Elements** - Showing only ~15 items in DOM
4. **DevTools Performance** - Showing 60fps during scroll
5. **Selection mode** - Multiple items selected
6. **Mobile view** - Responsive layout on small screen

## Success Criteria

Virtual scrolling is working correctly if:

✅ Scrolling is smooth (60fps) with 10,000 items
✅ Only ~15 items in DOM regardless of total count
✅ No lag, stuttering, or blank spaces
✅ Selection mode works smoothly
✅ Memory usage remains stable
✅ Automatic switching works (< 50 items vs 50+ items)
✅ All features work in virtualized mode
✅ Responsive on all screen sizes

## Reporting Issues

If you find any issues during testing:

1. Note the specific test that failed
2. Capture screenshots/video
3. Check browser console for errors
4. Note browser and version
5. Document steps to reproduce
6. Report with all details

## Additional Resources

- [Implementation Documentation](./VIRTUAL_SCROLLING_IMPLEMENTATION.md)
- [Quick Reference Guide](./VIRTUAL_SCROLLING_QUICK_REFERENCE.md)
- [@tanstack/react-virtual Docs](https://tanstack.com/virtual/latest)

---

**Last Updated**: December 1, 2025
**Version**: 1.0
**Status**: Ready for Testing
