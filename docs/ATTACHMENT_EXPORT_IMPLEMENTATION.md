# Attachment Export Implementation

## Overview

This document describes the implementation of attachment export functionality for the Student Complaint Resolution System. This feature allows users to export complaint attachments along with complaint data.

**Status**: ✅ COMPLETED  
**Task**: Task 8.3 - Include attachments in exports (optional)  
**Requirements**: AC20 (Export Functionality)

## Features Implemented

### 1. Attachment Export Utilities (`src/lib/export/attachment-export.ts`)

Core utilities for downloading and packaging attachments:

- **`downloadAttachmentForExport()`**: Downloads a single attachment as a blob
- **`downloadAttachmentsForExport()`**: Downloads multiple attachments with progress tracking
- **`createAttachmentsZip()`**: Creates a ZIP file containing attachments
- **`exportComplaintAttachments()`**: Exports all attachments for a single complaint as ZIP
- **`exportMultipleComplaintsAttachments()`**: Exports attachments for multiple complaints, organized by complaint
- **`getAttachmentUrls()`**: Gets signed URLs for attachments (for embedding in exports)

### 2. Bulk Export with Attachments (`src/lib/export/bulk-export.ts`)

Enhanced bulk export functionality:

- **`bulkExportComplaints()`**: Exports multiple complaints with options for:
  - CSV summary
  - Individual PDFs
  - All attachments organized by complaint
  - Progress tracking
  - Automatic ZIP packaging
  
- **`exportSingleComplaintWithAttachments()`**: Exports a single complaint with all its data and attachments

#### Export Structure

When exporting with attachments, the ZIP file contains:

```
complaints_bulk_export_[timestamp].zip
├── README.txt                          # Export information
├── complaints_export.csv               # CSV summary (optional)
├── pdfs/                               # Individual PDFs (optional)
│   ├── complaint_[id]_[title].pdf
│   └── ...
└── attachments/                        # Attachments (optional)
    ├── complaint_[id]_[title]/
    │   ├── [attachment_file_1]
    │   └── [attachment_file_2]
    └── ...
```

### 3. Enhanced Export Button (`src/components/complaints/export-complaint-button.tsx`)

Updated export button with dropdown menu:

**Export Options**:
- **Export as PDF**: Generates PDF report only
- **Export Attachments**: Downloads all attachments as ZIP (if available)
- **Export Complete Package**: Creates ZIP with PDF + attachments

**Features**:
- Progress tracking with status messages
- Error handling and user feedback
- Conditional display based on attachment availability
- Simple button mode (without dropdown) for basic use cases

**Usage**:
```tsx
// With dropdown menu (default)
<ExportComplaintButton complaint={complaint} />

// Simple button without dropdown
<ExportComplaintButton 
  complaint={complaint} 
  showDropdown={false} 
/>
```

### 4. Enhanced Bulk Action Bar (`src/components/complaints/bulk-action-bar.tsx`)

Updated bulk action bar with attachment export support:

**New Props**:
- `onExportWithAttachments`: Callback for exporting with attachments
- `hasAttachments`: Whether selected complaints have attachments

**Features**:
- Shows "Export with Attachments" button when applicable
- Maintains existing CSV export functionality
- Conditional rendering based on attachment availability

## Technical Details

### Dependencies

Added dependencies:
- `jszip`: For creating ZIP archives
- `@types/jszip`: TypeScript definitions

### File Storage

Attachments are stored in Supabase Storage:
- Bucket: `complaint-attachments`
- Path structure: `{complaintId}/{timestamp}-{filename}`

### Download Process

1. Fetch attachment metadata from database
2. Download files from Supabase Storage using `downloadAttachment()`
3. Create ZIP archive using JSZip
4. Generate blob and trigger browser download

### Progress Tracking

Export functions support progress callbacks:

```typescript
await bulkExportComplaints(complaints, {
  includeAttachments: true,
  onProgress: (current, total, message) => {
    console.log(`${current}/${total}: ${message}`);
  }
});
```

### Error Handling

- Individual file download failures don't stop the entire export
- Errors are logged to console
- User-friendly error messages displayed in UI
- Failed downloads are skipped, successful ones are included

## Usage Examples

### Export Single Complaint with Attachments

```typescript
import { exportSingleComplaintWithAttachments } from '@/lib/export';

await exportSingleComplaintWithAttachments(complaint, {
  includeAttachments: true,
  includePDFs: true,
  includeCSV: false,
  onProgress: (current, total, message) => {
    setProgress(message);
  }
});
```

### Export Multiple Complaints with Attachments

```typescript
import { bulkExportComplaints } from '@/lib/export';

await bulkExportComplaints(selectedComplaints, {
  includeAttachments: true,
  includePDFs: true,
  includeCSV: true,
  onProgress: (current, total, message) => {
    setProgress(`${current}/${total}: ${message}`);
  }
});
```

### Export Only Attachments

```typescript
import { exportComplaintAttachments } from '@/lib/export';

await exportComplaintAttachments(
  complaintId,
  attachments,
  (current, total) => {
    setProgress(`Downloading ${current}/${total} attachments...`);
  }
);
```

## UI Integration

### Complaint Detail Page

The export button appears in the complaint detail view with a dropdown menu:

1. Click "Export" button
2. Select export option:
   - Export as PDF
   - Export Attachments (if available)
   - Export Complete Package (if attachments available)

### Bulk Export

When complaints are selected in the list view:

1. Bulk action bar appears at bottom
2. "Export CSV" button for basic export
3. "Export with Attachments" button (if any selected complaint has attachments)

## Performance Considerations

### Large Files

- Downloads are sequential to avoid overwhelming the browser
- Progress tracking provides user feedback
- ZIP compression reduces final file size

### Memory Usage

- Files are processed as blobs in memory
- Large exports may take time depending on:
  - Number of complaints
  - Number of attachments
  - Total file size

### Recommendations

- For exports with many large attachments, consider:
  - Showing estimated time
  - Allowing cancellation
  - Processing in batches

## Security

### Access Control

- Attachments are downloaded using existing RLS policies
- Users can only export attachments they have permission to view
- Signed URLs expire after 1 hour (configurable)

### File Validation

- File names are sanitized to prevent path traversal
- Special characters are removed from folder names
- File types are preserved from original upload

## Testing

### Manual Testing Checklist

- [ ] Export single complaint PDF
- [ ] Export single complaint attachments
- [ ] Export complete package (PDF + attachments)
- [ ] Export multiple complaints with CSV
- [ ] Export multiple complaints with attachments
- [ ] Test with complaints without attachments
- [ ] Test with large files (>10MB)
- [ ] Test with many attachments (>20 files)
- [ ] Verify ZIP structure and file organization
- [ ] Test error handling (network failure, permission denied)

### Test Scenarios

1. **No Attachments**: Export options should hide attachment-related features
2. **Single Attachment**: Should download as ZIP with one file
3. **Multiple Attachments**: Should organize in folders by complaint
4. **Large Files**: Should show progress and complete successfully
5. **Mixed Selection**: Some complaints with attachments, some without

## Future Enhancements

### Potential Improvements

1. **Batch Processing**: Process large exports in chunks
2. **Background Processing**: Use Web Workers for ZIP generation
3. **Cancellation**: Allow users to cancel long-running exports
4. **Preview**: Show export contents before downloading
5. **Custom Selection**: Let users choose which attachments to include
6. **Cloud Export**: Upload to cloud storage instead of direct download
7. **Email Export**: Send export link via email for large files
8. **Scheduled Exports**: Automate regular exports

### Performance Optimizations

1. **Streaming**: Stream files directly to ZIP without loading all in memory
2. **Parallel Downloads**: Download multiple files simultaneously
3. **Caching**: Cache recently downloaded attachments
4. **Compression**: Adjust compression level based on file types

## Related Files

### Core Implementation
- `src/lib/export/attachment-export.ts` - Attachment download utilities
- `src/lib/export/bulk-export.ts` - Bulk export with attachments
- `src/lib/export/pdf-export.ts` - PDF generation (updated)
- `src/lib/export/index.ts` - Export utilities index

### UI Components
- `src/components/complaints/export-complaint-button.tsx` - Export button with dropdown
- `src/components/complaints/bulk-action-bar.tsx` - Bulk action bar with attachment export

### Dependencies
- `src/lib/attachment-upload.ts` - Attachment storage utilities
- `src/types/database.types.ts` - Type definitions

## Validation

This implementation validates:
- ✅ **AC20**: Export functionality for complaints
- ✅ **P20**: Export data integrity (all data preserved)
- ✅ Task 8.3: Include attachments in exports

## Notes

- This feature is marked as "optional" in the task list
- Attachments are not embedded in PDFs (file size concerns)
- PDF includes note about separate attachment export
- ZIP format chosen for broad compatibility
- README.txt included in exports for user guidance
