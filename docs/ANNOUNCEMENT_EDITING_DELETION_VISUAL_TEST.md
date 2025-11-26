# Announcement Editing and Deletion - Visual Test Guide

## Quick Test Guide

This guide helps you quickly verify that announcement editing and deletion are working correctly.

## Prerequisites
- Navigate to `/admin/announcements` as a lecturer
- Ensure there are some announcements in the system

## Test 1: Edit Announcement

### Steps:
1. **Navigate** to `/admin/announcements`
2. **Locate** any announcement card
3. **Click** the "Edit" button (pencil icon)
4. **Verify** the form appears with pre-filled data:
   - Title field contains the announcement title
   - Content field contains the announcement content
   - Character counters show current length
5. **Modify** the title (e.g., add " - Updated" to the end)
6. **Modify** the content (e.g., add a new sentence)
7. **Click** "Update Announcement" button
8. **Verify** success message appears (green alert)
9. **Verify** you're returned to the announcement list
10. **Verify** the announcement shows updated content
11. **Verify** "Last updated" timestamp appears below the content

### Expected Results:
✅ Form pre-fills with existing data  
✅ Can modify title and content  
✅ Character counters update in real-time  
✅ Success message appears after update  
✅ Updated content displays in the list  
✅ "Last updated" timestamp is shown  
✅ Updated timestamp is different from created timestamp  

## Test 2: Cancel Edit

### Steps:
1. **Click** "Edit" on any announcement
2. **Modify** some fields
3. **Click** "Cancel" button
4. **Verify** you're returned to the list
5. **Verify** no changes were saved

### Expected Results:
✅ Cancel button returns to list view  
✅ No changes are saved  
✅ Original announcement data remains unchanged  

## Test 3: Delete Announcement

### Steps:
1. **Navigate** to `/admin/announcements`
2. **Note** the total number of announcements
3. **Click** the "Delete" button (trash icon) on any announcement
4. **Verify** confirmation dialog appears with warning message
5. **Click** "OK" to confirm
6. **Verify** success message appears (green alert)
7. **Verify** the announcement is removed from the list
8. **Verify** the total count decreased by 1

### Expected Results:
✅ Confirmation dialog appears  
✅ Warning message about permanent deletion  
✅ Success message after deletion  
✅ Announcement removed from list  
✅ List updates immediately  

## Test 4: Cancel Delete

### Steps:
1. **Click** "Delete" on any announcement
2. **Click** "Cancel" in the confirmation dialog
3. **Verify** the announcement remains in the list
4. **Verify** no success message appears

### Expected Results:
✅ Announcement is not deleted  
✅ List remains unchanged  
✅ No success message  

## Test 5: Edit Validation

### Steps:
1. **Click** "Edit" on any announcement
2. **Clear** the title field
3. **Click** "Update Announcement"
4. **Verify** error message appears: "Title is required"
5. **Enter** a title with only 2 characters
6. **Click** "Update Announcement"
7. **Verify** error message: "Title must be at least 5 characters"
8. **Clear** the content field
9. **Click** "Update Announcement"
10. **Verify** error message: "Content is required"

### Expected Results:
✅ Empty title shows error  
✅ Short title shows error  
✅ Empty content shows error  
✅ Form doesn't submit with validation errors  
✅ Error messages are clear and helpful  

## Test 6: Loading States

### Steps:
1. **Click** "Edit" on any announcement
2. **Make** a change
3. **Click** "Update Announcement"
4. **Observe** the button during the update:
   - Should show loading spinner
   - Should be disabled
   - Text should remain "Update Announcement"
5. **Click** "Delete" on any announcement
6. **Confirm** deletion
7. **Observe** the button during deletion:
   - Should show "Deleting..." text
   - Should be disabled

### Expected Results:
✅ Update button shows loading state  
✅ Update button is disabled during operation  
✅ Delete button shows "Deleting..." text  
✅ Delete button is disabled during operation  
✅ Cannot trigger multiple operations simultaneously  

## Test 7: Multiple Edits

### Steps:
1. **Edit** an announcement and save
2. **Immediately edit** the same announcement again
3. **Verify** the form shows the most recent data
4. **Make** another change and save
5. **Verify** "Last updated" timestamp updates

### Expected Results:
✅ Can edit the same announcement multiple times  
✅ Each edit updates the timestamp  
✅ Most recent data always displays  

## Test 8: Error Handling

### Steps:
1. **Open browser DevTools** → Network tab
2. **Enable** "Offline" mode (to simulate network error)
3. **Try to edit** an announcement
4. **Verify** error message appears
5. **Try to delete** an announcement
6. **Verify** error message appears
7. **Disable** offline mode
8. **Verify** operations work again

### Expected Results:
✅ Error messages appear when operations fail  
✅ Error messages are user-friendly  
✅ UI remains functional after errors  
✅ Can retry operations after fixing issues  

## Visual Checklist

### Announcement Card
- [ ] Edit button visible with pencil icon
- [ ] Delete button visible with trash icon
- [ ] Delete button has destructive (red) styling
- [ ] Buttons are properly sized and aligned
- [ ] Icons are clear and recognizable

### Edit Form
- [ ] Form matches create form styling
- [ ] Title field pre-filled
- [ ] Content field pre-filled
- [ ] Character counters show correct values
- [ ] Cancel and Update buttons visible
- [ ] Form is responsive on mobile

### Success Messages
- [ ] Green background color
- [ ] Checkmark icon visible
- [ ] Message text is clear
- [ ] Auto-dismisses after 3 seconds
- [ ] Positioned at top of page

### Updated Timestamp
- [ ] Shows "Last updated: [date]" format
- [ ] Italic styling
- [ ] Smaller text size
- [ ] Only appears when updated_at ≠ created_at

## Common Issues

### Issue: Edit button doesn't work
**Solution**: Check browser console for errors, verify user has lecturer role

### Issue: Delete confirmation doesn't appear
**Solution**: Check if browser is blocking dialogs, try different browser

### Issue: Changes don't save
**Solution**: Check validation errors, verify all required fields are filled

### Issue: Success message doesn't appear
**Solution**: Check if operation completed, look for error messages instead

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Accessibility

- [ ] Can navigate with keyboard (Tab key)
- [ ] Can activate buttons with Enter/Space
- [ ] Screen reader announces button purposes
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG standards

## Performance

- [ ] Edit form loads instantly
- [ ] Update operation completes in < 1 second
- [ ] Delete operation completes in < 1 second
- [ ] No UI lag or freezing
- [ ] Smooth transitions between views

## Conclusion

If all tests pass, the announcement editing and deletion functionality is working correctly and ready for use!
