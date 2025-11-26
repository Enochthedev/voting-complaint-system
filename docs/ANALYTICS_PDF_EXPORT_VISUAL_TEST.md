# Analytics PDF Export - Visual Test Guide

## Purpose
This guide helps you verify that the analytics PDF export functionality works correctly and produces a professional, well-formatted document.

## Prerequisites
- Logged in as a lecturer or admin user
- Analytics page accessible at `/analytics`

## Test Steps

### Step 1: Access Analytics Page
1. Navigate to `/analytics`
2. **Expected**: Analytics dashboard loads with charts and data
3. **Verify**: "Export Report" button is visible in the top-right corner

### Step 2: Open Export Menu
1. Click the "Export Report" button
2. **Expected**: Dropdown menu appears with three options:
   - Export as CSV
   - Export as JSON
   - Export as PDF
3. **Verify**: All three options are visible and clickable

### Step 3: Export PDF
1. Click "Export as PDF" from the dropdown
2. **Expected**: 
   - PDF file downloads automatically
   - File name format: `analytics-report-YYYY-MM-DD.pdf`
   - No errors in browser console
3. **Verify**: PDF file appears in your downloads folder

### Step 4: Open and Review PDF

#### 4.1 Header Section
**Expected Content:**
- Large title: "Analytics Report"
- Blue horizontal line below title
- Period information (e.g., "Period: Last 30 days")
- Generation timestamp (e.g., "Generated: 11/25/2025, 10:30:00 AM")

**Visual Check:**
- [ ] Title is bold and prominent
- [ ] Blue line is visible and spans the width
- [ ] Metadata is in gray text
- [ ] Proper spacing between elements

#### 4.2 Key Metrics Section
**Expected Content:**
- Section title: "Key Metrics"
- Table with 3 columns: Metric, Value, Change
- 5 rows of data:
  1. Total Complaints
  2. Avg Response Time
  3. Resolution Rate
  4. Active Cases
  5. Satisfaction Rating

**Visual Check:**
- [ ] Table header has blue background
- [ ] White text on blue header
- [ ] Grid lines are visible
- [ ] Values are centered
- [ ] Change indicators show + or - symbols
- [ ] Proper cell padding

#### 4.3 Complaints by Status Section
**Expected Content:**
- Section title: "Complaints by Status"
- Table with 3 columns: Status, Count, Percentage
- Multiple rows showing different statuses (New, Opened, In Progress, Resolved, Closed)

**Visual Check:**
- [ ] Striped rows (alternating colors)
- [ ] Blue header row
- [ ] Numeric values are centered
- [ ] Percentages include % symbol
- [ ] Status names are capitalized

#### 4.4 Complaints by Category Section
**Expected Content:**
- Section title: "Complaints by Category"
- Table with 3 columns: Category, Count, Percentage
- Multiple rows showing categories (Academic, Facilities, etc.)

**Visual Check:**
- [ ] Striped rows
- [ ] Blue header row
- [ ] Categories are properly formatted
- [ ] Counts and percentages align correctly

#### 4.5 Complaints by Priority Section
**Expected Content:**
- Section title: "Complaints by Priority"
- Table with 3 columns: Priority, Count, Percentage
- 4 rows: Critical, High, Medium, Low

**Visual Check:**
- [ ] Striped rows
- [ ] Blue header row
- [ ] Priority levels are capitalized
- [ ] Data is properly aligned

#### 4.6 Complaints Over Time Section
**Expected Content:**
- Section title: "Complaints Over Time"
- Bar chart visualization showing daily trends
- Summary statistics below chart (Daily Average, Peak Day)

**Visual Check:**
- [ ] Chart has gray background
- [ ] Blue bars are visible
- [ ] Bars have varying heights based on data
- [ ] Y-axis labels (0 and max value) are visible
- [ ] Summary statistics are displayed below chart
- [ ] Text is readable

#### 4.7 Lecturer Performance Section
**Expected Content:**
- Section title: "Lecturer Performance"
- Table with 5 columns: Name, Handled, Avg Response, Resolution Rate, Rating
- Multiple rows showing lecturer data

**Visual Check:**
- [ ] Striped rows
- [ ] Blue header row
- [ ] Names are left-aligned
- [ ] Numeric values are centered
- [ ] Ratings show "/5.0" format
- [ ] Resolution rates show "%" symbol

#### 4.8 Top Complaint Types Section
**Expected Content:**
- Section title: "Top Complaint Types"
- Table with 3 columns: Rank, Type, Count
- 5 rows showing top complaint types

**Visual Check:**
- [ ] Striped rows
- [ ] Blue header row
- [ ] Ranks are numbered 1-5
- [ ] Ranks are centered
- [ ] Type descriptions are readable
- [ ] Counts are centered

#### 4.9 Footer (All Pages)
**Expected Content:**
- Left: "Student Complaint Resolution System"
- Center: "Page X of Y"
- Right: "Generated: MM/DD/YYYY"

**Visual Check:**
- [ ] Footer appears on every page
- [ ] Text is in gray color
- [ ] Page numbers are correct
- [ ] Footer text is small but readable
- [ ] Proper alignment (left, center, right)

### Step 5: Multi-Page Verification
If the PDF has multiple pages:

1. **Check Page Breaks**
   - [ ] No content is cut off mid-sentence
   - [ ] Tables don't break awkwardly
   - [ ] Sections start on appropriate pages
   - [ ] Consistent margins on all pages

2. **Check Page Numbers**
   - [ ] Page 1 shows "Page 1 of X"
   - [ ] Last page shows "Page X of X"
   - [ ] All intermediate pages have correct numbers

3. **Check Consistency**
   - [ ] Header style is consistent (if headers repeat)
   - [ ] Font sizes are consistent
   - [ ] Margins are consistent
   - [ ] Footer appears on all pages

### Step 6: Test Different Time Periods

1. **7 Days Period**
   - Select "7 Days" from the time period selector
   - Export PDF
   - **Verify**: PDF shows "Period: Last 7 days"

2. **30 Days Period**
   - Select "30 Days" from the time period selector
   - Export PDF
   - **Verify**: PDF shows "Period: Last 30 days"

3. **90 Days Period**
   - Select "90 Days" from the time period selector
   - Export PDF
   - **Verify**: PDF shows "Period: Last 90 days"

4. **Custom Period**
   - Select "Custom" from the time period selector
   - Choose start and end dates
   - Apply the date range
   - Export PDF
   - **Verify**: PDF shows "Period: MM/DD/YYYY - MM/DD/YYYY"

### Step 7: Compare with Dashboard

1. Open the PDF and the analytics dashboard side-by-side
2. **Verify** that the following match:
   - [ ] Total complaints count
   - [ ] Average response time
   - [ ] Resolution rate
   - [ ] Satisfaction rating
   - [ ] Status distribution counts
   - [ ] Category distribution counts
   - [ ] Priority distribution counts
   - [ ] Lecturer performance metrics
   - [ ] Top complaint types

## Common Issues and Solutions

### Issue 1: PDF Doesn't Download
**Symptoms**: Clicking "Export as PDF" does nothing
**Check**:
- Browser console for errors
- Pop-up blocker settings
- Browser download settings

### Issue 2: Content Overlaps or Is Cut Off
**Symptoms**: Text overlaps or disappears at page boundaries
**Check**:
- Page break logic in code
- Margin calculations
- Content height calculations

### Issue 3: Tables Look Misaligned
**Symptoms**: Table columns don't line up properly
**Check**:
- Column width settings in autoTable
- Cell padding values
- Text alignment settings

### Issue 4: Charts Don't Appear
**Symptoms**: Chart section is blank or shows errors
**Check**:
- Data array is not empty
- Max value calculation is correct
- Rectangle drawing coordinates

### Issue 5: Footer Missing on Some Pages
**Symptoms**: Footer doesn't appear on all pages
**Check**:
- Loop through all pages in footer code
- Page number calculation
- Footer positioning

## Success Criteria

The PDF export is working correctly if:

✅ PDF downloads automatically with correct filename
✅ All sections are present and properly formatted
✅ Tables have blue headers and striped rows
✅ Charts are visible and represent data accurately
✅ Page breaks occur naturally without cutting content
✅ Footer appears on all pages with correct page numbers
✅ Data matches the analytics dashboard
✅ Text is readable and properly aligned
✅ No overlapping or cut-off content
✅ Professional appearance suitable for sharing

## Notes

- The PDF uses mock data during the UI-first development phase
- In Phase 12, the data will be connected to real Supabase queries
- The PDF format is designed to be printer-friendly
- File size should be reasonable (typically < 1MB for standard reports)

## Related Documentation

- [Analytics PDF Export Implementation](./ANALYTICS_PDF_EXPORT_IMPLEMENTATION.md)
- [CSV Export Implementation](./CSV_EXPORT_IMPLEMENTATION.md)
- [PDF Export Implementation](./PDF_EXPORT_IMPLEMENTATION.md)
