# CSV Export - Quick Reference

## For Developers

### Import the Export Function

```typescript
import { exportComplaintsToCSV } from '@/lib/export';
```

### Basic Usage

```typescript
// Export complaints with default fields
const complaints = [/* array of complaints */];
exportComplaintsToCSV(complaints);
```

### Custom Filename

```typescript
// Specify a custom filename
exportComplaintsToCSV(complaints, 'my_export.csv');
```

### Custom Fields

```typescript
import { exportComplaintsToCSVCustom } from '@/lib/export';

// Export only specific fields
const fields = {
  id: true,
  title: true,
  status: true,
  description: false, // Exclude description
};

exportComplaintsToCSVCustom(complaints, fields, 'summary.csv');
```

### Data Structure

Complaints should include:

```typescript
interface ComplaintWithDetails {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  student_id: string | null;
  is_anonymous: boolean;
  is_draft: boolean;
  description: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  opened_at: string | null;
  resolved_at: string | null;
  escalated_at: string | null;
  escalation_level: number;
  student?: { id: string; full_name: string; email: string } | null;
  assigned_user?: { id: string; full_name: string; email: string } | null;
  tags?: Array<{ id: string; complaint_id: string; tag_name: string; created_at: string }>;
}
```

## For Users

### How to Export

1. Navigate to the Complaints page
2. Apply any desired filters
3. Click "Export CSV" button
4. File downloads automatically

### What Gets Exported

- All complaints matching current filters
- All pages (not just current page)
- 16 columns of data
- Properly formatted CSV file

### File Location

The CSV file downloads to your browser's default download folder.

### Opening the File

- **Excel**: Double-click the file
- **Google Sheets**: File → Import → Upload
- **LibreOffice**: File → Open

## Common Use Cases

### Export All Complaints

1. Clear all filters
2. Click "Export CSV"

### Export by Status

1. Select status filter (e.g., "New", "Opened")
2. Click "Export CSV"
3. Filename includes status: `complaints_2024-11-25_new-opened.csv`

### Export by Date Range

1. Set "Date From" and "Date To" filters
2. Click "Export CSV"
3. Only complaints in date range are exported

### Export Assigned Complaints

1. Select assigned lecturer from filter
2. Click "Export CSV"
3. Only assigned complaints are exported

## Troubleshooting

### File Won't Open

**Problem**: CSV opens with garbled text

**Solution**: 
- Open in text editor
- Save with UTF-8 encoding
- Re-open in spreadsheet app

### All Data in One Column

**Problem**: Data not separated into columns

**Solution**:
- Use Import function in spreadsheet app
- Set delimiter to "comma"
- Ensure proper import settings

### Special Characters Look Wrong

**Problem**: Quotes or commas display incorrectly

**Solution**:
- This is normal CSV escaping
- Spreadsheet app should handle automatically
- Check import settings if issues persist

## Tips

- **Filter first, then export** - Only export what you need
- **Use descriptive filenames** - Helps organize exports
- **Check file size** - Large exports may take a moment
- **Verify data** - Always spot-check exported data

## Limitations

- No attachment files (only metadata)
- No comments or feedback
- No history/timeline
- Client-side only (browser-based)

## Support

For issues or questions:
1. Check the visual test guide
2. Review implementation documentation
3. Contact development team

---

**Quick Links:**
- [Implementation Details](./CSV_EXPORT_IMPLEMENTATION.md)
- [Visual Test Guide](./CSV_EXPORT_VISUAL_TEST.md)
- [Completion Summary](./TASK_8.3_CSV_EXPORT_COMPLETION.md)
