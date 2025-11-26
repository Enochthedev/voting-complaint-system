# CSV Export Implementation

## Overview

This document describes the CSV export functionality for complaint lists, implemented as part of Task 8.3.

## Features

### 1. Export All Filtered Complaints

The CSV export feature allows users to export all complaints that match the current filters to a CSV file. This includes:

- All complaints visible based on user role (students see their own, lecturers/admins see all)
- Complaints filtered by status, category, priority, date range, tags, and assigned lecturer
- All complaints, not just the current page

### 2. CSV Format

The exported CSV file includes the following columns:

| Column | Description |
|--------|-------------|
| ID | Unique complaint identifier |
| Title | Complaint title |
| Status | Current status (New, Opened, In Progress, Resolved, etc.) |
| Priority | Priority level (Low, Medium, High, Critical) |
| Category | Complaint category (Academic, Facilities, etc.) |
| Submitted By | Student name or "Anonymous" |
| Assigned To | Assigned lecturer/admin name or "Unassigned" |
| Tags | Semicolon-separated list of tags |
| Created Date | Date and time complaint was created |
| Updated Date | Date and time complaint was last updated |
| Opened Date | Date and time complaint was opened (if applicable) |
| Resolved Date | Date and time complaint was resolved (if applicable) |
| Escalation Level | Current escalation level (0 if not escalated) |
| Is Anonymous | Yes/No indicator |
| Is Draft | Yes/No indicator |
| Description | Complaint description (HTML tags stripped) |

### 3. CSV Special Character Handling

The export utility properly handles CSV special characters:

- **Quotes**: Double quotes are escaped by doubling them (`"` becomes `""`)
- **Commas**: Fields containing commas are wrapped in quotes
- **Newlines**: Fields containing newlines are wrapped in quotes
- **HTML**: HTML tags are stripped from the description field

### 4. File Naming

Exported files are automatically named with:
- Current date (YYYY-MM-DD format)
- Active status filters (if any)
- Timestamp for uniqueness

Example: `complaints_2024-11-25_new-opened.csv`

## Usage

### For Lecturers and Admins

1. Navigate to the Complaints page
2. Apply any desired filters (status, category, priority, etc.)
3. Click the "Export CSV" button in the header
4. The CSV file will be automatically downloaded to your browser's download folder

### For Students

Students see a "New Complaint" button instead of the export button, as they typically only need to view their own complaints.

## Implementation Details

### Files Created/Modified

1. **`src/lib/export/csv-export.ts`** (NEW)
   - Core CSV export utility functions
   - `exportComplaintsToCSV()`: Export with all default fields
   - `exportComplaintsToCSVCustom()`: Export with custom field selection
   - Helper functions for formatting and escaping

2. **`src/lib/export/index.ts`** (NEW)
   - Export utilities index file
   - Centralizes exports for easy importing

3. **`src/components/complaints/complaints-header.tsx`** (MODIFIED)
   - Added `onExportCSV` callback prop
   - Added `isExporting` state prop
   - Added "Export CSV" button with loading state

4. **`src/app/complaints/page.tsx`** (MODIFIED)
   - Added `isExporting` state
   - Added `handleExportCSV()` function
   - Integrated export button with header component

5. **`src/lib/export/__tests__/csv-export.test.ts`** (NEW)
   - Unit tests for CSV export functionality
   - Tests for special character escaping
   - Tests for HTML stripping
   - Tests for anonymous complaints
   - Tests for tag handling

### Key Functions

#### `exportComplaintsToCSV(complaints, filename?)`

Exports a list of complaints to CSV format with all default fields.

**Parameters:**
- `complaints`: Array of complaint objects with details
- `filename` (optional): Custom filename for the export

**Example:**
```typescript
import { exportComplaintsToCSV } from '@/lib/export';

const complaints = [/* ... */];
exportComplaintsToCSV(complaints, 'my_complaints.csv');
```

#### `exportComplaintsToCSVCustom(complaints, fields, filename?)`

Exports complaints with custom field selection.

**Parameters:**
- `complaints`: Array of complaint objects
- `fields`: Object specifying which fields to include
- `filename` (optional): Custom filename

**Example:**
```typescript
import { exportComplaintsToCSVCustom } from '@/lib/export';

const complaints = [/* ... */];
const fields = {
  id: true,
  title: true,
  status: true,
  description: false, // Exclude description
};

exportComplaintsToCSVCustom(complaints, fields, 'summary.csv');
```

## Data Integrity

The CSV export maintains data integrity by:

1. **Preserving all data**: All complaint information is accurately exported
2. **Proper escaping**: Special characters are properly escaped to prevent CSV parsing errors
3. **Consistent formatting**: Dates and enums are formatted consistently
4. **HTML stripping**: HTML tags are removed from rich text fields to ensure clean CSV data

## Future Enhancements

Potential improvements for future iterations:

1. **Custom field selection UI**: Allow users to choose which columns to export
2. **Export format options**: Support for Excel (.xlsx) format
3. **Bulk export with attachments**: Include attachment files in a ZIP archive
4. **Scheduled exports**: Automatic periodic exports via email
5. **Export templates**: Save and reuse export configurations
6. **Progress indicator**: Show progress for large exports
7. **Export history**: Track and manage previous exports

## Validation

The CSV export feature validates:

- **Requirements AC20**: Export Functionality ✅
- **Property P20**: Export Data Integrity ✅

## Testing

To test the CSV export functionality:

1. Navigate to `/complaints` as a lecturer or admin
2. Apply various filters (status, category, priority, etc.)
3. Click "Export CSV"
4. Verify the downloaded file:
   - Opens correctly in Excel/Google Sheets
   - Contains all filtered complaints
   - Special characters are properly escaped
   - HTML tags are stripped from descriptions
   - Dates are formatted correctly

## Browser Compatibility

The CSV export feature is compatible with:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

The feature uses standard Web APIs:
- `Blob` for file creation
- `URL.createObjectURL()` for download links
- `document.createElement()` for triggering downloads

## Performance Considerations

- **Large datasets**: The export handles large complaint lists efficiently
- **Memory usage**: CSV generation is done in-memory, suitable for typical complaint volumes
- **Download speed**: Depends on browser and file size, typically instant for <1000 complaints

## Security Considerations

- **Data privacy**: Anonymous complaints are properly marked as "Anonymous"
- **Role-based filtering**: Users only export complaints they have permission to view
- **No sensitive data**: Email addresses and internal notes are not included in the export
- **Client-side processing**: All CSV generation happens in the browser, no server-side storage

## Conclusion

The CSV export feature provides a robust, user-friendly way to export complaint data for analysis, reporting, and record-keeping purposes. It maintains data integrity while properly handling edge cases and special characters.
