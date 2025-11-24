# Testing Tag Autocomplete Feature

## How to Test

### 1. Start the Development Server

```bash
cd student-complaint-system
npm run dev
```

The application will be available at `http://localhost:3000`

### 2. Navigate to the Complaint Form

Go to: `http://localhost:3000/complaints/new`

### 3. Test Autocomplete Functionality

#### Basic Autocomplete
1. Scroll down to the "Tags" field
2. Start typing in the tag input field (e.g., "class")
3. You should see a dropdown with suggestions like:
   - classroom
   - cleanliness
4. The suggestions update as you type

#### Keyboard Navigation
1. Type "e" in the tag input
2. Use **Arrow Down** to navigate through suggestions:
   - equipment
   - exam
3. Use **Arrow Up** to go back
4. Press **Enter** to select the highlighted suggestion
5. Press **Escape** to close the dropdown

#### Mouse Interaction
1. Type "lib" in the tag input
2. Hover over "library" in the dropdown
3. Click on it to add the tag
4. The tag should appear as a chip below the input

#### Creating Custom Tags
1. Type "my-custom-tag" in the input
2. Notice the hint: "Press Enter or click Add to create new tag: 'my-custom-tag'"
3. Press **Enter** or click the **Add** button
4. The custom tag is added even though it wasn't in the suggestions

#### Removing Tags
1. Add several tags using the methods above
2. Click the **×** button on any tag chip
3. The tag should be removed
4. That tag should now appear in suggestions again (if it was a popular tag)

#### Duplicate Prevention
1. Add a tag (e.g., "wifi-issues")
2. Try to add the same tag again
3. It should not be added (duplicates are prevented)
4. The tag should not appear in suggestions anymore

### 4. Test Edge Cases

#### Empty Input
- Try clicking "Add" with an empty input
- Nothing should happen (button is disabled)

#### Whitespace
- Type "  spaces  " with leading/trailing spaces
- Add the tag
- It should be trimmed to "spaces"

#### Case Insensitivity
- Type "WIFI" (uppercase)
- You should see "wifi-issues" in suggestions
- Add it and it becomes "wifi" (lowercase)

#### Click Outside
- Type something to show suggestions
- Click anywhere outside the input/dropdown
- The dropdown should close

#### Form Submission
- Add some tags
- Fill out the rest of the form
- Click "Submit Complaint"
- Check the console to see the tags are included in the submission

### 5. Test Accessibility

#### Screen Reader
- Use a screen reader to navigate the form
- The tag input should announce its purpose
- Suggestions should be announced as you navigate
- Added tags should be announced

#### Keyboard Only
- Use only the keyboard (no mouse)
- Tab to the tag input field
- Type to filter suggestions
- Use arrow keys to navigate
- Press Enter to select
- Tab to the "Add" button and press Enter
- Tab to tag chips and press Enter to remove (if implemented)

### 6. Test Responsive Design

#### Mobile View
- Resize browser to mobile width (< 640px)
- The tag input should be full width
- Suggestions dropdown should fit the screen
- Tag chips should wrap properly

#### Tablet View
- Resize to tablet width (640px - 1024px)
- Everything should remain functional and readable

#### Desktop View
- Full desktop width (> 1024px)
- Layout should be optimal

### 7. Test Dark Mode

1. Toggle your system to dark mode (or use browser dev tools)
2. The tag input and suggestions should have proper dark mode styling
3. All text should be readable
4. Hover states should be visible

## Expected Behavior Summary

✅ Autocomplete dropdown appears when typing
✅ Suggestions are filtered based on input
✅ Keyboard navigation works (arrows, enter, escape)
✅ Mouse clicks work on suggestions
✅ Custom tags can be created
✅ Tags appear as removable chips
✅ Duplicates are prevented
✅ Tags are included in form submission
✅ Accessible with keyboard and screen readers
✅ Responsive on all screen sizes
✅ Dark mode support

## Mock Data

The following 20 popular tags are available for autocomplete:

- wifi-issues
- classroom
- assignment
- grading
- schedule
- equipment
- parking
- library
- cafeteria
- registration
- exam
- professor
- course-material
- lab
- software
- hardware
- accessibility
- safety
- cleanliness
- noise

## Known Limitations (UI-First Development)

- Tags are not persisted to database (mock submission only)
- Popular tags are hardcoded (will be fetched from database in Phase 12)
- No real-time tag suggestions from other users' complaints
- No tag usage statistics

These will be implemented in Phase 12 when connecting to the real Supabase backend.

## Troubleshooting

### Dropdown doesn't appear
- Make sure you're typing at least one character
- Check that there are matching suggestions
- Verify the input field has focus

### Suggestions don't filter correctly
- Check browser console for errors
- Verify the popularTags array is loaded
- Try refreshing the page

### Tags don't add
- Check that the tag isn't already added
- Verify the input isn't empty
- Check browser console for errors

### Styling issues
- Clear browser cache
- Check that Tailwind CSS is loaded
- Verify dark mode is working correctly

## Next Steps

After testing, you can proceed to the next sub-task:
- Add rich text editor for description
