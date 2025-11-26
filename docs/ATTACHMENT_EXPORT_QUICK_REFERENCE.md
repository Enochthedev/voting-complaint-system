# Attachment Export - Quick Reference

## Quick Start

### Export Single Complaint Attachments

```typescript
import { exportComplaintAttachments } from '@/lib/export';

// Export all attachments for a complaint
await exportComplaintAttachments(
  complaintId,
  attachments,
  (current, total) => {
    console.log(`Downloading ${current}/${total}`);
  }
);
```

### Export Complete Package (PDF + Attachments)

```typescript
import { exportSingleComplaintWithAttachments } from '@/lib/export';

await exportSingleComplaintWithAttachments(complaint, {
  includeAttachments: true,
  includePDFs: true,
  includeCSV: false,
});
```

### Bulk Export with Attachments

```typescript
import { bulkExportComplaints } from '@/lib/export';

await bulkExportComplaints(complaints, {
  includeAttachments: true,
  includePDFs: true,
  includeCSV: true,
  onProgress: (current, total, message) => {
    setProgress(message);
  }
});
```

## UI Components

### Export Button with Dropdown

```tsx
import { ExportComplaintButton } from '@/components/complaints/export-complaint-button';

// With dropdown menu (shows all options)
<ExportComplaintButton complaint={complaint} />

// Simple button (PDF only)
<ExportComplaintButton 
  complaint={complaint} 
  showDropdown={false} 
/>
```

### Bulk Action Bar with Attachments

```tsx
import { BulkActionBar } from '@/components/complaints/bulk-action-bar';

<BulkActionBar
  selectedCount={selectedIds.size}
  totalCount={complaints.length}
  isExporting={isExporting}
  onExport={handleExportCSV}
  onExportWithAttachments={handleExportWithAttachments}
  hasAttachments={hasAttachments}
  onSelectAll={handleSelectAll}
  onClearSelection={handleClearSelection}
/>
```

## Export Options

### BulkExportOptions Interface

```typescript
interface BulkExportOptions {
  includeAttachments?: boolean;  // Include attachment files
  includePDFs?: boolean;         // Include PDF reports
  includeCSV?: boolean;          // Include CSV summary
  onProgress?: (current: number, total: number, message: string) => void;
}
```

## File Structure

### Single Complaint Export

```
complaint_[id]_attachments_[timestamp].zip
└── complaint_[id]_attachments/
    ├── file1.pdf
    ├── file2.jpg
    └── file3.docx
```

### Complete Package Export

```
complaint_[id]_[timestamp].zip
├── README.txt
├── complaint_[id]_[title].pdf
└── attachments/
    ├── file1.pdf
    └── file2.jpg
```

### Bulk Export

```
complaints_bulk_export_[timestamp].zip
├── README.txt
├── complaints_export.csv
├── pdfs/
│   ├── complaint_1_title.pdf
│   └── complaint_2_title.pdf
└── attachments/
    ├── complaint_1_title/
    │   └── file1.pdf
    └── complaint_2_title/
        └── file2.jpg
```

## Common Patterns

### With Progress Tracking

```typescript
const [progress, setProgress] = useState('');

await bulkExportComplaints(complaints, {
  includeAttachments: true,
  onProgress: (current, total, message) => {
    setProgress(`${current}/${total}: ${message}`);
  }
});
```

### With Error Handling

```typescript
try {
  await exportComplaintAttachments(id, attachments);
} catch (error) {
  console.error('Export failed:', error);
  toast.error('Failed to export attachments');
}
```

### Check for Attachments

```typescript
const hasAttachments = complaint.attachments && 
                       complaint.attachments.length > 0;

if (hasAttachments) {
  // Show attachment export options
}
```

## API Reference

### exportComplaintAttachments()

Downloads all attachments for a complaint as ZIP.

**Parameters:**
- `complaintId: string` - The complaint ID
- `attachments: ComplaintAttachment[]` - Array of attachments
- `onProgress?: (current: number, total: number) => void` - Progress callback

**Returns:** `Promise<void>`

### exportSingleComplaintWithAttachments()

Exports a complaint with PDF and attachments.

**Parameters:**
- `complaint: ComplaintWithDetails` - The complaint data
- `options: BulkExportOptions` - Export options

**Returns:** `Promise<void>`

### bulkExportComplaints()

Exports multiple complaints with optional attachments.

**Parameters:**
- `complaints: ComplaintWithDetails[]` - Array of complaints
- `options: BulkExportOptions` - Export options

**Returns:** `Promise<void>`

### downloadAttachmentForExport()

Downloads a single attachment as blob.

**Parameters:**
- `attachment: ComplaintAttachment` - The attachment metadata

**Returns:** `Promise<Blob | null>`

## Tips & Best Practices

### Performance

- Use progress callbacks for large exports
- Consider file size limits (browser memory)
- Sequential downloads prevent overwhelming the browser

### User Experience

- Show progress indicators for long operations
- Provide clear error messages
- Disable buttons during export
- Auto-clear selection after export

### Error Handling

- Individual file failures don't stop entire export
- Log errors to console for debugging
- Show user-friendly error messages
- Retry failed downloads if needed

### Security

- Attachments respect RLS policies
- Signed URLs expire after 1 hour
- File names are sanitized
- No path traversal vulnerabilities

## Troubleshooting

### Export Fails

1. Check browser console for errors
2. Verify attachment permissions
3. Check network connectivity
4. Verify Supabase Storage configuration

### Large Files

1. Increase timeout if needed
2. Consider batch processing
3. Show estimated time to user
4. Allow cancellation for long exports

### Memory Issues

1. Reduce number of concurrent downloads
2. Process in smaller batches
3. Clear blobs after use
4. Monitor browser memory usage

## Dependencies

- `jszip` - ZIP file creation
- `jspdf` - PDF generation
- Supabase Storage - File storage
- Browser File API - Downloads

## Related Documentation

- [Full Implementation Guide](./ATTACHMENT_EXPORT_IMPLEMENTATION.md)
- [Bulk Export Guide](./BULK_EXPORT_QUICK_REFERENCE.md)
- [CSV Export Guide](./CSV_EXPORT_QUICK_REFERENCE.md)
- [PDF Export Guide](./PDF_EXPORT_IMPLEMENTATION.md)

## Support

For issues or questions:
1. Check implementation documentation
2. Review code examples
3. Check browser console for errors
4. Verify Supabase configuration
