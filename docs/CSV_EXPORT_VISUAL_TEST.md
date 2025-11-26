# CSV Export Visual Test Guide

## Purpose

This guide helps you manually test the CSV export functionality for complaint lists.

## Prerequisites

- Access to the application as a lecturer or admin user
- At least a few complaints in the system
- A spreadsheet application (Excel, Google Sheets, LibreOffice Calc, etc.)

## Test Scenarios

### Test 1: Basic Export (All Complaints)

**Steps:**
1. Log in as a lecturer or admin
2. Navigate to `/complaints`
3. Ensure no filters are applied (or clear all filters)
4. Click the "Export CSV" button in the header
5. Wait for the download to complete

**Expected Results:**
- ✅ A CSV file is downloaded with a name like `complaints_2024-11-25.csv`
- ✅ The button shows "Exporting..." briefly during the export
- ✅ The file opens successfully in your spreadsheet application
- ✅ All complaints visible on the page are included in the export
- ✅ The CSV has 16 columns with proper headers

**Verify Columns:**
- ID
- Title
- Status
- Priority
- Category
- Submitted By
- Assigned To
- Tags
- Created Date
- Updated Date
- Opened Date
- Resolved Date
- Escalation Level
- Is Anonymous
- Is Draft
- Description

### Test 2: Export with Status Filter

**Steps:**
1. Navigate to `/complaints`
2. Apply a status filter (e.g., select "New" and "Opened")
3. Click "Export CSV"
4. Open the downloaded file

**Expected Results:**
- ✅ File name includes the filter: `complaints_2024-11-25_new-opened.csv`
- ✅ Only complaints with "New" or "Opened" status are included
- ✅ All other complaints are excluded

### Test 3: Export with Multiple Filters

**Steps:**
1. Navigate to `/complaints`
2. Apply multiple filters:
   - Status: "In Progress"
   - Priority: "High"
   - Category: "Facilities"
3. Click "Export CSV"
4. Open the downloaded file

**Expected Results:**
- ✅ Only complaints matching ALL filters are included
- ✅ File name reflects the status filter
- ✅ Data is accurate and complete

### Test 4: Special Characters Handling

**Steps:**
1. Create or find a complaint with special characters:
   - Title with quotes: `Test "Quote" Complaint`
   - Description with commas: `This is a test, with commas`
   - Tags with special characters
2. Export the complaints
3. Open in a spreadsheet application

**Expected Results:**
- ✅ Quotes are properly escaped (doubled)
- ✅ Commas don't break the CSV structure
- ✅ Fields with special characters are wrapped in quotes
- ✅ All data displays correctly in the spreadsheet

### Test 5: HTML Stripping

**Steps:**
1. Create or find a complaint with HTML in the description:
   - Example: `<p>This is <strong>bold</strong> text</p>`
2. Export the complaints
3. Open the CSV and check the Description column

**Expected Results:**
- ✅ HTML tags are removed
- ✅ Plain text remains: "This is bold text"
- ✅ No `<p>`, `<strong>`, or other HTML tags visible

### Test 6: Anonymous Complaints

**Steps:**
1. Create or find an anonymous complaint
2. Export the complaints
3. Check the "Submitted By" column

**Expected Results:**
- ✅ Anonymous complaints show "Anonymous" in the Submitted By column
- ✅ No student name or email is revealed
- ✅ "Is Anonymous" column shows "Yes"

### Test 7: Tags Export

**Steps:**
1. Create or find complaints with multiple tags
2. Export the complaints
3. Check the "Tags" column

**Expected Results:**
- ✅ Multiple tags are separated by semicolons (`;`)
- ✅ Example: `urgent; facilities; wifi`
- ✅ Complaints without tags show an empty cell

### Test 8: Date Formatting

**Steps:**
1. Export complaints with various dates
2. Check all date columns

**Expected Results:**
- ✅ Dates are formatted consistently: `MM/DD/YYYY, HH:MM AM/PM`
- ✅ Example: `11/25/2024, 02:30 PM`
- ✅ Null dates show as empty cells
- ✅ All date columns are properly formatted

### Test 9: Empty Export

**Steps:**
1. Apply filters that result in no complaints
2. Click "Export CSV"

**Expected Results:**
- ✅ Console shows warning: "No complaints to export"
- ✅ No file is downloaded
- ✅ No error is displayed to the user

### Test 10: Large Dataset

**Steps:**
1. Ensure you have 50+ complaints in the system
2. Export all complaints
3. Open the CSV file

**Expected Results:**
- ✅ Export completes quickly (< 2 seconds)
- ✅ All complaints are included
- ✅ File opens without issues
- ✅ No data is truncated or missing

### Test 11: Role-Based Export

**As Student:**
1. Log in as a student
2. Navigate to `/complaints`

**Expected Results:**
- ✅ No "Export CSV" button is visible
- ✅ Only "New Complaint" button is shown

**As Lecturer:**
1. Log in as a lecturer
2. Navigate to `/complaints`

**Expected Results:**
- ✅ "Export CSV" button is visible
- ✅ Export includes all complaints (not just assigned ones)

**As Admin:**
1. Log in as an admin
2. Navigate to `/complaints`

**Expected Results:**
- ✅ "Export CSV" button is visible
- ✅ Export includes all complaints in the system

### Test 12: Assigned Lecturer Display

**Steps:**
1. Create complaints with different assignment states:
   - Unassigned complaint
   - Complaint assigned to a lecturer
   - Complaint assigned to an admin
2. Export the complaints
3. Check the "Assigned To" column

**Expected Results:**
- ✅ Unassigned complaints show "Unassigned"
- ✅ Assigned complaints show the lecturer/admin name
- ✅ Names are properly formatted

### Test 13: Escalation Data

**Steps:**
1. Create or find an escalated complaint
2. Export the complaints
3. Check the "Escalation Level" column

**Expected Results:**
- ✅ Non-escalated complaints show `0`
- ✅ Escalated complaints show the correct level (1, 2, 3, etc.)
- ✅ Escalation level is a number, not text

### Test 14: Draft Complaints

**Steps:**
1. Create a draft complaint
2. As a lecturer, export all complaints
3. Check the "Is Draft" column

**Expected Results:**
- ✅ Draft complaints show "Yes" in the Is Draft column
- ✅ Submitted complaints show "No"
- ✅ Draft status is clearly indicated

## Browser Compatibility Tests

Test the export functionality in different browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Opera (latest)

**Expected Results:**
- ✅ Export works in all browsers
- ✅ File downloads correctly
- ✅ No console errors

## Spreadsheet Application Tests

Open the exported CSV in different applications:

- [ ] Microsoft Excel
- [ ] Google Sheets
- [ ] LibreOffice Calc
- [ ] Apple Numbers

**Expected Results:**
- ✅ File opens without errors
- ✅ All columns are properly separated
- ✅ Special characters display correctly
- ✅ Dates are recognized as dates (if applicable)

## Common Issues and Solutions

### Issue: CSV opens with garbled text

**Solution:** The file encoding might not be recognized. Try:
1. Open the file in a text editor
2. Save with UTF-8 encoding
3. Re-open in spreadsheet application

### Issue: All data appears in one column

**Solution:** The spreadsheet application might not recognize commas as delimiters. Try:
1. Use "Import" or "Open" with delimiter options
2. Specify comma as the delimiter
3. Ensure proper CSV import settings

### Issue: Quotes appear doubled

**Solution:** This is correct CSV escaping. The spreadsheet application should handle this automatically. If not:
1. Check the import settings
2. Ensure "Text qualifier" is set to double quote (")

### Issue: Dates not recognized

**Solution:** Date format might not match locale settings. Try:
1. Select the date column
2. Format as "Date" or "Date/Time"
3. Adjust format to match your locale

## Checklist Summary

After completing all tests, verify:

- [ ] Export button appears for lecturers and admins only
- [ ] Export includes all filtered complaints
- [ ] File naming is correct and includes filters
- [ ] All 16 columns are present with correct headers
- [ ] Special characters are properly escaped
- [ ] HTML tags are stripped from descriptions
- [ ] Anonymous complaints are properly marked
- [ ] Tags are semicolon-separated
- [ ] Dates are consistently formatted
- [ ] Empty exports are handled gracefully
- [ ] Large datasets export successfully
- [ ] Works in all major browsers
- [ ] Opens correctly in spreadsheet applications

## Reporting Issues

If you encounter any issues during testing:

1. Note the specific test scenario
2. Capture screenshots if applicable
3. Check browser console for errors
4. Document the expected vs. actual behavior
5. Report to the development team

## Conclusion

The CSV export feature should provide a reliable, user-friendly way to export complaint data for analysis and reporting. All tests should pass without issues.
